import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';

export const activityRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// GET /api/activity/history
activityRouter.get('/history', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const activities = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ?
      ORDER BY planned_date DESC
      LIMIT 30
    `).all(userId);

    return res.json({ activities });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/activity/complete
activityRouter.post('/complete', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { activity_id } = req.body;
    const today = new Date().toISOString().split('T')[0];

    let target = activity_id
      ? db.prepare('SELECT * FROM activity_history WHERE id = ? AND user_id = ?').get(activity_id, userId) as any
      : db.prepare(`
          SELECT * FROM activity_history
          WHERE user_id = ? AND planned_date = ?
          ORDER BY id DESC LIMIT 1
        `).get(userId, today) as any;

    if (!target) {
      const insert = db.prepare(`
        INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status, completed_at)
        VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'completed', CURRENT_TIMESTAMP)
      `).run(userId, today);
      target = db.prepare('SELECT * FROM activity_history WHERE id = ?').get(Number(insert.lastInsertRowid)) as any;
    } else {
      db.prepare(`
        UPDATE activity_history
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(target.id);
    }

    // Completing normal activity keeps risk low
    db.prepare(`
      UPDATE risk_states
      SET risk_score = MAX(0, risk_score - 15),
          app_mode = CASE WHEN risk_score <= 15 THEN 'normal' ELSE app_mode END,
          reason_summary = 'Activity completed today. Great job keeping the rhythm!',
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(userId);

    const updated = db.prepare('SELECT * FROM activity_history WHERE id = ?').get(target.id);
    const updatedRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);

    return res.json({
      activity: updated,
      riskState: updatedRisk,
      message: 'Great job! Activity marked as completed.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/activity/miss
activityRouter.post('/miss', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const today = new Date().toISOString().split('T')[0];

    let target = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ? AND planned_date = ?
      ORDER BY id DESC LIMIT 1
    `).get(userId, today) as any;

    if (!target) {
      const insert = db.prepare(`
        INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
        VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'missed')
      `).run(userId, today);
      target = db.prepare('SELECT * FROM activity_history WHERE id = ?').get(Number(insert.lastInsertRowid)) as any;
    } else {
      db.prepare(`
        UPDATE activity_history
        SET status = 'missed'
        WHERE id = ?
      `).run(target.id);
    }

    return res.json({
      activity: target,
      message: 'Activity marked as missed. No worries, we can adapt.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

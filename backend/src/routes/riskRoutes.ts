import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';
import { calculateRisk } from '../services/riskService.js';
import { BarrierType, ActivityHistoryItem } from '../types/index.js';

export const riskRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// GET /api/risk/current
riskRouter.get('/current', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    let state = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);

    if (!state) {
      db.prepare(`
        INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, app_mode, reason_summary)
        VALUES (?, 0, 'low', 'other', 'normal', 'Routine is steady and consistent.')
      `).run(userId);
      state = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    }

    return res.json({ riskState: state });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/risk/evaluate
riskRouter.post('/evaluate', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { barrier_type, energy, mood, motivation } = req.body;

    const activities = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ?
      ORDER BY planned_date DESC
      LIMIT 14
    `).all(userId) as unknown as ActivityHistoryItem[];

    const barrier: BarrierType = barrier_type || 'other';
    const riskResult = calculateRisk(barrier, { energy, mood, motivation }, activities);

    db.prepare(`
      UPDATE risk_states
      SET risk_score = ?,
          risk_level = ?,
          barrier_type = ?,
          app_mode = ?,
          reason_summary = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(
      riskResult.score,
      riskResult.level,
      barrier,
      riskResult.mode,
      riskResult.summary,
      userId
    );

    const updated = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    return res.json({ riskState: updated, details: riskResult });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

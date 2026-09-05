import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';
import { AppMode, BarrierType, Intervention } from '../types/index.js';
import { getInterventionForBarrier } from '../services/interventionLibrary.js';

export const interventionRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// GET /api/interventions/current
interventionRouter.get('/current', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    let intervention = db.prepare(`
      SELECT * FROM interventions
      WHERE user_id = ? AND status IN ('suggested', 'started')
      ORDER BY created_at DESC
      LIMIT 1
    `).get(userId) as unknown as Intervention | undefined;

    const risk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId) as any;
    const barrier: BarrierType = risk?.barrier_type || 'other';
    const template = getInterventionForBarrier(barrier);

    if (!intervention && risk && risk.app_mode !== 'normal') {
      // Auto-create intervention matching barrier/mode
      const insert = db.prepare(`
        INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status)
        VALUES (?, ?, ?, ?, ?, ?, 'suggested')
      `).run(
        userId,
        barrier,
        template.intervention_type,
        template.title,
        template.description,
        template.duration_minutes
      );
      intervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(
        Number(insert.lastInsertRowid)
      ) as unknown as Intervention;
    }

    return res.json({
      intervention: intervention || null,
      alternatives: template.alternatives || []
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/interventions/start
interventionRouter.post('/start', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { intervention_id } = req.body;

    let targetId = intervention_id;
    if (!targetId) {
      const current = db.prepare(`
        SELECT id FROM interventions
        WHERE user_id = ? AND status = 'suggested'
        ORDER BY created_at DESC LIMIT 1
      `).get(userId) as any;
      if (current) targetId = current.id;
    }

    if (targetId) {
      db.prepare(`
        UPDATE interventions
        SET status = 'started'
        WHERE id = ? AND user_id = ?
      `).run(targetId, userId);

      const risk = db.prepare('SELECT app_mode FROM risk_states WHERE user_id = ?').get(userId) as any;
      db.prepare(`
        INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
        VALUES (?, ?, 'intervention_started', ?, ?)
      `).run(userId, targetId, risk?.app_mode || 'rescue', risk?.app_mode || 'rescue');
    }

    const updated = targetId
      ? db.prepare('SELECT * FROM interventions WHERE id = ?').get(targetId)
      : null;

    return res.json({ intervention: updated, message: 'Intervention started' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/interventions/complete
interventionRouter.post('/complete', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { intervention_id } = req.body;

    let target = intervention_id
      ? db.prepare('SELECT * FROM interventions WHERE id = ? AND user_id = ?').get(intervention_id, userId) as any
      : db.prepare(`
          SELECT * FROM interventions
          WHERE user_id = ? AND status IN ('suggested', 'started')
          ORDER BY created_at DESC LIMIT 1
        `).get(userId) as any;

    if (!target) {
      // Create and complete a fallback intervention
      const insert = db.prepare(`
        INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status, completed_at)
        VALUES (?, 'low_motivation', 'micro_starter', 'One-minute starter', 'Start for one minute; continuing is optional.', 1, 'completed', CURRENT_TIMESTAMP)
      `).run(userId);
      target = db.prepare('SELECT * FROM interventions WHERE id = ?').get(Number(insert.lastInsertRowid)) as any;
    } else {
      db.prepare(`
        UPDATE interventions
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(target.id);
    }

    // 1. Get current risk state
    const currentRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId) as any;
    const oldScore = currentRisk ? currentRisk.risk_score : 50;
    const oldMode: AppMode = currentRisk ? currentRisk.app_mode : 'rescue';

    // 2. Reduce risk score by 10 (minimum 0)
    const newScore = Math.max(0, oldScore - 10);
    const newLevel = newScore >= 60 ? 'high' : newScore >= 30 ? 'medium' : 'low';

    // 3. Mode transition: move high-risk users from rescue to light mode (or normal if low)
    let newMode: AppMode = 'light';
    if (newScore < 30) {
      newMode = 'normal';
    } else if (newScore < 60) {
      newMode = 'light';
    } else {
      // Even if score is still somewhat high, completing a rescue action steps down to light mode
      newMode = 'light';
    }

    db.prepare(`
      UPDATE risk_states
      SET risk_score = ?,
          risk_level = ?,
          app_mode = ?,
          reason_summary = 'Recent recovery action completed. Momentum restored.',
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(newScore, newLevel, newMode, userId);

    // 4. Create recovery event
    db.prepare(`
      INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
      VALUES (?, ?, 'intervention_completed', ?, ?)
    `).run(userId, target.id, oldMode, newMode);

    db.prepare(`
      INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
      VALUES (?, ?, 'user_returned', ?, ?)
    `).run(userId, target.id, oldMode, newMode);

    // 5. Add or mark an activity item for today as completed micro-session
    const today = new Date().toISOString().split('T')[0];
    const todayActivity = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ? AND planned_date = ?
    `).get(userId, today) as any;

    if (todayActivity) {
      db.prepare(`
        UPDATE activity_history
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(todayActivity.id);
    } else {
      db.prepare(`
        INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status, completed_at)
        VALUES (?, ?, 'recovery', ?, ?, 'gentle', 'completed', CURRENT_TIMESTAMP)
      `).run(userId, today, target.title || 'Micro-action reset', target.duration_minutes || 1);
    }

    const updatedIntervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(target.id);
    const updatedRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);

    return res.json({
      success: true,
      message: 'You returned today. Small actions still count.',
      recoveryMessage: 'You returned today.',
      intervention: updatedIntervention,
      riskState: updatedRisk,
      previousMode: oldMode,
      newMode
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/interventions/postpone
interventionRouter.post('/postpone', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { intervention_id } = req.body;

    let target = intervention_id
      ? db.prepare('SELECT * FROM interventions WHERE id = ? AND user_id = ?').get(intervention_id, userId) as any
      : db.prepare(`
          SELECT * FROM interventions
          WHERE user_id = ? AND status IN ('suggested', 'started')
          ORDER BY created_at DESC LIMIT 1
        `).get(userId) as any;

    if (target) {
      db.prepare(`
        UPDATE interventions
        SET status = 'postponed'
        WHERE id = ?
      `).run(target.id);

      const risk = db.prepare('SELECT app_mode FROM risk_states WHERE user_id = ?').get(userId) as any;
      db.prepare(`
        INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
        VALUES (?, ?, 'intervention_postponed', ?, ?)
      `).run(userId, target.id, risk?.app_mode || 'normal', risk?.app_mode || 'normal');
    }

    return res.json({
      success: true,
      message: 'Postponed for later. No rush; take your time.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/interventions/change
interventionRouter.post('/change', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { new_title, new_duration, new_description } = req.body;

    const currentRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId) as any;
    const barrier: BarrierType = currentRisk?.barrier_type || 'boredom';

    // Supersede current
    db.prepare(`
      UPDATE interventions
      SET status = 'skipped'
      WHERE user_id = ? AND status IN ('suggested', 'started')
    `).run(userId);

    const title = new_title || 'Upbeat walking with music';
    const duration = Number(new_duration) || 5;
    const desc = new_description || 'Choose a fresh track and move gently without pressure.';

    const insert = db.prepare(`
      INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status)
      VALUES (?, ?, 'alternative_choice', ?, ?, ?, 'suggested')
    `).run(userId, barrier, title, desc, duration);

    const newIntervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(
      Number(insert.lastInsertRowid)
    );

    return res.json({
      intervention: newIntervention,
      message: 'Switched to alternative activity.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

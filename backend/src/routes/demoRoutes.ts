import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';

export const demoRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// Reset demo user data
export function resetUserData(userId: number) {
  db.prepare('DELETE FROM checkins WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM recovery_events WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM interventions WHERE user_id = ?').run(userId);
  db.prepare('DELETE FROM activity_history WHERE user_id = ?').run(userId);

  db.prepare(`
    UPDATE profiles
    SET name = 'Alex Rivera',
        goal = 'Build consistency',
        experience_level = 'Beginner',
        preferred_time = 'Morning',
        communication_tone = 'Friendly',
        plan_paused = 0,
        quiet_hours_enabled = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);

  db.prepare(`
    UPDATE risk_states
    SET risk_score = 0,
        risk_level = 'low',
        barrier_type = 'other',
        confidence = 1.0,
        app_mode = 'normal',
        reason_summary = 'Routine is steady and consistent.',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);

  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'planned')
  `).run(userId, today);
}

// Load full 4-day demo progression
export function loadFullDemoData(userId: number, targetDay: number = 4) {
  resetUserData(userId);

  const today = new Date();
  const d3 = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const d2 = new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const d1 = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const tStr = today.toISOString().split('T')[0];

  // Day 1: Completed activity, low risk, Normal Mode
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status, completed_at)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'completed', CURRENT_TIMESTAMP)
  `).run(userId, d1);

  db.prepare(`
    INSERT INTO checkins (user_id, energy, mood, motivation, time_available, workout_completed, reason, support_needed, pain_reported, note)
    VALUES (?, 'high', 'good', 5, 10, 1, NULL, 'encouragement', 0, 'Felt great completing Day 1!')
  `).run(userId);

  if (targetDay === 1) {
    db.prepare(`
      UPDATE risk_states
      SET risk_score = 10, risk_level = 'low', barrier_type = 'other', app_mode = 'normal',
          reason_summary = 'Day 1: Completed initial movement. Rhythm is strong.'
      WHERE user_id = ?
    `).run(userId);
    return;
  }

  // Day 2: Missed activity, reason: lack_of_time, medium risk, Light Mode, 2-minute intervention
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'missed')
  `).run(userId, d2);

  db.prepare(`
    INSERT INTO checkins (user_id, energy, mood, motivation, time_available, workout_completed, reason, support_needed, pain_reported, note)
    VALUES (?, 'medium', 'okay', 3, 2, 0, 'lack_of_time', 'shorter', 0, 'Packed work schedule today.')
  `).run(userId);

  const int2 = db.prepare(`
    INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status, created_at)
    VALUES (?, 'lack_of_time', 'movement_reset', '2-minute movement reset', 'Try a short, manageable movement break.', 2, 'completed', CURRENT_TIMESTAMP)
  `).run(userId);

  db.prepare(`
    INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
    VALUES (?, ?, 'barrier_identified', 'normal', 'light')
  `).run(userId, Number(int2.lastInsertRowid));

  if (targetDay === 2) {
    db.prepare(`
      UPDATE risk_states
      SET risk_score = 35, risk_level = 'medium', barrier_type = 'lack_of_time', app_mode = 'light',
          reason_summary = 'Day 2: Busy schedule noted. Light Mode activated with 2-minute movement reset.'
      WHERE user_id = ?
    `).run(userId);
    return;
  }

  // Day 3: Missed activity, reason: boredom, medium risk, different activity intervention
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'missed')
  `).run(userId, d3);

  db.prepare(`
    INSERT INTO checkins (user_id, energy, mood, motivation, time_available, workout_completed, reason, support_needed, pain_reported, note)
    VALUES (?, 'medium', 'okay', 2, 5, 0, 'boredom', 'different', 0, 'Workout routine felt repetitive.')
  `).run(userId);

  const int3 = db.prepare(`
    INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status, created_at)
    VALUES (?, 'boredom', 'activity_switch', 'Try something different', 'Choose between walking, dance, mobility, or a beginner challenge.', 5, 'completed', CURRENT_TIMESTAMP)
  `).run(userId);

  db.prepare(`
    INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
    VALUES (?, ?, 'barrier_identified', 'light', 'light')
  `).run(userId, Number(int3.lastInsertRowid));

  if (targetDay === 3) {
    db.prepare(`
      UPDATE risk_states
      SET risk_score = 45, risk_level = 'medium', barrier_type = 'boredom', app_mode = 'light',
          reason_summary = 'Day 3: Boredom identified. Suggested fresh movement alternative.'
      WHERE user_id = ?
    `).run(userId);
    return;
  }

  // Day 4: Missed activity, energy: low, high risk, Rescue Mode, one-minute starter action
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'missed')
  `).run(userId, tStr);

  db.prepare(`
    INSERT INTO checkins (user_id, energy, mood, motivation, time_available, workout_completed, reason, support_needed, pain_reported, note)
    VALUES (?, 'low', 'low', 1, 2, 0, 'fatigue', 'easier', 0, 'Exhausted after travel.')
  `).run(userId);

  const insertRescue = db.prepare(`
    INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status, created_at)
    VALUES (?, 'low_motivation', 'micro_starter', 'One-minute starter', 'Start for one minute; continuing is optional.', 1, 'suggested', CURRENT_TIMESTAMP)
  `).run(userId);

  db.prepare(`
    INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
    VALUES (?, ?, 'rescue_activated', 'light', 'rescue')
  `).run(userId, Number(insertRescue.lastInsertRowid));

  db.prepare(`
    UPDATE risk_states
    SET risk_score = 65,
        risk_level = 'high',
        barrier_type = 'fatigue',
        confidence = 0.95,
        app_mode = 'rescue',
        reason_summary = 'Risk increased because of repeated missed activities and low energy.',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ?
  `).run(userId);
}

// POST /api/demo/load
demoRouter.post('/load', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { day } = req.body;
    const targetDay = day ? Number(day) : 4;

    loadFullDemoData(userId, targetDay);

    const summary = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    return res.json({
      success: true,
      message: `Loaded Hackathon Demo at Day ${targetDay}`,
      riskState: summary
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/demo/reset
demoRouter.post('/reset', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    resetUserData(userId);

    const summary = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    return res.json({
      success: true,
      message: 'Demo state reset to clean baseline (Day 1 - Normal Mode)',
      riskState: summary
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/demo/step
demoRouter.post('/step', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const day = Number(req.body.day) || 1;
    loadFullDemoData(userId, day);

    const summary = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    return res.json({
      success: true,
      day,
      riskState: summary,
      message: `Switched to Demo Day ${day}`
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

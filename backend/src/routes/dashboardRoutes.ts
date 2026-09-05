import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';
import { ActivityHistoryItem, Intervention } from '../types/index.js';

export const dashboardRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// GET /api/dashboard/summary
dashboardRouter.get('/summary', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId) as any;
    let profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId) as any;
    if (!profile) {
      db.prepare(`
        INSERT INTO profiles (user_id, name, goal, experience_level, preferred_time, communication_tone)
        VALUES (?, 'Alex Rivera', 'Build consistency', 'Beginner', 'Morning', 'Friendly')
      `).run(userId);
      profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    }

    let riskState = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId) as any;
    if (!riskState) {
      db.prepare(`
        INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, app_mode, reason_summary)
        VALUES (?, 0, 'low', 'other', 'normal', 'Routine is steady and consistent.')
      `).run(userId);
      riskState = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    }

    const currentIntervention = db.prepare(`
      SELECT * FROM interventions
      WHERE user_id = ? AND status IN ('suggested', 'started')
      ORDER BY created_at DESC LIMIT 1
    `).get(userId) as Intervention | undefined;

    const today = new Date().toISOString().split('T')[0];
    let todayActivity = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ? AND planned_date = ?
      ORDER BY id DESC LIMIT 1
    `).get(userId, today) as unknown as ActivityHistoryItem | undefined;

    if (!todayActivity) {
      // Ensure today's activity exists
      const insert = db.prepare(`
        INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
        VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'planned')
      `).run(userId, today);
      todayActivity = db.prepare('SELECT * FROM activity_history WHERE id = ?').get(
        Number(insert.lastInsertRowid)
      ) as unknown as ActivityHistoryItem;
    }

    const recentActivities = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ?
      ORDER BY planned_date DESC
      LIMIT 14
    `).all(userId) as unknown as ActivityHistoryItem[];

    const recentCheckins = db.prepare(`
      SELECT * FROM checkins
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 7
    `).all(userId);

    const recentRecoveryEvents = db.prepare(`
      SELECT * FROM recovery_events
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId);

    // Calculate weekly count
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weeklyCount = recentActivities.filter((item) => {
      const d = new Date(item.planned_date);
      return d >= sevenDaysAgo && item.status === 'completed';
    }).length;

    // Calculate consistency score: based on completed vs planned
    const totalPlanned = recentActivities.length || 1;
    const totalCompleted = recentActivities.filter((a) => a.status === 'completed').length;
    const consistencyScore = Math.min(
      100,
      Math.max(10, Math.round((totalCompleted / Math.max(totalPlanned, 5)) * 100))
    );

    // Calculate comeback score: completed recovery events & interventions
    const completedRecoveries = db.prepare(`
      SELECT count(*) as count FROM recovery_events
      WHERE user_id = ? AND event_type IN ('intervention_completed', 'user_returned')
    `).get(userId) as any;

    const comebackCount = completedRecoveries ? completedRecoveries.count : 0;
    const comebackScore = Math.min(100, Math.max(25, 40 + comebackCount * 15));

    return res.json({
      user: { id: user?.id || userId, email: user?.email || 'demo@revivemotion.local' },
      profile,
      riskState,
      currentIntervention: currentIntervention || null,
      todayActivity,
      weeklyCount,
      consistencyScore,
      comebackScore,
      comebackActionsCompleted: comebackCount,
      sessionsRecovered: Math.max(1, Math.ceil(comebackCount / 2)),
      recentCheckins,
      recentActivities,
      recentRecoveryEvents,
      planPaused: Boolean(profile?.plan_paused)
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/dashboard/return-to-normal
dashboardRouter.post('/return-to-normal', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const currentRisk = db.prepare('SELECT app_mode FROM risk_states WHERE user_id = ?').get(userId) as any;
    const prevMode = currentRisk?.app_mode || 'recovery';

    db.prepare(`
      UPDATE risk_states
      SET app_mode = 'normal',
          risk_score = 15,
          risk_level = 'low',
          barrier_type = 'other',
          reason_summary = 'Returned to normal plan. Smooth, steady progress ahead.',
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(userId);

    db.prepare(`
      INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
      VALUES (?, NULL, 'user_returned', ?, 'normal')
    `).run(userId, prevMode);

    return res.json({
      success: true,
      message: 'Welcome back to your regular routine! No pressure, just take it step by step.'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/dashboard/pause-plan
dashboardRouter.post('/pause-plan', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { paused } = req.body;
    const isPaused = paused !== undefined ? (paused ? 1 : 0) : 1;

    db.prepare(`
      UPDATE profiles
      SET plan_paused = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(isPaused, userId);

    return res.json({
      success: true,
      planPaused: Boolean(isPaused),
      message: isPaused
        ? 'Plan paused. Your progress is completely safe. Resume whenever you are ready.'
        : 'Plan resumed. Welcome back!'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

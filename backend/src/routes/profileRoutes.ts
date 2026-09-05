import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';

export const profileRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// GET /api/profile
profileRouter.get('/', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json({ profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/profile
profileRouter.post('/', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const { name, goal, experience_level, preferred_time, communication_tone, plan_paused, quiet_hours_enabled } = req.body;

    const existing = db.prepare('SELECT id FROM profiles WHERE user_id = ?').get(userId);

    if (existing) {
      db.prepare(`
        UPDATE profiles
        SET name = COALESCE(?, name),
            goal = COALESCE(?, goal),
            experience_level = COALESCE(?, experience_level),
            preferred_time = COALESCE(?, preferred_time),
            communication_tone = COALESCE(?, communication_tone),
            plan_paused = COALESCE(?, plan_paused),
            quiet_hours_enabled = COALESCE(?, quiet_hours_enabled),
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(name, goal, experience_level, preferred_time, communication_tone, plan_paused, quiet_hours_enabled, userId);
    } else {
      db.prepare(`
        INSERT INTO profiles (user_id, name, goal, experience_level, preferred_time, communication_tone, plan_paused, quiet_hours_enabled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        name || 'Friend',
        goal || 'Build consistency',
        experience_level || 'Beginner',
        preferred_time || 'Morning',
        communication_tone || 'Friendly',
        plan_paused ? 1 : 0,
        quiet_hours_enabled ? 1 : 0
      );
    }

    const updatedProfile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    return res.json({ profile: updatedProfile, message: 'Profile updated' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

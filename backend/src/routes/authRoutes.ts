import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';

export const authRouter = Router();

// Helper to get or create demo user
export function getOrCreateDemoUser() {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@revivemotion.local') as any;
  if (user) {
    return user;
  }

  const insertUser = db.prepare(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)'
  ).run('demo@revivemotion.local', 'demo_hash');

  const userId = Number(insertUser.lastInsertRowid);

  db.prepare(`
    INSERT INTO profiles (user_id, name, goal, experience_level, preferred_time, communication_tone)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(userId, 'Alex Rivera', 'Build consistency', 'Beginner', 'Morning', 'Friendly');

  db.prepare(`
    INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, app_mode, reason_summary)
    VALUES (?, 0, 'low', 'other', 'normal', 'Routine is steady and consistent.')
  `).run(userId);

  // Insert an initial planned activity for today
  const today = new Date().toISOString().split('T')[0];
  db.prepare(`
    INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
    VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'planned')
  `).run(userId, today);

  return { id: userId, email: 'demo@revivemotion.local' };
}

// POST /api/auth/register
authRouter.post('/register', (req: Request, res: Response) => {
  try {
    const { email, password, name, goal, experience_level, preferred_time, communication_tone } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ error: 'User already exists with this email' });
    }

    const result = db.prepare(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)'
    ).run(email, password || 'hashed_pw');

    const userId = Number(result.lastInsertRowid);

    db.prepare(`
      INSERT INTO profiles (user_id, name, goal, experience_level, preferred_time, communication_tone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name || 'Friend',
      goal || 'Build consistency',
      experience_level || 'Beginner',
      preferred_time || 'Morning',
      communication_tone || 'Friendly'
    );

    db.prepare(`
      INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, app_mode, reason_summary)
      VALUES (?, 0, 'low', 'other', 'normal', 'Welcome! Ready for your first steps.')
    `).run(userId);

    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO activity_history (user_id, planned_date, activity_type, title, duration_minutes, difficulty, status)
      VALUES (?, ?, 'movement', '10-minute beginner movement', 10, 'easy', 'planned')
    `).run(userId, today);

    return res.status(201).json({
      user: { id: userId, email },
      token: String(userId),
      message: 'Account created successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    let user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      // For hackathon prototype, if user doesn't exist, create it seamlessly
      const result = db.prepare(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)'
      ).run(email, 'default_pw');
      const userId = Number(result.lastInsertRowid);

      db.prepare(`
        INSERT INTO profiles (user_id, name, goal, experience_level, preferred_time, communication_tone)
        VALUES (?, ?, 'Build consistency', 'Beginner', 'Morning', 'Friendly')
      `).run(userId, email.split('@')[0]);

      db.prepare(`
        INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, app_mode, reason_summary)
        VALUES (?, 0, 'low', 'other', 'normal', 'Routine is steady.')
      `).run(userId);

      user = { id: userId, email };
    }

    return res.json({
      user,
      token: String(user.id),
      message: 'Logged in successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/auth/demo
authRouter.post('/demo', (_req: Request, res: Response) => {
  try {
    const user = getOrCreateDemoUser();
    return res.json({
      user: { id: user.id, email: user.email },
      token: String(user.id),
      message: 'Demo session ready'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', (req: Request, res: Response) => {
  try {
    const userIdHeader = req.headers['x-user-id'] as string;
    const userId = userIdHeader ? parseInt(userIdHeader, 10) : getOrCreateDemoUser().id;

    const user = db.prepare('SELECT id, email, created_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(userId);
    return res.json({ user, profile });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

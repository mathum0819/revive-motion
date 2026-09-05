import { db } from './connection.js';

export function initDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      goal TEXT NOT NULL DEFAULT 'Build consistency',
      experience_level TEXT NOT NULL DEFAULT 'Beginner',
      preferred_time TEXT NOT NULL DEFAULT 'Morning',
      communication_tone TEXT NOT NULL DEFAULT 'Friendly',
      plan_paused BOOLEAN DEFAULT 0,
      quiet_hours_enabled BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      planned_date DATE NOT NULL,
      activity_type TEXT NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      difficulty TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('planned', 'completed', 'missed', 'postponed', 'skipped')),
      completed_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      energy TEXT NOT NULL CHECK(energy IN ('high', 'medium', 'low')),
      mood TEXT NOT NULL CHECK(mood IN ('good', 'okay', 'low')),
      motivation INTEGER NOT NULL CHECK(motivation BETWEEN 1 AND 5),
      time_available INTEGER NOT NULL CHECK(time_available IN (2, 5, 10, 30)),
      workout_completed BOOLEAN NOT NULL,
      reason TEXT,
      support_needed TEXT,
      pain_reported BOOLEAN DEFAULT 0,
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS risk_states (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      risk_score INTEGER DEFAULT 0,
      risk_level TEXT NOT NULL DEFAULT 'low' CHECK(risk_level IN ('low', 'medium', 'high')),
      barrier_type TEXT NOT NULL DEFAULT 'other',
      confidence REAL DEFAULT 1.0,
      app_mode TEXT NOT NULL DEFAULT 'normal' CHECK(app_mode IN ('normal', 'light', 'recovery', 'rescue', 'safety')),
      reason_summary TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS interventions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      barrier_type TEXT NOT NULL,
      intervention_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'suggested' CHECK(status IN ('suggested', 'started', 'completed', 'postponed', 'skipped')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS recovery_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      intervention_id INTEGER REFERENCES interventions(id) ON DELETE SET NULL,
      event_type TEXT NOT NULL,
      previous_mode TEXT NOT NULL,
      new_mode TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS demo_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      goal TEXT NOT NULL,
      experience_level TEXT NOT NULL,
      preferred_time TEXT NOT NULL,
      communication_tone TEXT NOT NULL,
      demo_data_json TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

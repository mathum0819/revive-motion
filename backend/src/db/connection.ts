import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Database file location (supports optional Render persistent disk via DB_PATH)
const customPath = process.env.DB_PATH;
const DB_PATH = customPath ? path.resolve(customPath) : path.resolve(process.cwd(), 'data', 'revive_motion.db');
const dbDir = path.dirname(DB_PATH);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

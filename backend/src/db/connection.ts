import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';

// Database file location
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const DB_PATH = path.join(dbDir, 'revive_motion.db');

export const db = new DatabaseSync(DB_PATH);

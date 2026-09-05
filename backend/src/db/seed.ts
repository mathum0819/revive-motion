import { initDatabase } from './schema.js';
import { getOrCreateDemoUser } from '../routes/authRoutes.js';
import { loadFullDemoData } from '../routes/demoRoutes.js';

console.log('🌱 Seeding Revive Motion SQLite database...');
initDatabase();
const demoUser = getOrCreateDemoUser();
loadFullDemoData(demoUser.id, 4);

console.log('✅ Revive Motion database seeded successfully with 4-day progression!');
process.exit(0);

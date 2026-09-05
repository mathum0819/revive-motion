import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/schema.js';
import { getOrCreateDemoUser, authRouter } from './routes/authRoutes.js';
import { profileRouter } from './routes/profileRoutes.js';
import { checkinRouter } from './routes/checkinRoutes.js';
import { riskRouter } from './routes/riskRoutes.js';
import { interventionRouter } from './routes/interventionRoutes.js';
import { activityRouter } from './routes/activityRoutes.js';
import { demoRouter } from './routes/demoRoutes.js';
import { dashboardRouter } from './routes/dashboardRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for local frontend development
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
  })
);

app.use(express.json());

// Initialize SQLite schema and ensure default demo user
initDatabase();
getOrCreateDemoUser();

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'Revive Motion Backend', timestamp: new Date().toISOString() });
});

// REST API Routes
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/checkins', checkinRouter);
app.use('/api/risk', riskRouter);
app.use('/api/interventions', interventionRouter);
app.use('/api/activity', activityRouter);
app.use('/api/demo', demoRouter);
app.use('/api/dashboard', dashboardRouter);

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Revive Motion Backend server running on http://localhost:${PORT}`);
});

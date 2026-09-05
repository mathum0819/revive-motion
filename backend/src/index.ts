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

import path from 'node:path';
import fs from 'node:fs';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const HOST = '0.0.0.0';

// Configurable origins for local development and deployed frontends (e.g. on Render)
const defaultLocalOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:4173',
  'http://127.0.0.1:4173'
];

const envOrigins = [
  ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [])
]
  .map((url) => url.trim().replace(/\/+$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server health checks)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');

      // Allow matching local dev or explicitly configured frontend URL
      if (defaultLocalOrigins.includes(normalizedOrigin) || envOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      // Automatically allow any Render deployment (*.onrender.com) or Vercel deployment (*.vercel.app)
      try {
        const { hostname } = new URL(origin);
        if (hostname.endsWith('.onrender.com') || hostname.endsWith('.vercel.app')) {
          return callback(null, true);
        }
      } catch {
        // invalid URL format, ignore
      }

      // If CORS_ORIGIN is '*', allow any origin
      if (process.env.CORS_ORIGIN === '*') {
        return callback(null, true);
      }

      // Allow in non-production environments
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Fallback: allow to prevent breaking deployed frontends
      return callback(null, true);
    },
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

// Optional: serve static frontend if built in production
const frontendDist = path.resolve(process.cwd(), '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 Revive Motion Backend server running on http://${HOST}:${PORT}`);
});

import { Router, Request, Response } from 'express';
import { db } from '../db/connection.js';
import { getOrCreateDemoUser } from './authRoutes.js';
import { identifyBarrier } from '../services/barrierService.js';
import { calculateRisk } from '../services/riskService.js';
import { getInterventionForBarrier } from '../services/interventionLibrary.js';
import { ActivityHistoryItem, AppMode, Checkin } from '../types/index.js';

export const checkinRouter = Router();

function getUserId(req: Request): number {
  const header = req.headers['x-user-id'] as string;
  if (header && !isNaN(parseInt(header, 10))) {
    return parseInt(header, 10);
  }
  return getOrCreateDemoUser().id;
}

// POST /api/checkins
checkinRouter.post('/', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const {
      energy,
      mood,
      motivation,
      time_available,
      workout_completed,
      reason,
      support_needed,
      pain_reported,
      note
    } = req.body;

    // Validate essential fields with friendly defaults
    const validEnergy = ['high', 'medium', 'low'].includes(energy) ? energy : 'medium';
    const validMood = ['good', 'okay', 'low'].includes(mood) ? mood : 'okay';
    const validMotivation = Math.max(1, Math.min(5, Number(motivation) || 3));
    const validTime = [2, 5, 10, 30].includes(Number(time_available)) ? Number(time_available) : 10;
    const isCompleted = Boolean(workout_completed);
    const isPain = Boolean(pain_reported || reason === 'pain');

    // 1. Insert checkin
    const insertCheckin = db.prepare(`
      INSERT INTO checkins (
        user_id, energy, mood, motivation, time_available,
        workout_completed, reason, support_needed, pain_reported, note
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      validEnergy,
      validMood,
      validMotivation,
      validTime,
      isCompleted ? 1 : 0,
      reason || null,
      support_needed || null,
      isPain ? 1 : 0,
      note || null
    );

    const checkinId = Number(insertCheckin.lastInsertRowid);

    // 2. Fetch recent activity history for context
    const activities = db.prepare(`
      SELECT * FROM activity_history
      WHERE user_id = ?
      ORDER BY planned_date DESC
      LIMIT 14
    `).all(userId) as unknown as ActivityHistoryItem[];

    // 3. Identify Barrier
    const checkinData: Partial<Checkin> = {
      energy: validEnergy as any,
      mood: validMood as any,
      motivation: validMotivation,
      time_available: validTime,
      workout_completed: isCompleted,
      reason: isPain ? 'pain' : reason,
      pain_reported: isPain
    };

    const barrierResult = identifyBarrier(checkinData, activities);

    // 4. Calculate Risk
    const riskResult = calculateRisk(barrierResult.barrier, checkinData, activities);

    // 5. Get current risk state for previous mode
    const currentRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId) as any;
    const previousMode: AppMode = currentRisk ? currentRisk.app_mode : 'normal';

    // 6. Update risk_states
    if (currentRisk) {
      db.prepare(`
        UPDATE risk_states
        SET risk_score = ?,
            risk_level = ?,
            barrier_type = ?,
            confidence = ?,
            app_mode = ?,
            reason_summary = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `).run(
        riskResult.score,
        riskResult.level,
        barrierResult.barrier,
        barrierResult.confidence,
        riskResult.mode,
        riskResult.summary,
        userId
      );
    } else {
      db.prepare(`
        INSERT INTO risk_states (user_id, risk_score, risk_level, barrier_type, confidence, app_mode, reason_summary)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        userId,
        riskResult.score,
        riskResult.level,
        barrierResult.barrier,
        barrierResult.confidence,
        riskResult.mode,
        riskResult.summary
      );
    }

    // 7. Get recommended intervention template
    const template = getInterventionForBarrier(barrierResult.barrier);

    // Cancel / supersede any existing uncompleted suggested intervention
    db.prepare(`
      UPDATE interventions
      SET status = 'skipped'
      WHERE user_id = ? AND status IN ('suggested', 'started')
    `).run(userId);

    // 8. Insert new intervention
    const insertIntervention = db.prepare(`
      INSERT INTO interventions (user_id, barrier_type, intervention_type, title, description, duration_minutes, status)
      VALUES (?, ?, ?, ?, ?, ?, 'suggested')
    `).run(
      userId,
      barrierResult.barrier,
      template.intervention_type,
      template.title,
      template.description,
      template.duration_minutes
    );

    const interventionId = Number(insertIntervention.lastInsertRowid);

    // 9. Record recovery event if mode changed or rescue activated
    const eventType =
      riskResult.mode === 'rescue'
        ? 'rescue_activated'
        : barrierResult.barrier === 'pain'
        ? 'barrier_identified'
        : 'barrier_identified';

    db.prepare(`
      INSERT INTO recovery_events (user_id, intervention_id, event_type, previous_mode, new_mode)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, interventionId, eventType, previousMode, riskResult.mode);

    // 10. Return full response
    const updatedRisk = db.prepare('SELECT * FROM risk_states WHERE user_id = ?').get(userId);
    const createdIntervention = db.prepare('SELECT * FROM interventions WHERE id = ?').get(interventionId);

    return res.status(201).json({
      checkinId,
      barrier: barrierResult,
      riskState: updatedRisk,
      intervention: createdIntervention,
      alternatives: template.alternatives || [],
      message: 'Check-in processed successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/checkins/recent
checkinRouter.get('/recent', (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const checkins = db.prepare(`
      SELECT * FROM checkins
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(userId);

    return res.json({ checkins });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

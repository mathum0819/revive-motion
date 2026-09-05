import { BarrierType, Checkin, ActivityHistoryItem } from '../types/index.js';

export interface BarrierResult {
  barrier: BarrierType;
  confidence: number;
  explanation: string;
  source: 'user_reported' | 'inferred' | 'safety';
}

export function identifyBarrier(
  checkin: Partial<Checkin>,
  activityHistory: ActivityHistoryItem[] = []
): BarrierResult {
  // Priority 1: Pain or physical discomfort reports immediately take precedence
  if (checkin.pain_reported) {
    return {
      barrier: 'pain',
      confidence: 1.0,
      explanation: 'You reported discomfort. We prioritize your comfort and safety over any workout.',
      source: 'safety'
    };
  }

  // Priority 2: Direct user-selected barrier
  if (checkin.reason) {
    const userExplanations: Record<BarrierType, string> = {
      lack_of_time: 'You have limited time today. Start with a 2-minute movement reset.',
      fatigue: 'You are feeling tired today. Light mobility helps you recover without straining.',
      stress: 'You are managing stress today. Slow breathing and gentle stretches can restore ease.',
      boredom: 'You selected boredom. Let’s try a different activity instead of repeating the same workout.',
      difficulty: 'Today’s activity felt demanding. Let’s try an easier, beginner-friendly alternative.',
      forgetfulness: 'Schedules slip easily. Let’s adjust timing to fit your daily flow better.',
      routine_disruption: 'Your routine had an unexpected shift. Let’s adapt to today’s schedule.',
      low_motivation: 'Low motivation happens to everyone. Just one minute keeps your habit alive.',
      pain: 'You reported discomfort. Rest and safety come first.',
      other: 'Every day is different. We have chosen a low-barrier micro-step for you.'
    };

    return {
      barrier: checkin.reason,
      confidence: 1.0,
      explanation: userExplanations[checkin.reason] || userExplanations.other,
      source: 'user_reported'
    };
  }

  // Priority 3: Rule-based inference from check-in metrics and history
  if (checkin.time_available !== undefined && checkin.time_available <= 5) {
    return {
      barrier: 'lack_of_time',
      confidence: 0.9,
      explanation: 'With limited time available, a micro-movement keeps momentum going.',
      source: 'inferred'
    };
  }

  if (checkin.energy === 'low') {
    return {
      barrier: 'fatigue',
      confidence: 0.85,
      explanation: 'Energy is low today. Restorative gentle movement is ideal.',
      source: 'inferred'
    };
  }

  if (checkin.mood === 'low') {
    return {
      barrier: 'stress',
      confidence: 0.8,
      explanation: 'Mood seems low or pressured. Calming breath and light stretches are best.',
      source: 'inferred'
    };
  }

  if (checkin.motivation !== undefined && checkin.motivation <= 2) {
    return {
      barrier: 'low_motivation',
      confidence: 0.85,
      explanation: 'Motivation fluctuates naturally. A one-minute commitment is all it takes.',
      source: 'inferred'
    };
  }

  // Check activity history for patterns:
  // Repeated postponement
  const recentPostponed = activityHistory.filter(
    (a) => a.status === 'postponed'
  ).length;
  if (recentPostponed >= 2) {
    return {
      barrier: 'routine_disruption',
      confidence: 0.75,
      explanation: 'Activities have been postponed recently, suggesting schedule shifts.',
      source: 'inferred'
    };
  }

  // Repeated same activity or skipping without reason
  const recentMissedOrSkipped = activityHistory.filter(
    (a) => a.status === 'missed' || a.status === 'skipped'
  ).length;
  if (recentMissedOrSkipped >= 2) {
    return {
      barrier: 'boredom',
      confidence: 0.7,
      explanation: 'Recent skipped sessions suggest a refreshing change of pace could help.',
      source: 'inferred'
    };
  }

  return {
    barrier: 'other',
    confidence: 0.7,
    explanation: 'Here is a gentle starter to keep your continuity without stress.',
    source: 'inferred'
  };
}

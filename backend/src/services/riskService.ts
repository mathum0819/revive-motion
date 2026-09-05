import {
  AppMode,
  BarrierType,
  Checkin,
  RiskLevel,
  RiskState,
  ActivityHistoryItem
} from '../types/index.js';

export interface RiskCalculationResult {
  score: number;
  level: RiskLevel;
  mode: AppMode;
  reasons: string[];
  summary: string;
}

export function calculateRisk(
  barrier: BarrierType,
  checkin?: Partial<Checkin>,
  activityHistory: ActivityHistoryItem[] = []
): RiskCalculationResult {
  if (barrier === 'pain' || checkin?.pain_reported) {
    return {
      score: 0,
      level: 'low',
      mode: 'safety',
      reasons: ['Pain or physical discomfort reported'],
      summary: 'Safety Pause activated. Protect your body and rest.'
    };
  }

  let score = 0;
  const reasons: string[] = [];

  // Filter 14 days and 7 days
  const now = new Date();
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const missedIn14 = activityHistory.filter((item) => {
    const d = new Date(item.planned_date);
    return d >= fourteenDaysAgo && (item.status === 'missed' || item.status === 'skipped');
  }).length;

  if (missedIn14 >= 4) {
    score += 45; // 20 for >=2 and 25 for >=4
    reasons.push('4+ missed or skipped sessions recently (+45)');
  } else if (missedIn14 >= 2) {
    score += 20;
    reasons.push('2+ missed sessions in past 14 days (+20)');
  }

  if (checkin?.energy === 'low') {
    score += 15;
    reasons.push('Low energy level (+15)');
  }

  if (checkin?.mood === 'low') {
    score += 15;
    reasons.push('Low mood or elevated stress (+15)');
  }

  if (checkin?.motivation !== undefined && checkin.motivation <= 2) {
    score += 15;
    reasons.push('Low motivation rating (+15)');
  }

  const postponedCount = activityHistory.filter((item) => {
    const d = new Date(item.planned_date);
    return d >= fourteenDaysAgo && item.status === 'postponed';
  }).length;
  if (postponedCount >= 2) {
    score += 10;
    reasons.push('Repeated activity postponements (+10)');
  }

  const completedIn7 = activityHistory.some((item) => {
    const d = new Date(item.planned_date);
    return d >= sevenDaysAgo && item.status === 'completed';
  });
  if (!completedIn7 && activityHistory.length > 0) {
    score += 10;
    reasons.push('No activity completed in the last 7 days (+10)');
  }

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  // Risk level
  let level: RiskLevel = 'low';
  if (score >= 60) {
    level = 'high';
  } else if (score >= 30) {
    level = 'medium';
  }

  // Mode Selection
  let mode: AppMode = 'normal';
  if (level === 'high') {
    mode = 'rescue';
  } else if (level === 'medium') {
    if (barrier === 'fatigue' || barrier === 'stress') {
      mode = 'recovery';
    } else {
      // boredom, lack_of_time, difficulty, routine_disruption, etc.
      mode = 'light';
    }
  } else {
    // Low risk: if user specifically reported fatigue or stress or lack of time today, we can still suggest light/recovery
    // but default appMode is normal
    mode = 'normal';
  }

  const summary =
    reasons.length > 0
      ? `Risk score: ${score} (${level.toUpperCase()}). Influenced by: ${reasons.join(', ')}.`
      : 'Risk score: 0 (LOW). Routine is steady and consistent.';

  return {
    score,
    level,
    mode,
    reasons,
    summary
  };
}

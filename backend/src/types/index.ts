export type AppMode = 'normal' | 'light' | 'recovery' | 'rescue' | 'safety';

export type RiskLevel = 'low' | 'medium' | 'high';

export type BarrierType =
  | 'lack_of_time'
  | 'fatigue'
  | 'stress'
  | 'boredom'
  | 'difficulty'
  | 'forgetfulness'
  | 'routine_disruption'
  | 'pain'
  | 'low_motivation'
  | 'other';

export type SupportNeed =
  | 'shorter'
  | 'easier'
  | 'different'
  | 'reminder'
  | 'rest'
  | 'encouragement';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  goal: string;
  experience_level: string;
  preferred_time: string;
  communication_tone: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityHistoryItem {
  id: number;
  user_id: number;
  planned_date: string;
  activity_type: string;
  title: string;
  duration_minutes: number;
  difficulty: string;
  status: 'planned' | 'completed' | 'missed' | 'postponed' | 'skipped';
  completed_at: string | null;
  created_at: string;
}

export interface Checkin {
  id: number;
  user_id: number;
  energy: 'high' | 'medium' | 'low';
  mood: 'good' | 'okay' | 'low';
  motivation: number; // 1 to 5
  time_available: number; // 2, 5, 10, 30
  workout_completed: boolean;
  reason?: BarrierType | null;
  support_needed?: SupportNeed | null;
  pain_reported: boolean;
  note?: string | null;
  created_at: string;
}

export interface RiskState {
  id: number;
  user_id: number;
  risk_score: number;
  risk_level: RiskLevel;
  barrier_type: BarrierType;
  confidence: number;
  app_mode: AppMode;
  reason_summary: string;
  updated_at: string;
}

export interface Intervention {
  id: number;
  user_id: number;
  barrier_type: BarrierType;
  intervention_type: string;
  title: string;
  description: string;
  duration_minutes: number;
  status: 'suggested' | 'started' | 'completed' | 'postponed' | 'skipped';
  created_at: string;
  completed_at: string | null;
}

export interface RecoveryEvent {
  id: number;
  user_id: number;
  intervention_id: number | null;
  event_type:
    | 'barrier_identified'
    | 'rescue_activated'
    | 'intervention_started'
    | 'intervention_completed'
    | 'intervention_postponed'
    | 'user_returned';
  previous_mode: AppMode;
  new_mode: AppMode;
  created_at: string;
}

export interface DemoUser {
  id: number;
  name: string;
  goal: string;
  experience_level: string;
  preferred_time: string;
  communication_tone: string;
  demo_data_json: string;
  created_at: string;
}

export interface DashboardSummary {
  user: { id: number; email: string };
  profile: Profile;
  riskState: RiskState;
  currentIntervention: Intervention | null;
  todayActivity: ActivityHistoryItem | null;
  weeklyCount: number;
  consistencyScore: number;
  comebackScore: number;
  recentCheckins: Checkin[];
  recentActivities: ActivityHistoryItem[];
  recentRecoveryEvents: RecoveryEvent[];
  planPaused: boolean;
}

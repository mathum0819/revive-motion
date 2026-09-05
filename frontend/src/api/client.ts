import axios from 'axios';
import {
  Checkin,
  DashboardSummary,
  Intervention,
  Profile,
  RiskState
} from '../types';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach user id if available in storage
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem('revive_user_id');
  if (userId) {
    config.headers['x-user-id'] = userId;
  }
  return config;
});

export const apiClient = {
  // Auth & Demo
  startDemo: async () => {
    const res = await api.post('/auth/demo');
    if (res.data?.user?.id) {
      localStorage.setItem('revive_user_id', String(res.data.user.id));
    }
    return res.data;
  },

  signIn: async (email: string) => {
    const res = await api.post('/auth/login', { email });
    if (res.data?.user?.id) {
      localStorage.setItem('revive_user_id', String(res.data.user.id));
    }
    return res.data;
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get<{ profile: Profile }>('/profile');
    return res.data.profile;
  },

  updateProfile: async (profileData: Partial<Profile>) => {
    const res = await api.post<{ profile: Profile }>('/profile', profileData);
    return res.data.profile;
  },

  // Dashboard Summary (Real-time single call)
  getDashboardSummary: async () => {
    const res = await api.get<DashboardSummary>('/dashboard/summary');
    return res.data;
  },

  returnToNormalPlan: async () => {
    const res = await api.post('/dashboard/return-to-normal');
    return res.data;
  },

  togglePausePlan: async (paused: boolean) => {
    const res = await api.post('/dashboard/pause-plan', { paused });
    return res.data;
  },

  // Checkins
  submitCheckin: async (checkinData: Partial<Checkin>) => {
    const res = await api.post<{
      checkinId: number;
      barrier: { barrier: string; confidence: number; explanation: string };
      riskState: RiskState;
      intervention: Intervention;
      alternatives: any[];
    }>('/checkins', checkinData);
    return res.data;
  },

  // Interventions
  getCurrentIntervention: async () => {
    const res = await api.get<{ intervention: Intervention | null; alternatives: any[] }>(
      '/interventions/current'
    );
    return res.data;
  },

  startIntervention: async (intervention_id?: number) => {
    const res = await api.post('/interventions/start', { intervention_id });
    return res.data;
  },

  completeIntervention: async (intervention_id?: number) => {
    const res = await api.post<{
      success: boolean;
      message: string;
      recoveryMessage: string;
      intervention: Intervention;
      riskState: RiskState;
      newMode: string;
    }>('/interventions/complete', { intervention_id });
    return res.data;
  },

  postponeIntervention: async (intervention_id?: number) => {
    const res = await api.post('/interventions/postpone', { intervention_id });
    return res.data;
  },

  changeIntervention: async (data: { new_title?: string; new_duration?: number; new_description?: string }) => {
    const res = await api.post('/interventions/change', data);
    return res.data;
  },

  // Activities
  completeActivity: async (activity_id?: number) => {
    const res = await api.post('/activity/complete', { activity_id });
    return res.data;
  },

  missActivity: async () => {
    const res = await api.post('/activity/miss');
    return res.data;
  },

  // Demo Controls
  loadDemo: async (day: number = 4) => {
    const res = await api.post('/demo/load', { day });
    return res.data;
  },

  resetDemo: async () => {
    const res = await api.post('/demo/reset');
    return res.data;
  },

  stepDemo: async (day: number) => {
    const res = await api.post('/demo/step', { day });
    return res.data;
  }
};

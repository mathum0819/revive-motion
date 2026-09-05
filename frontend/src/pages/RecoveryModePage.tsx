import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import { Clock, Play, PauseCircle, CheckCircle2, HeartPulse, Wind } from 'lucide-react';

export const RecoveryModePage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, refreshSummary, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const intervention = summary?.currentIntervention || {
    id: 0,
    title: 'Breathing and light mobility',
    duration_minutes: 4,
    description: 'Use slow breathing followed by gentle movement to ease physical and mental stress.'
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      if (intervention.id) {
        await apiClient.startIntervention(intervention.id);
      }
      setInProgress(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await apiClient.completeIntervention(intervention.id);
      setBannerAlert(res.message || 'You returned today. Small actions still count.');
      await refreshSummary();
      navigate('/recovery-dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePausePlan = async () => {
    setLoading(true);
    try {
      await apiClient.togglePausePlan(true);
      setBannerAlert('Plan paused temporarily. Rest deeply without worry.');
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <ModeBadge mode="recovery" size="lg" />
          <span className="text-xs text-purple-700 font-medium bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200 flex items-center gap-1">
            <HeartPulse className="w-3 h-3 text-purple-600" />
            <span>Restorative Focus</span>
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Recovery Mode Active</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            You are managing fatigue or stress today. We prioritize nervous system calm and physical ease over exertion.
          </p>
        </div>

        {/* Movement / Breathwork Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/30 p-5 rounded-2xl border border-purple-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1">
              <Wind className="w-3.5 h-3.5" />
              Gentle Restorative Action
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-purple-600" />
              <span>{intervention.duration_minutes} min</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{intervention.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{intervention.description}</p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          {!inProgress ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Recovery Session</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete Recovery Session</span>
            </button>
          )}

          <button
            onClick={handlePausePlan}
            disabled={loading}
            className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <PauseCircle className="w-4 h-4 text-slate-400" />
            <span>Pause plan for now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

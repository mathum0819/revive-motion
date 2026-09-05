import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import { Clock, Play, RotateCcw, FastForward, CheckCircle2 } from 'lucide-react';

export const LightModePage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, refreshSummary, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState(false);

  const intervention = summary?.currentIntervention || {
    id: 0,
    title: '2-minute movement reset',
    duration_minutes: 2,
    description: 'A lighter, simplified activity to keep continuity without overexertion.'
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

  const handleChangeActivity = async () => {
    setLoading(true);
    try {
      await apiClient.changeIntervention({
        new_title: '3-minute mobility & flow',
        new_duration: 3,
        new_description: 'Gentle twists and arm circles.'
      });
      await refreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    setBannerAlert('Skipped for today. No guilt; your routine is safe.');
    navigate('/dashboard');
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <ModeBadge mode="light" size="lg" />
          <span className="text-xs text-sky-700 font-medium bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
            Low-pressure alternative
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Light Mode Active</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Your schedule or energy had a small bump. Instead of skipping entirely, we adapted to an easier, shorter movement.
          </p>
        </div>

        {/* Activity Card */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-50/40 p-5 rounded-2xl border border-sky-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
              Adapted Activity
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>{intervention.duration_minutes} min</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900">{intervention.title}</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{intervention.description}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {!inProgress ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Light Activity</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Mark Complete</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleChangeActivity}
              disabled={loading}
              className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Change Activity</span>
            </button>

            <button
              onClick={handleSkip}
              disabled={loading}
              className="py-2.5 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>Skip for today</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import {
  Clock,
  Play,
  RotateCcw,
  Bell,
  PauseCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const RescueModePage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, refreshSummary, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);

  const intervention = summary?.currentIntervention || {
    id: 0,
    title: 'One-minute starter',
    duration_minutes: 1,
    description: 'Start for one minute; continuing is optional. Just 60 seconds of any movement you like.'
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      if (intervention.id) {
        await apiClient.startIntervention(intervention.id);
      }
      setInProgress(true);
      // Simple 60-second visual countdown simulation
      const interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
      setBannerAlert('You returned today. Small actions still count.');
      await refreshSummary();
      navigate('/recovery-dashboard', { state: { recoveryMessage: res.recoveryMessage } });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAnother = async () => {
    setLoading(true);
    try {
      await apiClient.changeIntervention({
        new_title: '60-second arm reaches & deep breaths',
        new_duration: 1,
        new_description: 'Gentle reaches towards the ceiling while taking slow, deep inhales.'
      });
      await refreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemindLater = async () => {
    setLoading(true);
    try {
      await apiClient.postponeIntervention(intervention.id);
      setBannerAlert('No worries. We will remind you gently when you are ready.');
      await refreshSummary();
      navigate('/dashboard');
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
      setBannerAlert('Plan paused. Your history is preserved safely.');
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-300 shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <ModeBadge mode="rescue" size="lg" />
          <span className="text-xs text-amber-800 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Guilt-Free Reset
          </span>
        </div>

        {/* Supportive Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Rescue Mode</h1>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            Your routine was disrupted. No pressure to complete a full workout. Start with one minute.
          </p>
        </div>

        {/* Single Primary Micro-Action Card */}
        <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/40 p-6 rounded-2xl border border-amber-300/80 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Your Single Micro-Action
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{intervention.duration_minutes || 1} min</span>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900">{intervention.title}</h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {intervention.description}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
              <span>{inProgress ? `${timerSeconds}s remaining` : 'Target: 60 seconds'}</span>
              <span>{inProgress ? `${Math.round(((60 - timerSeconds) / 60) * 100)}%` : 'Ready'}</span>
            </div>
            <div className="w-full bg-amber-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-300"
                style={{
                  width: inProgress ? `${Math.max(5, ((60 - timerSeconds) / 60) * 100)}%` : '0%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-3 pt-1">
          {!inProgress ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start One-Minute Starter</span>
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={loading}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Complete action & return</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTryAnother}
              disabled={loading}
              className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Try another action</span>
            </button>

            <button
              onClick={handleRemindLater}
              disabled={loading}
              className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-slate-500" />
              <span>Remind me later</span>
            </button>
          </div>

          <button
            onClick={handlePausePlan}
            disabled={loading}
            className="w-full py-2.5 bg-transparent hover:bg-slate-50 text-slate-500 hover:text-slate-700 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Pause plan without penalty</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import { Clock, Play, RotateCcw, Bell, CheckCircle2, ArrowRight } from 'lucide-react';

export const BarrierResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refreshSummary, setBannerAlert } = useApp();

  const stateData = location.state as any;
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const barrier = stateData?.barrier;
  const riskState = stateData?.riskState;
  const intervention = stateData?.intervention;
  const alternatives = stateData?.alternatives || [];

  // Barrier label helper
  const barrierLabels: Record<string, string> = {
    lack_of_time: 'Lack of Time',
    fatigue: 'Tiredness & Fatigue',
    stress: 'Stress / Low Mood',
    boredom: 'Boredom with Routine',
    difficulty: 'Workout Too Difficult',
    forgetfulness: 'Schedule Shift / Forgot',
    routine_disruption: 'Disrupted Routine',
    pain: 'Physical Discomfort',
    low_motivation: 'Low Motivation',
    other: 'Everyday Barrier'
  };

  const currentBarrierName = barrierLabels[barrier?.barrier || 'other'] || 'Current Barrier';

  const handleStart = async () => {
    setLoading(true);
    try {
      await apiClient.startIntervention(intervention?.id);
      setStarted(true);
      await refreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await apiClient.completeIntervention(intervention?.id);
      setCompleted(true);
      setBannerAlert('You returned today. Small actions still count.');
      await refreshSummary();
      setTimeout(() => {
        navigate('/recovery-dashboard', { state: { recoveryMessage: res.recoveryMessage } });
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChooseAnother = async () => {
    setLoading(true);
    try {
      const alt = alternatives[0] || {
        new_title: 'Gentle mindful breathing & walk',
        new_duration: 3,
        new_description: 'Take 3 slow, restorative breaths and stroll casually.'
      };
      await apiClient.changeIntervention({
        new_title: alt.title,
        new_duration: alt.duration_minutes,
        new_description: alt.description
      });
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemindLater = async () => {
    setLoading(true);
    try {
      await apiClient.postponeIntervention(intervention?.id);
      setBannerAlert('Reminder set for later. No rush, take your time.');
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!barrier && !riskState) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-4">
        <p className="text-slate-500">No recent barrier analysis found.</p>
        <button
          onClick={() => navigate('/checkin')}
          className="px-5 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold"
        >
          Start a Check-In
        </button>
      </div>
    );
  }

  // If pain was reported, redirect or show safety
  if (barrier?.barrier === 'pain' || riskState?.app_mode === 'safety') {
    return (
      <div className="max-w-xl mx-auto py-10 px-4">
        <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <ModeBadge mode="safety" size="lg" />
          <h2 className="text-2xl font-bold text-rose-900">Safety Pause Activated</h2>
          <p className="text-sm text-rose-800 leading-relaxed">
            You mentioned experiencing physical pain or discomfort. Exercise should never hurt or exacerbate pain.
          </p>
          <div className="bg-white p-4 rounded-2xl border border-rose-200 text-xs text-rose-950 space-y-2">
            <p className="font-semibold text-sm">Recommended Next Step:</p>
            <p>1. Pause today’s exercise completely.</p>
            <p>2. Rest and stay hydrated.</p>
            <p>3. If symptoms persist or cause concern, please consult a qualified healthcare professional.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-semibold text-sm transition-colors"
          >
            Acknowledge and return to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Header with Identified Barrier */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
              Barrier Identified
            </span>
            <ModeBadge mode={riskState?.app_mode || 'light'} size="sm" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900">{currentBarrierName}</h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            {barrier?.explanation || 'We found an adaptable step to keep your momentum without stress.'}
          </p>
        </div>

        {/* Risk Level Badge */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Habit Consistency Risk:</span>
          <span
            className={`font-bold capitalize px-2.5 py-0.5 rounded-full ${
              riskState?.risk_level === 'high'
                ? 'bg-amber-100 text-amber-800'
                : riskState?.risk_level === 'medium'
                ? 'bg-sky-100 text-sky-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {riskState?.risk_level || 'medium'} Risk ({riskState?.risk_score || 35}/100)
          </span>
        </div>

        {/* Recommended Micro-Intervention Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 to-indigo-50/40 border border-sky-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              Recommended Intervention
            </span>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
              <Clock className="w-3.5 h-3.5 text-sky-600" />
              <span>{intervention?.duration_minutes || 2} min</span>
            </div>
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {intervention?.title || '2-minute movement reset'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {intervention?.description || 'Try a short, manageable movement break.'}
          </p>

          {started && !completed && (
            <div className="mt-3 p-3 bg-white rounded-xl border border-sky-300 text-center space-y-2">
              <span className="text-xs text-sky-800 font-semibold block animate-pulse">
                In Progress: Take a gentle, easy pace...
              </span>
              <button
                onClick={handleComplete}
                disabled={loading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Mark Action Complete</span>
              </button>
            </div>
          )}

          {completed && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You returned today! Redirecting to Recovery Hub...</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!started && !completed && (
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleStart}
              disabled={loading}
              className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start this action</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleChooseAnother}
                disabled={loading}
                className="py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Choose another</span>
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
          </div>
        )}
      </div>
    </div>
  );
};

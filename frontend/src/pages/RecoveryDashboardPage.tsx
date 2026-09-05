import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import { StatCard } from '../components/StatCard';
import { WeeklyChart } from '../components/WeeklyChart';
import {
  Sparkles,
  HeartPulse,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const RecoveryDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { summary, refreshSummary, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);

  const recoveryMessage = (location.state as any)?.recoveryMessage || 'You returned today.';
  const appMode = summary?.riskState?.app_mode || 'normal';
  const recoveryScore = summary?.comebackScore || 55;
  const comebackActions = summary?.comebackActionsCompleted || 1;
  const sessionsRecovered = summary?.sessionsRecovered || 1;

  const handleReturnToNormal = async () => {
    setLoading(true);
    try {
      const res = await apiClient.returnToNormalPlan();
      setBannerAlert(res.message || 'Returned to normal plan!');
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Return Success Alert Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold">{recoveryMessage}</h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium">
              Small actions still count. Continuity is built one micro-step at a time.
            </p>
          </div>
        </div>

        <button
          onClick={handleReturnToNormal}
          disabled={loading}
          className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold shadow-xs transition-all whitespace-nowrap flex items-center gap-1.5 self-end sm:self-auto"
        >
          <span>Return to normal plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Header & Mode info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recovery & Continuity Center
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">Your Comeback Rhythm</h1>
        </div>
        <div className="flex items-center gap-2">
          <ModeBadge mode={appMode} size="md" />
        </div>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Recovery Score"
          value={`${recoveryScore}/100`}
          subtitle="Measures comeback momentum"
          icon={HeartPulse}
          accentColor="purple"
          progress={recoveryScore}
        />
        <StatCard
          title="Comeback Actions"
          value={comebackActions}
          subtitle="Micro-steps completed"
          icon={CheckCircle2}
          accentColor="emerald"
        />
        <StatCard
          title="Sessions Recovered"
          value={sessionsRecovered}
          subtitle="Prevented full abandonment"
          icon={RotateCcw}
          accentColor="sky"
        />
      </div>

      {/* Weekly Progress Chart & Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WeeklyChart activities={summary?.recentActivities || []} />
        </div>

        {/* Recent Barrier & Latest Intervention */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Recent Barrier Identified
            </h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-800 capitalize block">
                {summary?.riskState?.barrier_type ? summary.riskState.barrier_type.replace(/_/g, ' ') : 'None'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                {summary?.riskState?.reason_summary || 'No barrier currently active.'}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Latest Intervention
            </h3>
            <div className="p-3 bg-sky-50/60 rounded-xl border border-sky-100">
              <span className="text-xs font-bold text-sky-900 block">
                {summary?.currentIntervention?.title || 'One-minute starter'}
              </span>
              <p className="text-[11px] text-sky-700 mt-1">
                {summary?.currentIntervention?.description || 'Gentle micro-action completed.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

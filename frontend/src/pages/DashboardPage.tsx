import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ModeBadge } from '../components/ModeBadge';
import { StatCard } from '../components/StatCard';
import { WeeklyChart } from '../components/WeeklyChart';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flame,
  AlertCircle,
  Play,
  RotateCcw,
  HeartPulse,
  Info
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, refreshSummary, bannerAlert, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);

  const profile = summary?.profile;
  const riskState = summary?.riskState;
  const todayActivity = summary?.todayActivity;
  const currentIntervention = summary?.currentIntervention;
  const appMode = riskState?.app_mode || 'normal';

  const isCompletedToday = todayActivity?.status === 'completed';

  const handleCompleteActivity = async () => {
    setLoading(true);
    try {
      await apiClient.completeActivity(todayActivity?.id);
      setBannerAlert('Great work! Today’s movement is recorded.');
      await refreshSummary();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStruggling = () => {
    navigate('/checkin');
  };

  const handleDailyCheckin = () => {
    navigate('/checkin');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      {/* Dynamic Global Banner Alert */}
      {bannerAlert && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 px-4 py-3 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>{bannerAlert}</span>
          </div>
          <button
            onClick={() => setBannerAlert(null)}
            className="text-xs text-sky-600 hover:text-sky-800 font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Mode-Specific Urgent Action Callout */}
      {appMode === 'rescue' && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-3xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="bg-white/20 text-white font-bold text-xs uppercase px-2.5 py-1 rounded-full backdrop-blur-xs">
              Rescue Mode Active
            </span>
            <span className="text-xs text-amber-100 font-medium">Zero guilt restart</span>
          </div>
          <h2 className="text-xl font-bold">Your routine was disrupted. Start with one minute.</h2>
          <p className="text-xs sm:text-sm text-amber-100">
            No pressure for a full workout. One micro-action keeps your continuity unbroken.
          </p>
          <div className="pt-1">
            <button
              onClick={() => navigate('/mode/rescue')}
              className="px-5 py-2.5 bg-white text-amber-900 hover:bg-amber-50 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-amber-900" />
              <span>Open One-Minute Starter</span>
            </button>
          </div>
        </div>
      )}

      {appMode === 'safety' && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="bg-rose-100 text-rose-800 font-bold text-xs uppercase px-2.5 py-1 rounded-full">
              Safety Pause Active
            </span>
            <button
              onClick={() => navigate('/mode/safety')}
              className="text-xs text-rose-700 underline font-medium"
            >
              View safety guidelines
            </button>
          </div>
          <p className="text-xs sm:text-sm text-rose-800">
            Physical discomfort reported. Exercise is paused for today. Rest and take care of your body.
          </p>
        </div>
      )}

      {appMode === 'recovery' && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="bg-purple-100 text-purple-800 font-bold text-xs uppercase px-2.5 py-1 rounded-full">
              Recovery Mode Active
            </span>
            <button
              onClick={() => navigate('/mode/recovery')}
              className="text-xs text-purple-700 underline font-bold"
            >
              Open gentle recovery session &rarr;
            </button>
          </div>
          <p className="text-xs sm:text-sm text-purple-800">
            Fatigue or stress noted. Focus on gentle breath and light mobility today.
          </p>
        </div>
      )}

      {appMode === 'light' && (
        <div className="bg-sky-50 border border-sky-200 text-sky-900 p-5 rounded-3xl shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="bg-sky-100 text-sky-800 font-bold text-xs uppercase px-2.5 py-1 rounded-full">
              Light Mode Active
            </span>
            <button
              onClick={() => navigate('/mode/light')}
              className="text-xs text-sky-700 underline font-bold"
            >
              Open light movement &rarr;
            </button>
          </div>
          <p className="text-xs sm:text-sm text-sky-800">
            Short on time or feeling routine friction? A simplified micro-movement is ready.
          </p>
        </div>
      )}

      {/* Main Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              Hello, {profile?.name || 'Friend'} 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Goal: <span className="font-semibold text-slate-700">{profile?.goal || 'Build consistency'}</span> • Tone: {profile?.communication_tone || 'Friendly'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ModeBadge mode={appMode} size="md" />
        </div>
      </div>

      {/* Today's Activity Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Today’s Planned Activity
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {todayActivity?.title || '10-minute beginner movement'}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>{todayActivity?.duration_minutes || 10} minutes</span>
          </div>
        </div>

        {isCompletedToday ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 block">Completed for today!</span>
              <span className="text-xs text-emerald-700">
                You showed up and kept your momentum. Small actions still count.
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCompleteActivity}
              disabled={loading}
              className="w-full sm:flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete activity</span>
            </button>

            <button
              onClick={handleStruggling}
              className="w-full sm:flex-1 py-3.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>I’m struggling today</span>
            </button>

            <button
              onClick={handleDailyCheckin}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Daily check-in</span>
            </button>
          </div>
        )}

        {/* Small reassurance card as requested */}
        <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/70 flex items-start gap-2.5 text-xs text-slate-600">
          <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <span>
            <strong className="text-slate-800">Missed a day?</strong> You can restart without starting over. We adjust your plan to what is happening today.
          </span>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Weekly Activity Count"
          value={summary?.weeklyCount || 0}
          subtitle="Completed sessions in past 7 days"
          icon={Flame}
          accentColor="sky"
        />
        <StatCard
          title="Consistency Score"
          value={`${summary?.consistencyScore || 60}%`}
          subtitle="Non-penalizing continuity"
          icon={CheckCircle2}
          accentColor="emerald"
          progress={summary?.consistencyScore || 60}
        />
        <StatCard
          title="Comeback Score"
          value={`${summary?.comebackScore || 40}`}
          subtitle="Recovery actions completed"
          icon={RotateCcw}
          accentColor="purple"
          progress={summary?.comebackScore || 40}
        />
      </div>

      {/* Weekly Progress Chart */}
      <WeeklyChart activities={summary?.recentActivities || []} />
    </div>
  );
};

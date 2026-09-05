import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import {
  Bell,
  MessageSquare,
  Moon,
  PauseCircle,
  ShieldCheck,
  Trash2,
  LogOut,
  Check
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { summary, refreshSummary, resetDemoData, setBannerAlert } = useApp();
  const [loading, setLoading] = useState(false);

  const [tone, setTone] = useState(summary?.profile?.communication_tone || 'Friendly');
  const [quietHours, setQuietHours] = useState(Boolean(summary?.profile?.quiet_hours_enabled));
  const [planPaused, setPlanPaused] = useState(Boolean(summary?.planPaused));
  const [notificationPref, setNotificationPref] = useState('Gentle reminders');

  const tones = ['Gentle', 'Friendly', 'Direct'];
  const notifications = ['Gentle reminders', 'Only when struggling', 'None (self-directed)'];

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await apiClient.updateProfile({
        communication_tone: tone,
        quiet_hours_enabled: quietHours,
        plan_paused: planPaused
      });
      await refreshSummary();
      setBannerAlert('Preferences saved successfully.');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async () => {
    const nextState = !planPaused;
    setPlanPaused(nextState);
    try {
      await apiClient.togglePausePlan(nextState);
      await refreshSummary();
      setBannerAlert(nextState ? 'Plan paused. Rest well!' : 'Plan resumed. Welcome back!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDemoData = async () => {
    if (confirm('Are you sure you want to reset and clear your demo data?')) {
      await resetDemoData();
      navigate('/dashboard');
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('revive_user_id');
    navigate('/');
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings & Privacy</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Customize how Revive Motion speaks with you and protects your boundaries.
          </p>
        </div>

        {/* Communication Tone */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
            Communication Tone
          </label>
          <div className="grid grid-cols-3 gap-2">
            {tones.map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                  tone === t
                    ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-sky-600" />
            Notification Preference
          </label>
          <div className="space-y-1.5">
            {notifications.map((n) => (
              <button
                key={n}
                onClick={() => setNotificationPref(n)}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-medium flex items-center justify-between transition-all ${
                  notificationPref === n
                    ? 'border-sky-500 bg-sky-50/60 text-sky-900 font-semibold'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{n}</span>
                {notificationPref === n && <Check className="w-4 h-4 text-sky-600" />}
              </button>
            ))}
          </div>
        </div>

        {/* Quiet Hours Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Moon className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Quiet Hours</span>
              <span className="text-[11px] text-slate-500">Mute prompts between 9 PM and 8 AM</span>
            </div>
          </div>
          <button
            onClick={() => setQuietHours(!quietHours)}
            className={`w-11 h-6 rounded-full transition-colors relative ${
              quietHours ? 'bg-sky-600' : 'bg-slate-200'
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                quietHours ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Pause Plan Option */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PauseCircle className="w-4 h-4 text-slate-500" />
            <div>
              <span className="text-xs font-bold text-slate-800 block">Pause Routine Plan</span>
              <span className="text-[11px] text-slate-500">Stop reminders without breaking history</span>
            </div>
          </div>
          <button
            onClick={handleTogglePause}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
              planPaused
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
          >
            {planPaused ? 'Paused (Resume)' : 'Pause Plan'}
          </button>
        </div>

        {/* Privacy Explanation as requested */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Privacy & Local Storage</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            All your check-ins and recovery records run locally inside your personal SQLite database. No external tracking, no cloud telemetry, and no medical profiling.
          </p>
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm transition-all shadow-xs"
        >
          {loading ? 'Saving...' : 'Save Preferences'}
        </button>

        {/* Reset & Sign Out */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button
            onClick={handleDeleteDemoData}
            className="py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Demo Data</span>
          </button>

          <button
            onClick={handleSignOut}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

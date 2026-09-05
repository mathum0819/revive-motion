import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { ArrowRight, Check } from 'lucide-react';

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSummary } = useApp();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('Alex');
  const [goal, setGoal] = useState('Build consistency');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [preferredTime, setPreferredTime] = useState('Morning');
  const [tone, setTone] = useState('Friendly');

  const goals = [
    { label: 'Build consistency', desc: 'Focus on small, daily habits that stick' },
    { label: 'Improve strength', desc: 'Develop foundational full-body strength' },
    { label: 'Improve mobility', desc: 'Feel loose, pain-free, and flexible' },
    { label: 'General fitness', desc: 'Feel energized and balanced every day' }
  ];

  const experiences = ['Beginner', 'Intermediate'];
  const times = ['Morning', 'Afternoon', 'Evening', 'Flexible'];
  const tones = [
    { label: 'Gentle', desc: 'Extra kind, calm, zero pressure' },
    { label: 'Friendly', desc: 'Warm, positive, encouraging' },
    { label: 'Direct', desc: 'Clear, concise, action-focused' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.updateProfile({
        name,
        goal,
        experience_level: experienceLevel,
        preferred_time: preferredTime,
        communication_tone: tone
      });
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to save profile:', err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
            Quick Onboarding
          </span>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Let’s personalize your rhythm</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Revive Motion adapts to your life, never the other way around.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              What should we call you?
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
              placeholder="Your name"
            />
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Primary Habit Goal
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goals.map((g) => {
                const selected = goal === g.label;
                return (
                  <button
                    type="button"
                    key={g.label}
                    onClick={() => setGoal(g.label)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-sky-500 bg-sky-50/50 text-slate-900 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{g.label}</span>
                      {selected && <Check className="w-4 h-4 text-sky-600" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{g.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Experience Level & Preferred Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Experience Level
              </label>
              <div className="flex gap-2">
                {experiences.map((exp) => (
                  <button
                    type="button"
                    key={exp}
                    onClick={() => setExperienceLevel(exp)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all ${
                      experienceLevel === exp
                        ? 'border-sky-500 bg-sky-50 text-sky-800 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                {times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Communication Tone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Communication Tone
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tones.map((t) => {
                const selected = tone === t.label;
                return (
                  <button
                    type="button"
                    key={t.label}
                    onClick={() => setTone(t.label)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      selected
                        ? 'border-sky-500 bg-sky-50 text-slate-900 ring-1 ring-sky-500'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <span className="font-semibold text-xs block">{t.label}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{t.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Saving...' : 'Enter Revive Motion'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

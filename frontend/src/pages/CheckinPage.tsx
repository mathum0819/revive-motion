import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { BarrierType, SupportNeed } from '../types';
import {
  Clock,
  BatteryMedium,
  Heart,
  Smile,
  AlertTriangle,
  Flame,
  CheckCircle,
  HelpCircle,
  Calendar,
  Frown,
  ArrowRight
} from 'lucide-react';

export const CheckinPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSummary } = useApp();
  const [loading, setLoading] = useState(false);

  const [energy, setEnergy] = useState<'high' | 'medium' | 'low'>('medium');
  const [mood, setMood] = useState<'good' | 'okay' | 'low'>('okay');
  const [motivation, setMotivation] = useState<number>(3);
  const [timeAvailable, setTimeAvailable] = useState<number>(5);
  const [completedActivity, setCompletedActivity] = useState<boolean>(false);
  const [reason, setReason] = useState<BarrierType | null>('lack_of_time');
  const [supportNeeded, setSupportNeeded] = useState<SupportNeed>('shorter');
  const [painReported, setPainReported] = useState<boolean>(false);
  const [note, setNote] = useState<string>('');

  const barrierOptions: { id: BarrierType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'lack_of_time', label: 'I did not have enough time', icon: Clock },
    { id: 'fatigue', label: 'I felt tired', icon: BatteryMedium },
    { id: 'stress', label: 'I felt stressed or low', icon: Frown },
    { id: 'boredom', label: 'I got bored', icon: Flame },
    { id: 'difficulty', label: 'It felt too difficult', icon: HelpCircle },
    { id: 'forgetfulness', label: 'I forgot', icon: Calendar },
    { id: 'routine_disruption', label: 'My routine changed', icon: Clock },
    { id: 'pain', label: 'I have pain or discomfort', icon: AlertTriangle },
    { id: 'other', label: 'Something else', icon: HelpCircle }
  ];

  const supportOptions: { id: SupportNeed; label: string }[] = [
    { id: 'shorter', label: 'A shorter activity' },
    { id: 'easier', label: 'An easier activity' },
    { id: 'different', label: 'Something different' },
    { id: 'reminder', label: 'A reminder later' },
    { id: 'rest', label: 'A rest or recovery option' },
    { id: 'encouragement', label: 'Encouragement' }
  ];

  const handleReasonSelect = (rId: BarrierType) => {
    setReason(rId);
    if (rId === 'pain') {
      setPainReported(true);
    } else {
      setPainReported(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await apiClient.submitCheckin({
        energy,
        mood,
        motivation,
        time_available: timeAvailable,
        workout_completed: completedActivity,
        reason: painReported ? 'pain' : reason,
        support_needed: supportNeeded,
        pain_reported: painReported,
        note
      });

      await refreshSummary();

      // Navigate to barrier result screen passing the response state
      navigate('/barrier-result', { state: response });
    } catch (err) {
      console.error('Checkin error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 bg-sky-50 px-2.5 py-1 rounded-full">
            Daily Reason-Based Check-in
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            What made today’s activity difficult?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Zero judgment. Identifying what’s going on helps us find a realistic next step.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-7">
          {/* Completed Activity Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Were you able to complete today’s activity?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCompletedActivity(true)}
                className={`py-3 px-4 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all ${
                  completedActivity
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Yes, completed</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletedActivity(false)}
                className={`py-3 px-4 rounded-xl font-semibold text-sm border flex items-center justify-center gap-2 transition-all ${
                  !completedActivity
                    ? 'border-sky-500 bg-sky-50 text-sky-800 ring-2 ring-sky-500/20'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>No, not yet / struggling</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics: Energy, Mood, Motivation, Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Energy */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Energy Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['high', 'medium', 'low'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setEnergy(lvl)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      energy === lvl
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Mood */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mood
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['good', 'okay', 'low'] as const).map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setMood(m)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${
                      mood === m
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Motivation rating */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Motivation (1 to 5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    type="button"
                    key={val}
                    onClick={() => setMotivation(val)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                      motivation === val
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Time available */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Time Available Today
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 5, 10, 30].map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => setTimeAvailable(t)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      timeAvailable === t
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Barrier Selection Cards (If not completed or struggling) */}
          {!completedActivity && (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                What got in the way today? (Select primary reason)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {barrierOptions.map((opt) => {
                  const selected = reason === opt.id;
                  const Icon = opt.icon;
                  const isPainOpt = opt.id === 'pain';

                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => handleReasonSelect(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                        selected
                          ? isPainOpt
                            ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/30'
                            : 'border-sky-500 bg-sky-50/70 ring-2 ring-sky-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl ${
                          selected
                            ? isPainOpt
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-sky-100 text-sky-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-xs sm:text-sm font-semibold ${
                          selected
                            ? isPainOpt
                              ? 'text-rose-900'
                              : 'text-slate-900'
                            : 'text-slate-700'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desired Support Cards */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              What would help you right now?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {supportOptions.map((s) => {
                const selected = supportNeeded === s.id;
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => setSupportNeeded(s.id)}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold transition-all ${
                      selected
                        ? 'border-sky-500 bg-sky-50 text-sky-900 ring-1 ring-sky-500'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pain / Discomfort Checkbox */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="pain_toggle"
              checked={painReported}
              onChange={(e) => {
                setPainReported(e.target.checked);
                if (e.target.checked) setReason('pain');
              }}
              className="mt-1 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300"
            />
            <label htmlFor="pain_toggle" className="text-xs text-amber-900">
              <span className="font-bold block">I am experiencing physical pain or discomfort</span>
              <span className="text-amber-700 text-[11px] block mt-0.5">
                We will activate a gentle Safety Pause. We never encourage exercising through pain.
              </span>
            </label>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Quick optional note
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Back-to-back exams, feeling drained..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500/20"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-bold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Analyzing your check-in...' : 'Find my next step'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

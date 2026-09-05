import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { RotateCcw, ArrowRight, ShieldCheck, HeartPulse, Sparkles, CheckCircle2 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshSummary } = useApp();
  const [loading, setLoading] = React.useState(false);

  const handleTryDemo = async () => {
    setLoading(true);
    try {
      await apiClient.startDemo();
      await refreshSummary();
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-sky-50 border border-sky-200 text-sky-700 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Dual-Mode Fitness Continuity & Recovery</span>
        </div>

        {/* Hero Title & Tagline */}
        <div className="space-y-3">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <RotateCcw className="w-9 h-9 stroke-[2.5]" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Revive Motion
          </h1>
          <p className="text-xl sm:text-2xl font-semibold text-sky-700">
            Fitness that helps you come back.
          </p>
          <p className="text-base sm:text-lg text-slate-600 max-w-lg mx-auto leading-relaxed pt-2">
            Identifies why you’re struggling before you fall off track. No guilt, no broken streaks, just the right next step.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={handleTryDemo}
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-base shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Starting...' : 'Try Demo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/signin')}
            className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-base transition-colors"
          >
            Sign In
          </button>
        </div>

        {/* Key Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-slate-200/80 text-left">
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">Identifies The Barrier</h4>
            <p className="text-xs text-slate-500 mt-1">
              Busy, tired, bored, or stressed? We tailor the plan to the real cause.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <HeartPulse className="w-5 h-5 text-purple-600 mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">Gentle Rescue Mode</h4>
            <p className="text-xs text-slate-500 mt-1">
              When inconsistency strikes, get 1 safe micro-action. Zero guilt.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-rose-600 mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">Safety First</h4>
            <p className="text-xs text-slate-500 mt-1">
              Pain or discomfort immediately activates Safety Pause. Rest comes first.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

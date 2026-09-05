import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModeBadge } from '../components/ModeBadge';
import { ShieldAlert, HeartHandshake, ArrowLeft } from 'lucide-react';

export const SafetyPausePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <ModeBadge mode="safety" size="lg" />
          <span className="text-xs text-rose-700 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Care & Rest First
          </span>
        </div>

        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Safety Pause Active</h1>
          <p className="text-sm text-slate-700 leading-relaxed">
            You reported physical pain or discomfort. Exercise should never hurt or cause strain. We have safely paused your activity recommendations today.
          </p>
        </div>

        <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/80 space-y-3">
          <h3 className="font-bold text-rose-950 text-sm flex items-center gap-2">
            <HeartHandshake className="w-4 h-4 text-rose-600" />
            Safety Guidelines
          </h3>
          <ul className="text-xs sm:text-sm text-rose-900/90 space-y-2 list-disc list-inside">
            <li>Do not attempt to exercise through sharp or persistent pain.</li>
            <li>Take time to rest, elevate, or stay comfortably hydrated.</li>
            <li>
              If you experience severe pain, swelling, numbness, dizziness, chest pressure, or symptoms that worsen, please consult a qualified healthcare professional immediately.
            </li>
          </ul>
        </div>

        <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3 italic">
          Disclaimer: Revive Motion is a fitness habit-support tool, not a medical or physical therapy service.
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Sparkles, Calendar } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { loadDemoDay, resetDemoData, loading, activeDemoDay } = useApp();

  const days = [
    { day: 1, label: 'Day 1: Normal', desc: 'Active & consistent' },
    { day: 2, label: 'Day 2: Busy', desc: 'Lack of time -> Light' },
    { day: 3, label: 'Day 3: Bored', desc: 'Boredom -> Variety' },
    { day: 4, label: 'Day 4: Rescue', desc: 'Fatigue -> Rescue Mode' }
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-3 sm:px-6 sticky top-0 z-50 border-b border-slate-800 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded text-[11px] border border-indigo-500/30">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span>HACKATHON DEMO</span>
          </div>
          <span className="hidden sm:inline text-slate-400">Jump directly through the 4-day progression:</span>
        </div>

        <div className="flex items-center flex-wrap gap-1.5">
          {days.map((d) => {
            const isActive = activeDemoDay === d.day;
            return (
              <button
                key={d.day}
                onClick={() => loadDemoDay(d.day)}
                disabled={loading}
                title={d.desc}
                className={`px-2.5 py-1 rounded transition-all flex items-center gap-1 font-medium text-[11px] ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-sm ring-1 ring-white/30 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Calendar className="w-2.5 h-2.5 opacity-70" />
                {d.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block"></div>

          <button
            onClick={() => loadDemoDay(4)}
            disabled={loading}
            className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded text-[11px] font-medium transition-colors shadow-sm"
          >
            Load Full Demo
          </button>

          <button
            onClick={resetDemoData}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-1 rounded text-[11px] flex items-center gap-1 transition-colors border border-slate-700"
            title="Reset to fresh clean state"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

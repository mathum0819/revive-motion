import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor?: 'emerald' | 'sky' | 'purple' | 'amber' | 'rose';
  progress?: number;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'sky',
  progress
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      bar: 'bg-emerald-500',
      border: 'border-emerald-100'
    },
    sky: {
      bg: 'bg-sky-50',
      text: 'text-sky-700',
      bar: 'bg-sky-500',
      border: 'border-sky-100'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      bar: 'bg-purple-500',
      border: 'border-purple-100'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      border: 'border-amber-100'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      bar: 'bg-rose-500',
      border: 'border-rose-100'
    }
  }[accentColor];

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">{value}</span>
      </div>

      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}

      {progress !== undefined && (
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};

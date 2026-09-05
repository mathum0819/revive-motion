import React from 'react';
import { AppMode } from '../types';
import { ShieldCheck, Zap, HeartPulse, LifeBuoy, AlertCircle } from 'lucide-react';

interface ModeBadgeProps {
  mode: AppMode;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const ModeBadge: React.FC<ModeBadgeProps> = ({ mode, size = 'md', showIcon = true }) => {
  const configs: Record<
    AppMode,
    { label: string; bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    normal: {
      label: 'Normal Mode',
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: ShieldCheck
    },
    light: {
      label: 'Light Mode',
      bg: 'bg-sky-50 text-sky-800 border-sky-200',
      text: 'text-sky-700',
      border: 'border-sky-200',
      icon: Zap
    },
    recovery: {
      label: 'Recovery Mode',
      bg: 'bg-purple-50 text-purple-800 border-purple-200',
      text: 'text-purple-700',
      border: 'border-purple-200',
      icon: HeartPulse
    },
    rescue: {
      label: 'Rescue Mode',
      bg: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      text: 'text-amber-700',
      border: 'border-amber-300',
      icon: LifeBuoy
    },
    safety: {
      label: 'Safety Pause',
      bg: 'bg-rose-50 text-rose-800 border-rose-200 font-semibold',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: AlertCircle
    }
  };

  const config = configs[mode] || configs.normal;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1 text-xs sm:text-sm font-medium gap-1.5',
    lg: 'px-4 py-1.5 text-sm sm:text-base font-semibold gap-2'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border shadow-sm transition-all ${config.bg} ${sizeClasses}`}
    >
      {showIcon && <Icon className={iconSizes} />}
      <span>{config.label}</span>
    </span>
  );
};

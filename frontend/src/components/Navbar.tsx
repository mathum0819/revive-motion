import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ModeBadge } from './ModeBadge';
import { Activity, RotateCcw, Settings, HeartPulse, Sparkles } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { summary } = useApp();
  const location = useLocation();

  const appMode = summary?.riskState?.app_mode || 'normal';

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: Activity },
    { to: '/checkin', label: 'Check-In', icon: Sparkles },
    { to: '/recovery-dashboard', label: 'Recovery Hub', icon: HeartPulse },
    { to: '/settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-8 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-sky-200 group-hover:scale-105 transition-transform">
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-tight">
                Revive Motion
              </span>
              <span className="text-[10px] text-slate-400 font-medium block leading-none">
                Continuity & Recovery
              </span>
            </div>
          </Link>

          <div className="hidden sm:block pl-3 border-l border-slate-200">
            <ModeBadge mode={appMode} size="sm" />
          </div>
        </div>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

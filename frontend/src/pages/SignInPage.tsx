import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useApp } from '../context/AppContext';
import { RotateCcw, ArrowRight } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const [email, setEmail] = useState('alex@example.com');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshSummary } = useApp();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.signIn(email);
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
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-3">
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500">Sign in to resume your gentle movement journey</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <button
            onClick={() => {
              apiClient.startDemo().then(() => {
                refreshSummary();
                navigate('/dashboard');
              });
            }}
            className="text-xs text-sky-600 hover:text-sky-700 font-medium underline"
          >
            Or jump directly with Hackathon Demo
          </button>
        </div>
      </div>
    </div>
  );
};

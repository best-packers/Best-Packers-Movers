'use client';

import { useState } from 'react';
import { ShieldAlert, Lock, User, KeyRound, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';

export default function AdminLoginGate() {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!userId.trim() || !password) {
      setError('Please provide both User ID and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Reload page to re-render Server Component layout with active session
        window.location.reload();
      } else {
        setError(data.error || 'Authentication failed. Access denied.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Glow ambient card container */}
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-600/20 rounded-3xl blur-xl opacity-75"></div>
          
          <div className="relative bg-slate-900/90 border border-slate-800 backdrop-blur-2xl rounded-2xl p-7 sm:p-9 shadow-2xl space-y-6">
            {/* Header Badge */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 text-white mb-1">
                <Lock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
                  BestPackerMovers <Sparkles className="w-4 h-4 text-amber-500" />
                </h1>
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-widest">
                  Restricted Command Center
                </p>
                <p className="text-xs text-slate-400">
                  Administrative credentials required to proceed.
                </p>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User ID Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  User ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter Admin User ID"
                    required
                    autoFocus
                    autoComplete="username"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Security Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying Access...</span>
                  </>
                ) : (
                  <>
                    <span>Unlock Command Center</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quiet Footer */}
            <div className="pt-2 text-center">
              <a
                href="/"
                className="text-[11px] text-slate-500 hover:text-slate-400 transition-colors inline-block"
              >
                ← Return to Public Website
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ShieldAlert, Lock, User, KeyRound, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

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
    <div className="min-h-screen bg-[#080C12] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glows matching NPM-Website */}
      <div className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] bg-[radial-gradient(circle,rgba(247,183,49,0.12)_0%,transparent_70%)] pointer-events-none z-0" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[55%] h-[55%] bg-[radial-gradient(circle,rgba(193,18,31,0.1)_0%,transparent_70%)] pointer-events-none z-0" />
      
      {/* Background grid texture */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none z-0" />

      <div className="w-full max-w-[460px] relative z-10">
        {/* Luxury Glassmorphism Card */}
        <div className="bg-[#162236]/90 backdrop-blur-2xl border border-white/10 border-t-[3px] border-t-[#F7B731] rounded-2xl sm:rounded-3xl p-7 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] space-y-7">
          
          {/* Header Brand Section */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F7B731] to-[#D4951A] shadow-[0_8px_24px_rgba(247,183,49,0.3)] text-[#080C12] mb-1">
              <Lock className="w-8 h-8 stroke-[2.5]" />
            </div>
            
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
                <span>Best<span className="text-[#F7B731]">Packer</span>Movers</span>
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B731]/15 border border-[#F7B731]/30 text-[#F7B731] text-[10px] font-extrabold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                <span>Administrative Command Portal</span>
              </div>
              <p className="text-xs text-[#A8B2C1] pt-1">
                Authorized credentials required to access the logistics empire controls.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-[#C1121F]/15 border border-[#C1121F]/40 text-[#FF6B6B] text-xs font-semibold flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B2C1]">
                Admin Username / ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7585]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="e.g. admin or username"
                  required
                  autoFocus
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-3 bg-[#080C12]/75 border border-white/10 rounded-xl text-sm text-white placeholder-[#6B7585] focus:outline-none focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] transition-all font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B2C1]">
                Secret Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B7585]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-11 py-3 bg-[#080C12]/75 border border-white/10 rounded-xl text-sm text-white placeholder-[#6B7585] focus:outline-none focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B7585] hover:text-[#F7B731] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all shadow-[0_4px_20px_rgba(247,183,49,0.35)] active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#080C12] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Unlock Command Dashboard</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </>
              )}
            </button>
          </form>

          {/* Footer Guarantee */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-[#6B7585]">
            <Link
              href="/"
              className="hover:text-[#F7B731] transition-colors flex items-center gap-1.5 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Directory</span>
            </Link>

            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>HMAC-256 Protected</span>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function AdminLogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch('/api/admin/auth', { method: 'DELETE' });
    } catch (_) {}
    window.location.reload();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
      title="Securely Lock Admin Portal"
    >
      <span className="flex items-center gap-2">
        <LogOut className="w-3.5 h-3.5" />
        <span>{isLoggingOut ? 'Locking...' : 'Lock & Log Out'}</span>
      </span>
      <span className="text-[10px] uppercase font-mono tracking-wider opacity-70">Exit</span>
    </button>
  );
}

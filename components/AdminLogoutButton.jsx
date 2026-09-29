'use client';

import { useState } from 'react';
import { LogOut, Lock } from 'lucide-react';

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
      className="w-full py-2.5 px-3.5 rounded-xl text-xs font-bold text-[#E63946] bg-[#C1121F]/10 hover:bg-[#C1121F] hover:text-white transition-all duration-200 border border-[#C1121F]/30 hover:border-[#C1121F] flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
      title="Securely Lock Admin Portal"
    >
      <LogOut className="w-3.5 h-3.5" />
      <span>{isLoggingOut ? 'Terminating Session...' : 'Lock & Secure Log Out'}</span>
    </button>
  );
}

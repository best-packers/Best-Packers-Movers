import Link from 'next/link';
import { cookies } from 'next/headers';
import { 
  ExternalLink, ShieldCheck, Sparkles, Truck 
} from 'lucide-react';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/adminAuth';
import AdminLoginGate from '@/components/AdminLoginGate';
import AdminLogoutButton from '@/components/AdminLogoutButton';
import AdminSidebarNav from '@/components/AdminSidebarNav';

export const metadata = {
  title: 'Admin Command Center | BestPackerMovers.com',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAdminSessionToken(sessionToken);

  if (!isAuthenticated) {
    return <AdminLoginGate />;
  }

  return (
    <div className="min-h-screen bg-[#080C12] text-white flex flex-col md:flex-row font-sans">
      {/* 280px Executive Fixed Sidebar Navigation (NPM-Website Master Standard) */}
      <aside className="w-full md:w-[280px] bg-[#0D1B2A] border-r border-white/5 p-5 md:p-6 flex flex-col justify-between flex-shrink-0 relative z-20">
        <div className="space-y-6">
          {/* Brand Identity */}
          <div className="pb-5 border-b border-white/5 space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F7B731] via-[#D4951A] to-[#F7B731] flex items-center justify-center font-bold text-[#080C12] shadow-[0_4px_16px_rgba(247,183,49,0.3)]">
                <Truck className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-extrabold text-white tracking-tight flex items-center gap-1">
                  <span>Best<span className="text-[#F7B731]">Packer</span>Movers</span>
                </div>
                <div className="text-[10px] text-[#F7B731] font-bold uppercase tracking-wider">
                  Admin Command Console
                </div>
              </div>
            </div>

            {/* Active Session Status Beacon */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#162236]/80 border border-white/5 text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active Administrator</span>
              </span>
              <span className="text-[10px] text-[#A8B2C1] font-mono">v5.0</span>
            </div>
          </div>

          {/* Navigation Items */}
          <AdminSidebarNav />
        </div>

        {/* Bottom Sidebar Footprint */}
        <div className="pt-6 border-t border-white/5 space-y-3">
          {/* Live Website Link */}
          <Link
            href="/"
            target="_blank"
            className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-[#F7B731] hover:bg-[#F7B731] hover:text-[#080C12] transition-all duration-200 border border-[#F7B731]/40 flex items-center justify-center gap-2 group shadow-xs"
          >
            <span>View Public Directory</span>
            <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>

          {/* Secure Logout Button */}
          <AdminLogoutButton />

          {/* Slot #1 Enforcement Pill */}
          <div className="p-3 rounded-xl bg-[#F7B731]/10 border border-[#F7B731]/20 text-[11px] text-[#FFD166] space-y-1">
            <div className="font-extrabold flex items-center gap-1 text-[#F7B731]">
              <ShieldCheck className="w-3.5 h-3.5" /> Slot #1 Enforced
            </div>
            <p className="text-[10px] text-[#A8B2C1] leading-relaxed">
              National Packers &amp; Movers permanently pinned as #1 Platinum Partner across all 7,606+ city routes.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Administrative Workspace */}
      <main className="flex-1 bg-[#080C12] min-h-screen p-5 sm:p-8 lg:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  );
}

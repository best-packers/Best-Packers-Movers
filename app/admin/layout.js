import Link from 'next/link';
import { cookies } from 'next/headers';
import { 
  LayoutDashboard, Globe, Users, Route, 
  Inbox, ExternalLink, ShieldAlert, Sparkles 
} from 'lucide-react';
import { ADMIN_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/adminAuth';
import AdminLoginGate from '@/components/AdminLoginGate';
import AdminLogoutButton from '@/components/AdminLogoutButton';

export const metadata = {
  title: 'Admin Omnipotence Portal | BestPackerMovers.com',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = verifyAdminSessionToken(sessionToken);

  // If unauthenticated, gate all /admin routes behind high-security credentials barrier
  if (!isAuthenticated) {
    return <AdminLoginGate />;
  }

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Live Google Maps Crawler', href: '/admin/crawler', icon: Globe },
    { label: 'Mover Rankings & Badges', href: '/admin/movers', icon: Users },
    { label: 'SERP Routes & Meta Tags', href: '/admin/routes', icon: Route },
    { label: 'Inbound CRM Leads', href: '/admin/leads', icon: Inbox },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between flex-shrink-0">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-white shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Admin <span className="text-amber-500">Omnipotence</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              BestPackerMovers Command Engine
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Icon className="w-4 h-4 text-amber-500" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <span>View Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          
          <AdminLogoutButton />

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
            <div className="font-bold flex items-center gap-1 mb-0.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Slot #1 Enforced
            </div>
            <div>National Packers & Movers is permanently pinned as #1 Platinum Partner.</div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Globe, Users, Route, 
  Inbox, Layers, ShieldCheck, ChevronRight 
} from 'lucide-react';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Google Maps Crawler', href: '/admin/crawler', icon: Globe },
    { label: 'Mover Directory & Unlocks', href: '/admin/movers', icon: Users },
    { label: 'SERP Intent Matrix', href: '/admin/routes', icon: Route },
    { label: 'Inbound CRM Leads', href: '/admin/leads', icon: Inbox },
  ];

  return (
    <nav className="space-y-1.5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all duration-200 group ${
              isActive
                ? 'bg-[#F7B731] text-[#080C12] shadow-[0_4px_16px_rgba(247,183,49,0.3)]'
                : 'text-[#A8B2C1] hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#080C12]' : 'text-[#F7B731] group-hover:scale-110'}`} />
              <span className="tracking-wide">{item.label}</span>
            </div>
            {isActive && <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />}
          </Link>
        );
      })}
    </nav>
  );
}

import { query } from '@/lib/db';
import Link from 'next/link';
import { 
  Users, MapPin, Route, Inbox, 
  ArrowUpRight, Globe, ShieldCheck, PhoneCall, 
  Sparkles, Award, ExternalLink, ArrowRight, Zap, CheckCircle2
} from 'lucide-react';

export default async function AdminDashboardPage() {
  let stats = {
    leads: 0,
    cities: 0,
    movers: 0,
    routes: 0,
    recentLeads: [],
  };

  try {
    const leadsRes = await query('SELECT COUNT(id) as count FROM directory_leads');
    const citiesRes = await query('SELECT COUNT(id) as count FROM cities');
    const moversRes = await query('SELECT COUNT(id) as count FROM movers');
    const routesRes = await query('SELECT COUNT(id) as count FROM intent_routes');
    const recentLeadsRes = await query(`
      SELECT l.*, m.name as mover_name 
      FROM directory_leads l 
      LEFT JOIN movers m ON l.mover_id = m.id 
      ORDER BY l.created_at DESC LIMIT 6
    `);

    stats = {
      leads: Number(leadsRes.rows[0]?.count || 0),
      cities: Number(citiesRes.rows[0]?.count || 0),
      movers: Number(moversRes.rows[0]?.count || 0),
      routes: Number(routesRes.rows[0]?.count || 0),
      recentLeads: recentLeadsRes.rows || [],
    };
  } catch (err) {
    console.error('Error fetching admin dashboard stats:', err);
  }

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Top Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B731]/15 border border-[#F7B731]/30 text-[#F7B731] text-[10px] font-extrabold uppercase tracking-widest">
            <Sparkles className="w-3 h-3" />
            <span>National Logistics Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Executive Command Console</span>
          </h1>
          <p className="text-xs text-[#A8B2C1]">
            Central lead monopolization, ranking audit, crawler automation, and SERP telemetry for National Packers &amp; Movers.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            href="/admin/crawler"
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all shadow-[0_4px_16px_rgba(247,183,49,0.3)] active:scale-95 flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Launch Live Crawler</span>
          </Link>
        </div>
      </div>

      {/* 4-Column Luxury Metric Stat Matrix (NPM-Website Master Standard) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Metric 1: Inbound CRM Leads */}
        <div className="p-5 rounded-2xl bg-[#162236] border border-white/5 relative overflow-hidden shadow-lg group hover:border-[#F7B731]/40 transition-all">
          <div className="flex items-center justify-between text-[#A8B2C1] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Inbound Leads</span>
            <div className="w-8 h-8 rounded-xl bg-[#F7B731]/15 text-[#F7B731] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {stats.leads}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Intercepted to HQ</span>
          </div>
        </div>

        {/* Metric 2: Active Cities & Hubs */}
        <div className="p-5 rounded-2xl bg-[#162236] border border-white/5 relative overflow-hidden shadow-lg group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-[#A8B2C1] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cities &amp; Towns</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {stats.cities}
          </div>
          <div className="mt-2 text-[11px] text-blue-400 font-semibold truncate">
            Across 36 States &amp; UTs
          </div>
        </div>

        {/* Metric 3: Verified Movers */}
        <div className="p-5 rounded-2xl bg-[#162236] border border-white/5 relative overflow-hidden shadow-lg group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-[#A8B2C1] text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Movers</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {stats.movers}
          </div>
          <div className="mt-2 text-[11px] text-[#F7B731] font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>National Packers #1 Pinned</span>
          </div>
        </div>

        {/* Metric 4: Programmatic Intent Routes */}
        <div className="p-5 rounded-2xl bg-[#162236] border border-white/5 relative overflow-hidden shadow-lg group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-[#A8B2C1] text-xs font-bold uppercase tracking-wider mb-2">
            <span>SERP Intent Pages</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <Route className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
            {stats.routes}
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 font-semibold">
            Google Crawlable Index
          </div>
        </div>

      </div>

      {/* Quick Power Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tool 1: Live Crawler */}
        <Link
          href="/admin/crawler"
          className="p-6 rounded-2xl bg-[#162236] border border-white/5 hover:border-[#F7B731] transition-all duration-300 group flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-[#F7B731]/15 text-[#F7B731] flex items-center justify-center font-bold">
              <Globe className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            </div>
            <h3 className="font-extrabold text-white text-lg group-hover:text-[#F7B731] transition-colors flex items-center justify-between">
              <span>Google Maps Crawler</span>
              <ArrowUpRight className="w-4 h-4 text-[#F7B731]" />
            </h3>
            <p className="text-xs text-[#A8B2C1] leading-relaxed">
              Query live Google Places and SERP search queries to automatically harvest local competitors, ratings, and phone numbers for any town in India.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs font-extrabold text-[#F7B731]">
            <span>Open Crawler Engine</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 2: Mover Directory & Unlocks */}
        <Link
          href="/admin/movers"
          className="p-6 rounded-2xl bg-[#162236] border border-white/5 hover:border-blue-500 transition-all duration-300 group flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6 group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-extrabold text-white text-lg group-hover:text-blue-400 transition-colors flex items-center justify-between">
              <span>Rankings &amp; Phone Unlocks</span>
              <ArrowUpRight className="w-4 h-4 text-blue-400" />
            </h3>
            <p className="text-xs text-[#A8B2C1] leading-relaxed">
              Control mover rankings, assign verified badges, and toggle the Paid Profile switch to unlock competitor phone numbers when subscription is paid.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs font-extrabold text-blue-400">
            <span>Manage Mover Profiles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Tool 3: SERP Intent Matrix */}
        <Link
          href="/admin/routes"
          className="p-6 rounded-2xl bg-[#162236] border border-white/5 hover:border-purple-500 transition-all duration-300 group flex flex-col justify-between shadow-md relative overflow-hidden"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center font-bold">
              <Route className="w-6 h-6 group-hover:scale-105 transition-transform" />
            </div>
            <h3 className="font-extrabold text-white text-lg group-hover:text-purple-400 transition-colors flex items-center justify-between">
              <span>SERP Intent Matrix</span>
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </h3>
            <p className="text-xs text-[#A8B2C1] leading-relaxed">
              Inspect multi-intent variation patterns (IBA Approved, Cheap &amp; Affordable, Top Rates) with customized meta titles and instant preview links.
            </p>
          </div>
          <div className="mt-5 pt-3 border-t border-white/5 flex items-center gap-1.5 text-xs font-extrabold text-purple-400">
            <span>Audit SERP Routes</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Real-Time CRM Inbound Leads Stream */}
      <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 shadow-lg space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-lg font-extrabold text-white">Live Customer Relocation Inquiries</h2>
            <p className="text-xs text-[#A8B2C1] mt-0.5">Real-time quote requests captured via directory conversion funnels.</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-bold text-[#F7B731] hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Complete CRM ({stats.leads})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {stats.recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C12]/50 text-[#A8B2C1] uppercase text-[10px] font-extrabold tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-3.5">Customer Name</th>
                  <th className="py-3 px-3.5">Contact Phone</th>
                  <th className="py-3 px-3.5">Moving Route</th>
                  <th className="py-3 px-3.5">Inventory</th>
                  <th className="py-3 px-3.5">Target Mover</th>
                  <th className="py-3 px-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-3.5 font-bold text-white">{lead.customer_name}</td>
                    <td className="py-3.5 px-3.5 font-mono">
                      <a href={`tel:${lead.customer_phone}`} className="hover:text-[#F7B731] flex items-center gap-1.5 text-white">
                        <PhoneCall className="w-3.5 h-3.5 text-[#F7B731]" />
                        <span>{lead.customer_phone}</span>
                      </a>
                    </td>
                    <td className="py-3.5 px-3.5 text-white font-medium">
                      {lead.from_city} <span className="text-[#F7B731]">➔</span> {lead.to_city || 'Local Shifting'}
                    </td>
                    <td className="py-3.5 px-3.5 font-semibold text-[#A8B2C1]">{lead.move_size}</td>
                    <td className="py-3.5 px-3.5 text-xs text-[#A8B2C1] max-w-[160px] truncate">
                      {lead.mover_name || 'General Inquiry'}
                    </td>
                    <td className="py-3.5 px-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F7B731]/15 text-[#F7B731] border border-[#F7B731]/30">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-[#A8B2C1] text-xs">
            No leads recorded yet. New inquiries will stream in real-time as users engage with quote modals.
          </div>
        )}
      </div>
    </div>
  );
}

import { query } from '@/lib/db';
import Link from 'next/link';
import { 
  Users, MapPin, Route, Inbox, 
  ArrowUpRight, Globe, ShieldCheck, PhoneCall 
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
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Admin Omnipotence Central Dashboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          PAN-India directory health, lead flow, Google Maps crawler, and ranking controls.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Inbound Quote Leads</span>
            <Inbox className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.leads}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">Real-time CRM Pipeline</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Cities & Hubs</span>
            <MapPin className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.cities}
          </div>
          <div className="text-[11px] text-blue-400 font-medium">Across All 36 States & UTs</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Verified Movers</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.movers}
          </div>
          <div className="text-[11px] text-purple-400 font-medium">National Packers #1 Pinned</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Programmatic Intent Routes</span>
            <Route className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats.routes}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">Indexed SERP Pages</div>
        </div>
      </div>

      {/* Quick Power Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/crawler"
          className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-800 to-slate-800 border border-amber-500/30 hover:border-amber-500 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
              Run Google Maps Crawler
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Auto-query Google Places for any city/state to discover local movers, ratings, and phone numbers.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-400">
            <span>Launch Crawler</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/movers"
          className="p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
              Ranking & Badge Manager
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag-and-drop or order rankings. Pin National Packers as Slot #1. Assign IBA & Platinum badges.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-blue-400">
            <span>Manage Rankings</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>

        <Link
          href="/admin/routes"
          className="p-5 rounded-2xl bg-slate-800 border border-slate-700 hover:border-slate-500 transition-all group flex flex-col justify-between"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Route className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition-colors">
              SERP Routes & Meta Manager
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject custom programmatic search intent routes and edit SEO meta tags on the fly.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-xs font-bold text-purple-400">
            <span>Edit SERP Routes</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </Link>
      </div>

      {/* Recent Inbound Leads Preview */}
      <div className="bg-slate-800/90 rounded-2xl border border-slate-700/80 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">Recent Customer Inbound Leads</h2>
            <p className="text-xs text-slate-400">Captured through directory quote forms.</p>
          </div>
          <Link
            href="/admin/leads"
            className="text-xs font-semibold text-amber-400 hover:underline"
          >
            View All Leads ({stats.leads})
          </Link>
        </div>

        {stats.recentLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700/80">
                <tr>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Size</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {stats.recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-700/40">
                    <td className="py-3 px-3 font-semibold text-white">{lead.customer_name}</td>
                    <td className="py-3 px-3 font-mono">
                      <a href={`tel:${lead.customer_phone}`} className="hover:text-amber-400 flex items-center gap-1">
                        <PhoneCall className="w-3 h-3 text-amber-500" />
                        {lead.customer_phone}
                      </a>
                    </td>
                    <td className="py-3 px-3">{lead.from_city} ➔ {lead.to_city || 'Local'}</td>
                    <td className="py-3 px-3 font-medium">{lead.move_size}</td>
                    <td className="py-3 px-3 text-slate-400">{lead.move_date || 'Flexible'}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-500 text-xs">
            No leads captured yet. Leads will appear here automatically when users submit quotes.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { PhoneCall, MessageSquare, Search, Filter, CheckCircle2, Clock } from 'lucide-react';

export default function LeadsManagerUI({ initialLeads = [] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = leads.filter((lead) => {
    const matchesText = 
      lead.customer_name?.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.customer_phone?.includes(filterText) ||
      lead.from_city?.toLowerCase().includes(filterText.toLowerCase()) ||
      lead.to_city?.toLowerCase().includes(filterText.toLowerCase());

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    return matchesText && matchesStatus;
  });

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (res.ok) {
        setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by customer, phone, city..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'New', 'Contacted', 'Closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">
            Lead Records ({filtered.length})
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Direct Dispatch to National Packers HQ
          </span>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Route</th>
                  <th className="py-2.5 px-3">Move Size</th>
                  <th className="py-2.5 px-3">Target Mover</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {filtered.map((lead) => {
                  const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                  const waMsg = encodeURIComponent(
                    `Hello ${lead.customer_name}, this is National Packers & Movers regarding your relocation inquiry from ${lead.from_city} to ${lead.to_city || 'Local'}. When is the best time to speak?`
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-slate-750">
                      <td className="py-3 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm">{lead.customer_name}</div>
                        <div className="font-mono text-amber-400 text-xs mt-0.5">{lead.customer_phone}</div>
                      </td>

                      <td className="py-3 px-3 font-medium">
                        <div>{lead.from_city} ➔ {lead.to_city || 'Local'}</div>
                        <div className="text-[10px] text-slate-400">Date: {lead.move_date || 'Flexible'}</div>
                      </td>

                      <td className="py-3 px-3 font-semibold text-white">
                        {lead.move_size}
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        {lead.mover_name || 'General Inquiry (National Default)'}
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-3 px-3 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`tel:${lead.customer_phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs transition-colors"
                        >
                          <PhoneCall className="w-3 h-3 text-amber-400" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${lead.customer_phone.replace(/\D/g, '')}?text=${waMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500 text-xs">
            No leads match current filter.
          </div>
        )}
      </div>
    </div>
  );
}

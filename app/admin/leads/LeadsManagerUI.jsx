'use client';

import { useState } from 'react';
import { PhoneCall, MessageSquare, Search, Filter, CheckCircle2, Clock, Inbox, ArrowRight } from 'lucide-react';

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
      {/* Top Search & Filter Bar */}
      <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#6B7585] absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search by customer, phone, city..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs focus:outline-none focus:border-[#F7B731] placeholder-[#6B7585]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['All', 'New', 'Contacted', 'Closed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#F7B731] text-[#080C12] shadow-sm font-black'
                  : 'bg-[#080C12] text-[#A8B2C1] hover:text-white border border-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>Customer Inbound Relocation Leads</span>
              <span className="text-xs font-bold bg-[#F7B731]/15 text-[#F7B731] px-2.5 py-0.5 rounded-full border border-[#F7B731]/30">
                {filtered.length} Inquiries
              </span>
            </h2>
            <p className="text-xs text-[#A8B2C1] mt-0.5">
              100% intercepted leads routed to National Packers &amp; Movers Central Dispatch (+91 98351 68368).
            </p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C12]/50 text-[#A8B2C1] uppercase text-[10px] font-extrabold tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Customer Details</th>
                  <th className="py-3 px-3">Relocation Route</th>
                  <th className="py-3 px-3">Move Size</th>
                  <th className="py-3 px-3">Target Mover</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filtered.map((lead) => {
                  const dateStr = lead.created_at ? new Date(lead.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent';
                  const waMsg = encodeURIComponent(
                    `Hello ${lead.customer_name}, this is National Packers & Movers regarding your relocation inquiry from ${lead.from_city} to ${lead.to_city || 'Local'}. When is the best time to speak?`
                  );

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-3 text-[#A8B2C1] font-mono text-[11px] whitespace-nowrap">
                        {dateStr}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-extrabold text-white text-sm">{lead.customer_name}</div>
                        <div className="font-mono text-[#F7B731] text-xs mt-0.5 font-bold">{lead.customer_phone}</div>
                      </td>

                      <td className="py-3.5 px-3 font-medium text-white">
                        <div>{lead.from_city} <span className="text-[#F7B731]">➔</span> {lead.to_city || 'Local'}</div>
                        <div className="text-[10px] text-[#A8B2C1]">Preferred: {lead.move_date || 'Flexible'}</div>
                      </td>

                      <td className="py-3.5 px-3 font-bold text-white">
                        {lead.move_size}
                      </td>

                      <td className="py-3.5 px-3 text-[#A8B2C1]">
                        {lead.mover_name || 'General Inquiry (National Default)'}
                      </td>

                      <td className="py-3.5 px-3">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg bg-[#080C12] border border-white/10 text-xs font-bold text-[#F7B731] focus:outline-none"
                        >
                          <option value="New">New</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Closed">Closed</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-3 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`tel:${lead.customer_phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors border border-white/10"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-[#F7B731]" />
                          <span>Call</span>
                        </a>

                        <a
                          href={`https://wa.me/91${lead.customer_phone.replace(/\D/g, '')}?text=${waMsg}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#2D9A60] hover:bg-[#258251] text-white font-extrabold text-xs transition-colors shadow-sm"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
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
          <div className="py-12 text-center text-[#A8B2C1] text-xs">
            No leads match current filter.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Star, ShieldCheck, Award, 
  Save, Trash2, Plus, CheckCircle2, ArrowUpDown, PhoneCall, Loader2, Edit3, 
  Lock, Unlock, Search, ExternalLink, Image as ImageIcon, Sparkles, Globe 
} from 'lucide-react';
import AdminCitySelector from '@/components/AdminCitySelector';

export default function MoversManagerUI({ cities = [] }) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || '');
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState('');
  const [searchFilter, setSearchFilter] = useState('');

  // Add Mover Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMover, setNewMover] = useState({
    name: '',
    phone: '',
    address: '',
    rating: 4.5,
    established_year: '2015',
    badges: ['Verified Vendor'],
  });

  const fetchMovers = async (cityId) => {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/movers?city_id=${cityId}`);
      const data = await res.json();
      if (data.success) {
        setMovers(data.movers || []);
      }
    } catch (err) {
      console.error('Failed to fetch movers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers(selectedCityId);
  }, [selectedCityId]);

  const handleUpdateMover = async (mover) => {
    setSavingId(mover.id);
    setMsg('');
    try {
      const res = await fetch('/api/admin/movers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mover),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Updated ${mover.name} successfully!`);
        fetchMovers(selectedCityId);
      }
    } catch (err) {
      setMsg('Update failed.');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteMover = async (id, name) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/movers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMsg(`Deleted ${name}`);
        fetchMovers(selectedCityId);
      }
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const handleCreateMover = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/movers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newMover, city_id: selectedCityId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewMover({ name: '', phone: '', address: '', rating: 4.5, established_year: '2015', badges: ['Verified Vendor'] });
        fetchMovers(selectedCityId);
      }
    } catch (err) {
      alert('Failed to add custom mover.');
    }
  };

  const selectedCity = cities.find(c => c.id === selectedCityId) || cities[0];

  const filteredMovers = movers.filter(m => 
    m.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    m.phone?.includes(searchFilter) ||
    m.address?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* ⭐ Centralized Master National Packers Control (Global Singleton) */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#162236] to-[#162236] border-2 border-[#F7B731]/50 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#F7B731]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F7B731] text-[#080C12] text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>Global Master Profile (Central Singleton)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              National Packers &amp; Movers Master Control
            </h2>
            <p className="text-xs sm:text-sm text-[#A8B2C1] leading-relaxed">
              Customizing National Packers here automatically updates Slot #1 across <span className="text-[#F7B731] font-bold">all 7,606+ city and state directory routes</span> on the entire website with zero duplication.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/admin/movers/np-master"
              className="px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(247,183,49,0.35)] cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Customize Master Profile &amp; Global Gallery</span>
            </Link>
          </div>
        </div>
      </div>

      {/* City Switcher & Command Header - Custom 7,000+ City Search Suite */}
      <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#A8B2C1]">
              Directory City Navigator (7,000+ Cities)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any Indian market to inspect and customize local competitor rankings and galleries.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {msg && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5" /> {msg}
              </span>
            )}

            {selectedCity && (
              <Link
                href={`/packers-and-movers-${selectedCity?.slug}`}
                target="_blank"
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#F7B731] border border-[#F7B731]/40 hover:bg-[#F7B731] hover:text-[#080C12] transition-all flex items-center gap-1.5"
              >
                <span>Live City Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-xl font-extrabold text-xs text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center gap-1.5 shadow-[0_4px_16px_rgba(247,183,49,0.3)] cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Custom Mover</span>
            </button>
          </div>
        </div>

        {/* Custom 7,000+ City Search Filter */}
        <AdminCitySelector
          cities={cities}
          selectedCityId={selectedCityId}
          onSelectCity={setSelectedCityId}
        />
      </div>

      {/* Movers Table Card */}
      <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <span>Listed Moving Companies in {selectedCity?.name}</span>
              <span className="text-xs font-bold bg-[#F7B731]/15 text-[#F7B731] px-2.5 py-0.5 rounded-full border border-[#F7B731]/30">
                {movers.length} Total
              </span>
            </h2>
            <p className="text-xs text-[#A8B2C1] mt-0.5">
              Click &ldquo;Customize Profile&rdquo; on any company to upload custom logos, photos, and edit full content.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#6B7585] absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, phone..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#080C12]/80 border border-white/10 text-xs text-white placeholder-[#6B7585] focus:outline-none focus:border-[#F7B731]"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-[#A8B2C1] gap-2 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#F7B731]" />
            <span>Loading city directory listings...</span>
          </div>
        ) : filteredMovers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#080C12]/50 text-[#A8B2C1] uppercase text-[10px] font-extrabold tracking-wider border-b border-white/5">
                <tr>
                  <th className="py-3 px-3 w-16 text-center">Rank</th>
                  <th className="py-3 px-3">Company &amp; Logo</th>
                  <th className="py-3 px-3">Phone Number</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3 text-center">Gallery</th>
                  <th className="py-3 px-3 text-center">Phone Unlocked?</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredMovers.map((m) => {
                  const isNational = m.rank_order === 1 || m.name?.toLowerCase().includes('national');
                  const isPaid = m.is_paid === 1;

                  // Parse gallery images count
                  let galleryCount = 0;
                  try {
                    const parsed = typeof m.gallery_images === 'string' ? JSON.parse(m.gallery_images || '[]') : (m.gallery_images || []);
                    galleryCount = Array.isArray(parsed) ? parsed.length : 0;
                  } catch (_) {
                    galleryCount = 0;
                  }

                  return (
                    <tr 
                      key={m.id} 
                      className={`hover:bg-white/[0.02] transition-colors ${
                        isNational ? 'bg-[#F7B731]/10' : ''
                      }`}
                    >
                      {/* Rank Order Input */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="number"
                          value={m.rank_order}
                          onChange={(e) => {
                            const updated = movers.map(item => item.id === m.id ? { ...item, rank_order: Number(e.target.value) } : item);
                            setMovers(updated);
                          }}
                          className={`w-12 py-1 px-1 rounded-lg border text-center font-mono font-bold text-xs ${
                            isNational
                              ? 'bg-[#F7B731]/20 border-[#F7B731] text-[#F7B731]'
                              : 'bg-[#080C12] border-white/10 text-white'
                          }`}
                        />
                      </td>

                      {/* Company Name, Logo & Address */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {/* Logo Thumbnail or Avatar */}
                          <div className="w-9 h-9 rounded-lg bg-[#080C12] border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {m.logo_url ? (
                              <img src={m.logo_url} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xs font-black text-[#F7B731]">
                                {m.name?.substring(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="font-extrabold text-white text-sm flex items-center gap-1.5 flex-wrap">
                              <span>{m.name}</span>
                              {isNational && (
                                <span className="text-[10px] bg-[#F7B731] text-[#080C12] font-black px-2 py-0.5 rounded-full shadow-xs">
                                  #1 Pinned
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#A8B2C1] line-clamp-1 mt-0.5">
                              {m.address}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-3">
                        <input
                          type="text"
                          value={m.phone}
                          onChange={(e) => {
                            const updated = movers.map(item => item.id === m.id ? { ...item, phone: e.target.value } : item);
                            setMovers(updated);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#080C12] border border-white/10 text-white font-mono text-xs w-36 focus:border-[#F7B731] focus:outline-none"
                        />
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            min="1"
                            max="5"
                            value={m.rating}
                            onChange={(e) => {
                              const updated = movers.map(item => item.id === m.id ? { ...item, rating: Number(e.target.value) } : item);
                              setMovers(updated);
                            }}
                            className="w-12 py-1 rounded-lg bg-[#080C12] border border-white/10 text-white font-mono text-xs text-center focus:border-[#F7B731] focus:outline-none"
                          />
                          <Star className="w-3.5 h-3.5 text-amber-300 fill-current" />
                        </div>
                      </td>

                      {/* Gallery Photos Pill */}
                      <td className="py-3.5 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          galleryCount > 0 
                            ? 'bg-[#F7B731]/15 text-[#F7B731] border border-[#F7B731]/30' 
                            : 'bg-white/5 text-slate-500 border border-white/10'
                        }`}>
                          <ImageIcon className="w-3 h-3" />
                          <span>{galleryCount} Photos</span>
                        </span>
                      </td>

                      {/* Phone Unlocked Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        {isNational ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Always Unlocked</span>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = movers.map(item => item.id === m.id ? { ...item, is_paid: isPaid ? 0 : 1 } : item);
                              setMovers(updated);
                            }}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer ${
                              isPaid 
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40' 
                                : 'bg-[#F7B731]/10 text-[#F7B731] border border-[#F7B731]/30'
                            }`}
                            title={isPaid ? 'Phone visible to all visitors' : 'Phone is locked behind quote gate'}
                          >
                            {isPaid ? (
                              <>
                                <Unlock className="w-3 h-3 text-emerald-400" />
                                <span>Unlocked (Paid)</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3 text-[#F7B731]" />
                                <span>Locked (Masked)</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right space-x-2">
                        {isNational ? (
                          <Link
                            href="/admin/movers/np-master"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] text-[#080C12] font-black text-xs transition-all shadow-[0_2px_10px_rgba(247,183,49,0.3)] hover:brightness-110"
                            title="Edit Master National Profile across all cities"
                          >
                            <Sparkles className="w-3.5 h-3.5 fill-current" />
                            <span>Customize Master</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/movers/${m.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors border border-white/10"
                            title="Edit company profile, upload logo and gallery"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Customize</span>
                          </Link>
                        )}
                        <button
                          type="button"
                          onClick={() => handleUpdateMover(m)}
                          disabled={savingId === m.id}
                          className="px-3.5 py-1.5 rounded-lg bg-[#F7B731] hover:bg-[#FFD166] text-[#080C12] font-black text-xs transition-colors cursor-pointer shadow-xs"
                        >
                          {savingId === m.id ? 'Saving...' : 'Save'}
                        </button>
                        {!isNational && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMover(m.id, m.name)}
                            className="p-1.5 rounded-lg bg-[#C1121F]/15 hover:bg-[#C1121F] text-[#FF6B6B] hover:text-white transition-colors border border-[#C1121F]/30"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-[#A8B2C1] text-xs">
            No movers found matching your criteria. Use the Live Google Maps Crawler to import carriers!
          </div>
        )}
      </div>

      {/* Add Custom Mover Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C12]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#162236] rounded-3xl border border-white/10 border-t-[3px] border-t-[#F7B731] max-w-md w-full p-6 sm:p-7 space-y-5 text-white shadow-2xl animate-scaleUp">
            <div>
              <h3 className="text-lg font-black text-white">Add Custom Mover in {selectedCity?.name}</h3>
              <p className="text-xs text-[#A8B2C1] mt-0.5">Manually register a verified logistics operator in this city.</p>
            </div>

            <form onSubmit={handleCreateMover} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A8B2C1] mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newMover.name}
                  onChange={(e) => setNewMover({ ...newMover, name: e.target.value })}
                  placeholder="e.g. Agarwal Super Relocations"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs focus:border-[#F7B731] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A8B2C1] mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newMover.phone}
                  onChange={(e) => setNewMover({ ...newMover, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs focus:border-[#F7B731] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#A8B2C1] mb-1">Primary Address</label>
                <input
                  type="text"
                  required
                  value={newMover.address}
                  onChange={(e) => setNewMover({ ...newMover, address: e.target.value })}
                  placeholder={`Transport Nagar, ${selectedCity?.name}`}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs focus:border-[#F7B731] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-black text-[#080C12] bg-[#F7B731] hover:bg-[#FFD166] shadow-sm"
                >
                  Create Mover
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

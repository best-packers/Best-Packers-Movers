'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Star, ShieldCheck, Award, 
  Save, Trash2, Plus, CheckCircle2, ArrowUpDown, PhoneCall, Loader2, Edit3 
} from 'lucide-react';

export default function MoversManagerUI({ cities = [] }) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || '');
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState('');

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

  const selectedCity = cities.find(c => c.id === selectedCityId);

  return (
    <div className="space-y-6">
      {/* City Switcher Bar */}
      <div className="p-5 rounded-2xl bg-slate-800/90 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-80">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Active City
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.state_name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {msg && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {msg}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Mover</span>
          </button>
        </div>
      </div>

      {/* Movers Table */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-white">
              Listed Movers in {selectedCity?.name} ({movers.length})
            </h2>
            <p className="text-xs text-slate-400">
              Set rank order number to reorder position. Rank 1 is top of page.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center text-slate-400 gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading movers...</span>
          </div>
        ) : movers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 uppercase text-[10px] font-bold border-b border-slate-700">
                <tr>
                  <th className="py-2.5 px-3 w-20">Rank</th>
                  <th className="py-2.5 px-3">Company Details</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Rating</th>
                  <th className="py-2.5 px-3">Verified / Featured</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60 text-slate-300">
                {movers.map((m) => {
                  const isNational = m.rank_order === 1 || m.name.toLowerCase().includes('national');
                  return (
                    <tr key={m.id} className={`hover:bg-slate-750 ${isNational ? 'bg-amber-950/20' : ''}`}>
                      {/* Rank Order Input */}
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          value={m.rank_order}
                          onChange={(e) => {
                            const updated = movers.map(item => item.id === m.id ? { ...item, rank_order: Number(e.target.value) } : item);
                            setMovers(updated);
                          }}
                          className={`w-14 px-2 py-1 rounded-lg border text-center font-mono font-bold text-xs ${
                            isNational
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-900 border-slate-700 text-white'
                          }`}
                        />
                      </td>

                      {/* Name & Badges */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          <span>{m.name}</span>
                          {isNational && (
                            <span className="text-[10px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.5 rounded">
                              Pinned #1
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {m.address}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={m.phone}
                          onChange={(e) => {
                            const updated = movers.map(item => item.id === m.id ? { ...item, phone: e.target.value } : item);
                            setMovers(updated);
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs w-36"
                        />
                      </td>

                      {/* Rating */}
                      <td className="py-3 px-3">
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
                            className="w-14 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-xs text-center"
                          />
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-current" />
                        </div>
                      </td>

                      {/* Verified / Featured */}
                      <td className="py-3 px-3 space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = movers.map(item => item.id === m.id ? { ...item, is_verified: !item.is_verified } : item);
                            setMovers(updated);
                          }}
                          className={`px-2 py-1 rounded text-[10px] font-bold ${
                            m.is_verified ? 'bg-emerald-900/60 text-emerald-300' : 'bg-slate-700 text-slate-400'
                          }`}
                        >
                          {m.is_verified ? 'Verified' : 'Unverified'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right space-x-2">
                        <Link
                          href={`/admin/movers/${m.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleUpdateMover(m)}
                          disabled={savingId === m.id}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                        >
                          {savingId === m.id ? 'Saving...' : 'Save'}
                        </button>
                        {!isNational && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMover(m.id, m.name)}
                            className="p-1.5 rounded-lg bg-rose-900/40 hover:bg-rose-900 text-rose-300 transition-colors"
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
          <div className="py-10 text-center text-slate-500 text-xs">
            No movers found in this city. Use the Google Maps Crawler to import movers!
          </div>
        )}
      </div>

      {/* Add Custom Mover Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-md w-full p-6 space-y-4 text-white">
            <h3 className="text-lg font-bold">Add Custom Mover to {selectedCity?.name}</h3>
            <form onSubmit={handleCreateMover} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={newMover.name}
                  onChange={(e) => setNewMover({ ...newMover, name: e.target.value })}
                  placeholder="e.g. Royal City Relocations"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  value={newMover.phone}
                  onChange={(e) => setNewMover({ ...newMover, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={newMover.address}
                  onChange={(e) => setNewMover({ ...newMover, address: e.target.value })}
                  placeholder="Near Highway Toll Gate"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

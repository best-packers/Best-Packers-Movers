'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Route, Save, Plus, CheckCircle2, ExternalLink, Loader2, Sparkles, ArrowRight } from 'lucide-react';

export default function RoutesManagerUI({ cities = [] }) {
  const [selectedCityId, setSelectedCityId] = useState(cities[0]?.id || '');
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [msg, setMsg] = useState('');

  // Add Route state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoute, setNewRoute] = useState({
    intent_type: 'custom',
    slug_pattern: '',
    meta_title: '',
    meta_description: '',
    h1_heading: '',
    intro_text: '',
  });

  const fetchRoutes = async (cityId) => {
    if (!cityId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/routes?city_id=${cityId}`);
      const data = await res.json();
      if (data.success) {
        setRoutes(data.routes || []);
      }
    } catch (err) {
      console.error('Failed to fetch routes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes(selectedCityId);
  }, [selectedCityId]);

  const handleUpdateRoute = async (rt) => {
    setSavingId(rt.id);
    setMsg('');
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rt),
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Saved route meta tags!`);
      }
    } catch (err) {
      alert('Save failed.');
    } finally {
      setSavingId(null);
    }
  };

  const handleCreateRoute = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newRoute, city_id: selectedCityId }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewRoute({ intent_type: 'custom', slug_pattern: '', meta_title: '', meta_description: '', h1_heading: '', intro_text: '' });
        fetchRoutes(selectedCityId);
      }
    } catch (err) {
      alert('Failed to add route.');
    }
  };

  const selectedCity = cities.find(c => c.id === selectedCityId);

  return (
    <div className="space-y-6">
      {/* City Switcher */}
      <div className="p-6 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="w-full sm:w-80">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B2C1] mb-2">
            Select Active City / Territory
          </label>
          <select
            value={selectedCityId}
            onChange={(e) => setSelectedCityId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#080C12] border border-white/10 text-white text-sm focus:border-[#F7B731] focus:outline-none font-semibold"
          >
            {cities.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#162236] text-white">
                {c.name} ({c.state_name})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {msg && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1 bg-emerald-950/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> {msg}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-extrabold text-xs text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(247,183,49,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Custom Intent Route</span>
          </button>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-16 text-center text-[#A8B2C1] flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-[#F7B731]" />
            <span>Loading SERP routes...</span>
          </div>
        ) : routes.length > 0 ? (
          routes.map((rt) => (
            <div key={rt.id} className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 space-y-4 shadow-lg hover:border-[#F7B731]/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#F7B731]/15 text-[#F7B731] border border-[#F7B731]/30">
                    {rt.intent_type}
                  </span>
                  <a
                    href={`/${rt.slug_pattern}`}
                    target="_blank"
                    className="text-white hover:text-[#F7B731] font-mono text-sm flex items-center gap-1.5 font-bold transition-colors"
                  >
                    <span>/{rt.slug_pattern}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#A8B2C1]" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateRoute(rt)}
                  disabled={savingId === rt.id}
                  className="px-4 py-2 rounded-xl bg-[#F7B731] hover:bg-[#FFD166] text-[#080C12] font-black text-xs transition-colors flex items-center justify-center gap-1.5 self-end sm:self-auto cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === rt.id ? 'Saving...' : 'Save Meta Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[#A8B2C1] font-bold uppercase mb-1">
                    Meta Title (Google SERP Title Tag)
                  </label>
                  <input
                    type="text"
                    value={rt.meta_title}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, meta_title: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:outline-none focus:border-[#F7B731]"
                  />
                </div>

                <div>
                  <label className="block text-[#A8B2C1] font-bold uppercase mb-1">
                    H1 Heading on Page
                  </label>
                  <input
                    type="text"
                    value={rt.h1_heading}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, h1_heading: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:outline-none focus:border-[#F7B731]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[#A8B2C1] font-bold uppercase mb-1">
                    Meta Description (Google SERP Snippet)
                  </label>
                  <textarea
                    rows={2}
                    value={rt.meta_description}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, meta_description: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:outline-none focus:border-[#F7B731]"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-16 text-center text-[#A8B2C1] text-xs">
            No routes found for this city.
          </div>
        )}
      </div>

      {/* Add Custom Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080C12]/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#162236] rounded-3xl border border-white/10 border-t-[3px] border-t-[#F7B731] max-w-lg w-full p-6 sm:p-7 space-y-4 text-white shadow-2xl animate-scaleUp">
            <h3 className="text-lg font-extrabold">Add Custom Search Intent Route for {selectedCity?.name}</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Slug Pattern *</label>
                <input
                  type="text"
                  required
                  value={newRoute.slug_pattern}
                  onChange={(e) => setNewRoute({ ...newRoute, slug_pattern: e.target.value })}
                  placeholder={`car-transport-services-${selectedCity?.slug}`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Meta Title *</label>
                <input
                  type="text"
                  required
                  value={newRoute.meta_title}
                  onChange={(e) => setNewRoute({ ...newRoute, meta_title: e.target.value })}
                  placeholder={`Car Transport in ${selectedCity?.name} | Safe Vehicle Carrier`}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={newRoute.meta_description}
                  onChange={(e) => setNewRoute({ ...newRoute, meta_description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-[#A8B2C1] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#F7B731] text-[#080C12] font-black hover:bg-[#FFD166] transition-colors"
                >
                  Create Route
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

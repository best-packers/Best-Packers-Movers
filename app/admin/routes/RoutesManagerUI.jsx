'use client';

import { useState, useEffect } from 'react';
import { Route, Save, Plus, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

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
      <div className="p-5 rounded-2xl bg-slate-800 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
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
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Intent Route</span>
          </button>
        </div>
      </div>

      {/* Routes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex items-center justify-center gap-2 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            <span>Loading routes...</span>
          </div>
        ) : routes.length > 0 ? (
          routes.map((rt) => (
            <div key={rt.id} className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {rt.intent_type}
                  </span>
                  <a
                    href={`/${rt.slug_pattern}`}
                    target="_blank"
                    className="text-white hover:text-amber-400 font-mono text-sm flex items-center gap-1"
                  >
                    <span>/{rt.slug_pattern}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => handleUpdateRoute(rt)}
                  disabled={savingId === rt.id}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 self-end sm:self-auto"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{savingId === rt.id ? 'Saving...' : 'Save Meta Changes'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    Meta Title (Google SERP Title Tag)
                  </label>
                  <input
                    type="text"
                    value={rt.meta_title}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, meta_title: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    H1 Heading on Page
                  </label>
                  <input
                    type="text"
                    value={rt.h1_heading}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, h1_heading: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-400 font-bold mb-1">
                    Meta Description (Google Snippet Description)
                  </label>
                  <textarea
                    rows={2}
                    value={rt.meta_description}
                    onChange={(e) => {
                      const updated = routes.map(r => r.id === rt.id ? { ...r, meta_description: e.target.value } : r);
                      setRoutes(updated);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center text-slate-500 text-xs">
            No routes found for this city.
          </div>
        )}
      </div>

      {/* Add Custom Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-2xl border border-slate-700 max-w-lg w-full p-6 space-y-4 text-white">
            <h3 className="text-lg font-bold">Add Custom Search Intent Route for {selectedCity?.name}</h3>
            <form onSubmit={handleCreateRoute} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Slug Pattern (e.g. car-transport-{selectedCity?.slug}) *</label>
                <input
                  type="text"
                  required
                  value={newRoute.slug_pattern}
                  onChange={(e) => setNewRoute({ ...newRoute, slug_pattern: e.target.value })}
                  placeholder={`car-transport-services-${selectedCity?.slug}`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Meta Title *</label>
                <input
                  type="text"
                  required
                  value={newRoute.meta_title}
                  onChange={(e) => setNewRoute({ ...newRoute, meta_title: e.target.value })}
                  placeholder={`Car Transport in ${selectedCity?.name} | Safe Vehicle Carrier`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Meta Description</label>
                <textarea
                  rows={2}
                  value={newRoute.meta_description}
                  onChange={(e) => setNewRoute({ ...newRoute, meta_description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
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

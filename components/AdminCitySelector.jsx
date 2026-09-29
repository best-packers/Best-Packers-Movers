'use client';

import { useState, useMemo } from 'react';
import { Search, MapPin, Check, ChevronDown, X, Sparkles, Filter } from 'lucide-react';

const TOP_HUBS = [
  { name: 'Lucknow', state: 'Uttar Pradesh' },
  { name: 'Patna', state: 'Bihar' },
  { name: 'Kolkata', state: 'West Bengal' },
  { name: 'Dhanbad', state: 'Jharkhand' },
  { name: 'Ranchi', state: 'Jharkhand' },
  { name: 'Varanasi', state: 'Uttar Pradesh' },
  { name: 'Delhi', state: 'Delhi' },
  { name: 'Mumbai', state: 'Maharashtra' },
  { name: 'Bengaluru', state: 'Karnataka' },
];

export default function AdminCitySelector({ cities = [], states = [], selectedCityId, onSelectCity }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [tierFilter, setTierFilter] = useState('ALL'); // 'ALL', '1', '2', '3'

  // Extract unique states if not passed
  const availableStates = useMemo(() => {
    if (states.length > 0) return states;
    const map = new Map();
    cities.forEach(c => {
      if (c.state_name && !map.has(c.state_name)) {
        map.set(c.state_name, { name: c.state_name, count: 1 });
      } else if (c.state_name) {
        map.get(c.state_name).count++;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [cities, states]);

  // Fast memoized filtering across 7,000+ cities
  const filteredCities = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return cities.filter(c => {
      // State match
      if (selectedState !== 'ALL') {
        const cState = (c.state_name || '').toLowerCase();
        if (cState !== selectedState.toLowerCase()) return false;
      }

      // Tier match
      if (tierFilter !== 'ALL') {
        if (tierFilter === '1' && c.tier !== 1) return false;
        if (tierFilter === '2' && c.tier !== 2) return false;
        if (tierFilter === '3' && (c.tier === 1 || c.tier === 2)) return false;
      }

      // Search term match
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        (c.state_name && c.state_name.toLowerCase().includes(term)) ||
        c.slug.includes(term)
      );
    });
  }, [cities, searchTerm, selectedState, tierFilter]);

  const selectedCity = useMemo(() => {
    return cities.find(c => c.id === selectedCityId) || cities[0];
  }, [cities, selectedCityId]);

  const handleSelect = (city) => {
    onSelectCity(city.id);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleQuickHub = (hubName) => {
    const found = cities.find(c => c.name.toLowerCase() === hubName.toLowerCase());
    if (found) {
      onSelectCity(found.id);
    }
  };

  return (
    <div className="space-y-3 w-full">
      {/* Active City Card & Trigger */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#080C12] border border-white/10 shadow-inner">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-[#F7B731]/15 border border-[#F7B731]/30 flex items-center justify-center text-[#F7B731] flex-shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold text-white truncate">
                {selectedCity?.name || 'Select City'}
              </span>
              {selectedCity?.tier === 1 && (
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-[#F7B731] border border-[#F7B731]/30">
                  Tier 1 Metro
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#A8B2C1] truncate">
              {selectedCity?.state_name ? `${selectedCity.state_name} • ` : ''}
              <span className="text-slate-400">/{selectedCity?.slug}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#162236] hover:bg-[#1E2E48] border border-white/10 hover:border-[#F7B731]/40 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
        >
          <span>Change City ({cities.length.toLocaleString()} Total)</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F7B731]' : 'text-slate-400'}`} />
        </button>
      </div>

      {/* Quick Access Top Hub Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        <span className="text-[11px] font-bold text-[#6B7585] uppercase tracking-wider mr-1 flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-[#F7B731]" />
          <span>Quick Hubs:</span>
        </span>
        {TOP_HUBS.map((hub) => {
          const isSelected = selectedCity?.name.toLowerCase() === hub.name.toLowerCase();
          return (
            <button
              key={hub.name}
              type="button"
              onClick={() => handleQuickHub(hub.name)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer flex-shrink-0 ${
                isSelected
                  ? 'bg-[#F7B731] text-[#080C12] font-black shadow-xs'
                  : 'bg-[#162236] text-[#A8B2C1] hover:text-white border border-white/5 hover:border-white/20'
              }`}
            >
              {hub.name}
            </button>
          );
        })}
      </div>

      {/* Expandable Advanced 7,000+ City Search Modal / Drawer Panel */}
      {isOpen && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0B111A] border border-[#F7B731]/30 shadow-2xl space-y-4 animate-scaleUp">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#F7B731]" />
              <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                Fast Search Across 7,000+ Indian Cities &amp; Tehsils
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search Inputs & Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Live Search Text Input */}
            <div className="relative md:col-span-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Type city or tehsil name (e.g. Patna, Asansol, Varanasi, Bokaro)..."
                autoFocus
                className="w-full pl-10 pr-9 py-2 rounded-xl bg-[#162236] border border-white/15 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* State Filter Dropdown */}
            <div>
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#162236] border border-white/15 text-xs sm:text-sm text-white focus:outline-none focus:border-[#F7B731] cursor-pointer"
              >
                <option value="ALL" className="bg-[#162236] text-white">All 36 States &amp; UTs</option>
                {availableStates.map((st) => (
                  <option key={st.name} value={st.name} className="bg-[#162236] text-white">
                    {st.name} {st.count ? `(${st.count})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tier Filter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tier:</span>
            {[
              { id: 'ALL', label: 'All Tiers' },
              { id: '1', label: 'Tier 1 Metros (12)' },
              { id: '2', label: 'Tier 2 Major Hubs' },
              { id: '3', label: 'District Towns & Tehsils' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTierFilter(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tierFilter === t.id
                    ? 'bg-[#F7B731] text-[#080C12]'
                    : 'bg-[#162236] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {t.label}
              </button>
            ))}

            <span className="ml-auto text-xs text-[#F7B731] font-bold">
              {filteredCities.length.toLocaleString()} matching cities
            </span>
          </div>

          {/* Scrollable City Selection Grid */}
          <div className="max-h-[340px] overflow-y-auto pr-1 space-y-1.5 custom-scrollbar divide-y divide-white/5">
            {filteredCities.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-2">
                {filteredCities.slice(0, 150).map((c) => {
                  const isCurrent = c.id === selectedCityId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelect(c)}
                      className={`p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-2 border cursor-pointer ${
                        isCurrent
                          ? 'bg-[#F7B731]/15 border-[#F7B731] text-white shadow-sm'
                          : 'bg-[#162236]/60 hover:bg-[#162236] border-white/5 hover:border-white/20 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold truncate">{c.name}</span>
                          {c.tier === 1 && (
                            <span className="text-[9px] bg-amber-500/20 text-[#F7B731] px-1 py-0.2 rounded font-black">
                              T1
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{c.state_name}</p>
                      </div>

                      {isCurrent && (
                        <Check className="w-4 h-4 text-[#F7B731] flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No cities found matching &ldquo;{searchTerm}&rdquo; in {selectedState}.
              </div>
            )}
          </div>

          {filteredCities.length > 150 && (
            <p className="text-[11px] text-center text-slate-500 italic">
              Showing top 150 results. Refine your search term or state filter to narrow down further.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

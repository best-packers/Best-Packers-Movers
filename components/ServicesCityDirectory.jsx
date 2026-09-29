'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronRight, Filter, Building2, Sparkles, X, Check } from 'lucide-react';

export default function ServicesCityDirectory({ cities = [], states = [], serviceSlug = null }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');

  // Build state ID to Name lookup map
  const stateIdToName = useMemo(() => {
    const map = new Map();
    states.forEach(s => {
      if (s.id && s.name) map.set(s.id, s.name);
      if (s.slug && s.name) map.set(s.slug, s.name);
    });
    return map;
  }, [states]);

  // Compute unique states available across both states and cities datasets
  const availableStates = useMemo(() => {
    const stateSet = new Set();
    states.forEach(s => {
      if (s.name) stateSet.add(s.name);
    });
    cities.forEach(c => {
      const sName = c.state_name || stateIdToName.get(c.state_id);
      if (sName) stateSet.add(sName);
    });
    return Array.from(stateSet).sort();
  }, [cities, states, stateIdToName]);

  // Filter cities by state and search query
  const filteredCities = useMemo(() => {
    let result = cities;

    if (selectedState !== 'ALL') {
      result = result.filter(c => {
        const cState = c.state_name || stateIdToName.get(c.state_id) || '';
        return cState.trim().toLowerCase() === selectedState.trim().toLowerCase();
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter(c => {
        const cState = c.state_name || stateIdToName.get(c.state_id) || '';
        return (
          c.name.toLowerCase().includes(q) || 
          cState.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [cities, selectedState, searchQuery, stateIdToName]);

  return (
    <div className="rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0A0F1D] border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#F7B731]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7B731]/10 border border-[#F7B731]/30 text-[#F7B731] text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Pan-India Directory</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Find Certified Relocation Fleets in Your City
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse verified logistics terminals, rate cards, and certified movers across all operational districts.
          </p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 shrink-0">
          <span className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-[#F7B731] font-mono font-bold shadow-inner">
            {filteredCities.length} {filteredCities.length === 1 ? 'City' : 'Cities'} Listed
          </span>
        </div>
      </div>

      {/* Controls: Search Bar & State Filter */}
      <div className="py-5 flex flex-col md:flex-row items-stretch md:items-center gap-3 relative z-10">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type city name (e.g. Patna, Dhanbad, Kolkata, Lucknow, Mumbai)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#080C12] border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* State Filter Dropdown */}
        <div className="relative shrink-0 md:w-72">
          <div className="relative">
            <Filter className="w-4 h-4 text-[#F7B731] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-[#080C12] border border-slate-700/80 text-white text-xs sm:text-sm font-semibold focus:outline-none focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] appearance-none cursor-pointer transition-all"
            >
              <option value="ALL">All States &amp; UTs ({availableStates.length})</option>
              {availableStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronRight className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>

        {/* Reset Filter Button if active */}
        {(selectedState !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedState('ALL');
              setSearchQuery('');
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 hover:text-white transition-colors shrink-0 flex items-center justify-center gap-1.5 border border-slate-700"
          >
            <X className="w-3.5 h-3.5" /> Reset Filter
          </button>
        )}
      </div>

      {/* Scrollable Cities Container (Fixed Max Height, Highly Organized) */}
      <div className="relative z-10">
        <div className="max-h-[380px] overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          {filteredCities.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[#080C12]/50 rounded-2xl border border-slate-800/80">
              <MapPin className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-300">
                No cities found matching &ldquo;{searchQuery || selectedState}&rdquo;
              </p>
              <p className="text-xs text-slate-500">
                Try clearing the search query or selecting a different state.
              </p>
              <button
                onClick={() => {
                  setSelectedState('ALL');
                  setSearchQuery('');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-[#F7B731] text-[#080C12] font-black text-xs hover:brightness-110 transition-all inline-block shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {filteredCities.map((city) => {
                const targetSlug = city.slug.startsWith('packers-and-movers-') 
                  ? city.slug 
                  : `packers-and-movers-${city.slug}`;
                const stateDisplay = city.state_name || stateIdToName.get(city.state_id) || 'India';

                return (
                  <Link
                    key={city.id || city.slug}
                    href={`/${targetSlug}`}
                    className="group p-3 rounded-xl bg-slate-900/80 hover:bg-gradient-to-r hover:from-[#162236] hover:to-[#0D1B2A] border border-slate-800/90 hover:border-[#F7B731]/60 transition-all duration-200 flex items-center justify-between shadow-sm"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-[#F7B731] truncate transition-colors">
                          {city.name}
                        </span>
                        {city.tier === 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Tier 1 Metro" />
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 group-hover:text-slate-400 block truncate">
                        {stateDisplay}
                      </span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#F7B731] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info Strip */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>All 7,600+ cities supported by National Packers &amp; Movers Pan-India Dispatch</span>
        </div>
        <Link 
          href="/" 
          className="text-[#F7B731] font-bold hover:underline flex items-center gap-1"
        >
          <span>Explore All India Root Directory</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

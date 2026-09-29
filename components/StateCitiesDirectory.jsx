'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, MapPin, ChevronRight, Building2, Sparkles, Navigation } from 'lucide-react';

export default function StateCitiesDirectory({ stateName, cities = [], intentType = 'general' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');

  // Compute intent slug prefix based on current state page intent
  const intentPrefixMap = {
    general: 'packers-and-movers-',
    best: 'best-packers-and-movers-',
    top_rates: 'top-rates-packers-and-movers-',
    top_rated: 'top-rated-packers-and-movers-',
    top_10: 'top-10-packers-and-movers-',
    cheap: 'cheap-and-affordable-packers-and-movers-',
    iba_approved: 'iba-approved-packers-and-movers-'
  };
  const prefix = intentPrefixMap[intentType] || 'packers-and-movers-';

  // Separate Primary Hubs (Tier 1 & Tier 2) from Statutory Towns (Tier 3)
  const primaryHubs = useMemo(() => {
    return cities.filter(c => c.tier === 1 || c.tier === 2);
  }, [cities]);

  // Extract available first letters for alphabet filter
  const availableLetters = useMemo(() => {
    const letters = new Set();
    cities.forEach(c => {
      const firstChar = c.name.charAt(0).toUpperCase();
      if (/[A-Z]/.test(firstChar)) {
        letters.add(firstChar);
      }
    });
    return Array.from(letters).sort();
  }, [cities]);

  // Filtered list based on search and selected letter
  const filteredCities = useMemo(() => {
    let result = cities;
    const q = searchQuery.trim().toLowerCase();

    if (q) {
      result = result.filter(c => c.name.toLowerCase().includes(q));
    } else if (selectedLetter !== 'ALL') {
      result = result.filter(c => c.name.charAt(0).toUpperCase() === selectedLetter);
    }

    return result;
  }, [cities, searchQuery, selectedLetter]);

  return (
    <div className="space-y-[clamp(1.5rem,3vw,2.5rem)]">
      {/* SECTION 1: PRIMARY LOGISTICS HUBS (Always Prominent at Top) */}
      {primaryHubs.length > 0 && !searchQuery && selectedLetter === 'ALL' && (
        <div className="space-y-[clamp(0.875rem,2vw,1.25rem)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Primary Hubs</span>
              </div>
              <h2 className="text-[clamp(1.15rem,2.2vw+0.3rem,1.5rem)] font-bold text-slate-950">
                Major District Centers & Logistics Hubs in {stateName}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 self-start sm:self-auto">
              {primaryHubs.length} Key Hubs
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-[clamp(0.65rem,1.5vw,1rem)]">
            {primaryHubs.map((city) => (
              <Link
                key={city.slug}
                href={`/${prefix}${city.slug}`}
                className="group relative p-[clamp(0.75rem,1.8vw,1.1rem)] rounded-xl bg-gradient-to-b from-white to-slate-50/60 border border-slate-200 hover:border-amber-500 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-[clamp(0.65rem,0.8vw,0.7rem)] font-semibold text-slate-400 mb-1">
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>{city.tier === 1 ? 'Metro Division' : 'District Center'}</span>
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-amber-600 text-[clamp(0.9rem,1.1vw,1.05rem)] leading-snug">
                    {city.name}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
                  <span>View Movers</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: COMPLETE ALL-TOWNS DIRECTORY (Searchable & Alphabet-Indexed) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-[clamp(1rem,2.5vw,2rem)] shadow-sm space-y-[clamp(1rem,2vw,1.5rem)]">
        {/* Header & Live Filter Bar */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-[clamp(1.15rem,2.2vw+0.3rem,1.6rem)] font-bold text-slate-950 flex items-center gap-2">
                <span>All Operational Towns & Municipal Tehsils</span>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                  {cities.length} Total
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Instant directory covering every statutory municipality and urban council in {stateName}.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full sm:w-72 md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value) setSelectedLetter('ALL');
                }}
                placeholder={`Search ${cities.length} cities...`}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200/60 rounded-full w-4 h-4 flex items-center justify-center"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Alphabet Filter Strip */}
          {!searchQuery && availableLetters.length > 1 && (
            <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              <span className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
                Jump to:
              </span>
              <button
                onClick={() => setSelectedLetter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  selectedLetter === 'ALL'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({cities.length})
              </button>
              {availableLetters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                    selectedLetter === letter
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Directory Grid */}
        {filteredCities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 max-h-[680px] overflow-y-auto pr-1 no-scrollbar">
            {filteredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/${prefix}${city.slug}`}
                className="px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200/70 hover:border-amber-300 text-slate-800 hover:text-amber-800 transition-all text-xs font-semibold flex items-center justify-between group"
              >
                <span className="truncate pr-1">{city.name}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 space-y-2">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold">No cities found matching &quot;{searchQuery}&quot;</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLetter('ALL');
              }}
              className="text-xs text-amber-600 font-bold hover:underline"
            >
              Reset Search Filter
            </button>
          </div>
        )}

        {/* Footer Statistics */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[0.7rem] sm:text-xs text-slate-400">
          <span>
            Showing <strong className="text-slate-700">{filteredCities.length}</strong> of{' '}
            <strong className="text-slate-700">{cities.length}</strong> cities across {stateName}
          </span>
          <span className="hidden sm:inline">100% Background-Verified Coverage</span>
        </div>
      </div>
    </div>
  );
}

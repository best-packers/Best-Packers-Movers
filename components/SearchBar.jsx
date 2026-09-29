'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ArrowRight, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

export default function SearchBar({ cities = [], states = [] }) {
  const router = useRouter();
  const [sourceQuery, setSourceQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [selectedSourceItem, setSelectedSourceItem] = useState(null);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [filteredSourceItems, setFilteredSourceItems] = useState([]);
  const [filteredDestItems, setFilteredDestItems] = useState([]);

  const sourceRef = useRef(null);
  const destRef = useRef(null);
  const sourceInputRef = useRef(null);
  const destInputRef = useRef(null);

  // Unified location registry (Cities + States) memoized for instant 60FPS autocomplete
  const allLocations = useMemo(() => [
    ...cities.map(c => ({ ...c, type: 'city' })),
    ...states.map(s => ({ ...s, type: 'state', state_name: 'All-India State Network' }))
  ], [cities, states]);

  // Filter Source Locations as user types
  useEffect(() => {
    if (sourceQuery.trim().length > 0) {
      const q = sourceQuery.toLowerCase();
      const matches = allLocations.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        (loc.state_name && loc.state_name.toLowerCase().includes(q))
      );
      // Prioritize exact start-with matches, then Tier-1 cities / states
      matches.sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q);
        const bStart = b.name.toLowerCase().startsWith(q);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        if (a.type === 'state' && b.type !== 'state') return 1;
        if (a.type !== 'state' && b.type === 'state') return -1;
        return (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name);
      });
      setFilteredSourceItems(matches.slice(0, 15));
    } else {
      // Default top suggestions: Popular Metros + Core States
      const defaultList = [
        ...cities.filter(c => c.tier === 1).slice(0, 10).map(c => ({ ...c, type: 'city' })),
        ...states.slice(0, 6).map(s => ({ ...s, type: 'state', state_name: 'All-India State Network' }))
      ];
      setFilteredSourceItems(defaultList);
    }
  }, [sourceQuery, cities, states]);

  // Filter Destination Locations as user types
  useEffect(() => {
    if (destQuery.trim().length > 0) {
      const q = destQuery.toLowerCase();
      const matches = allLocations.filter(loc => 
        loc.name.toLowerCase().includes(q) || 
        (loc.state_name && loc.state_name.toLowerCase().includes(q))
      );
      matches.sort((a, b) => {
        const aStart = a.name.toLowerCase().startsWith(q);
        const bStart = b.name.toLowerCase().startsWith(q);
        if (aStart && !bStart) return -1;
        if (!aStart && bStart) return 1;
        return (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name);
      });
      setFilteredDestItems(matches.slice(0, 15));
    } else {
      const defaultList = [
        ...cities.filter(c => c.tier === 1).slice(0, 10).map(c => ({ ...c, type: 'city' })),
        ...states.slice(0, 6).map(s => ({ ...s, type: 'state', state_name: 'All-India State Network' }))
      ];
      setFilteredDestItems(defaultList);
    }
  }, [destQuery, cities, states]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(e) {
      if (sourceRef.current && !sourceRef.current.contains(e.target)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When user selects a location from the "From" dropdown:
  const handleSelectSourceItem = (item) => {
    setSourceQuery(item.name);
    setSelectedSourceItem(item);
    setShowSourceDropdown(false);
    if (destInputRef.current) {
      destInputRef.current.focus();
    }
  };

  // When user selects a location from the "To" dropdown:
  const handleSelectDestItem = (item) => {
    setDestQuery(item.name);
    setShowDestDropdown(false);
  };

  // Submission handler - triggers ONLY when clicking "Find Movers" or pressing Enter
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sourceQuery.trim()) {
      if (sourceInputRef.current) {
        sourceInputRef.current.focus();
      }
      return;
    }

    let targetItem = selectedSourceItem;
    if (!targetItem) {
      const q = sourceQuery.trim().toLowerCase();
      targetItem = allLocations.find(loc => loc.name.toLowerCase() === q);
      if (!targetItem && filteredSourceItems.length > 0) {
        targetItem = filteredSourceItems[0];
      }
    }

    let targetUrl = '';
    if (targetItem && targetItem.type === 'state') {
      targetUrl = `/${targetItem.slug}`;
    } else if (targetItem) {
      targetUrl = `/packers-and-movers-${targetItem.slug}`;
    } else {
      const rawSlug = sourceQuery.toLowerCase().trim().replace(/[^\w\-]+/g, '').replace(/\s+/g, '-');
      targetUrl = `/packers-and-movers-${rawSlug}`;
    }

    if (destQuery.trim()) {
      targetUrl += `?to=${encodeURIComponent(destQuery.trim())}`;
    }

    router.push(targetUrl);
  };

  const quickPicks = [
    { name: 'Dhanbad', slug: 'dhanbad' },
    { name: 'Kolkata', slug: 'kolkata' },
    { name: 'Ranchi', slug: 'ranchi' },
    { name: 'Patna', slug: 'patna' },
    { name: 'Lucknow', slug: 'lucknow' },
    { name: 'Bhubaneswar', slug: 'bhubaneswar' },
    { name: 'Singrauli', slug: 'singrauli-mp-hq' },
    { name: 'Delhi NCR', slug: 'new-delhi' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl p-[clamp(0.5rem,1.5vw,0.75rem)] shadow-2xl border border-slate-200/90 flex flex-col md:flex-row items-stretch gap-2.5 relative"
      >
        {/* Source City Input with Autocomplete */}
        <div ref={sourceRef} className="flex-1 relative">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus-within:border-amber-500 focus-within:bg-white transition-all">
            <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Moving From / Current City *
              </label>
              <input
                ref={sourceInputRef}
                type="text"
                required
                value={sourceQuery}
                onChange={(e) => {
                  setSourceQuery(e.target.value);
                  setSelectedSourceItem(null);
                  setShowSourceDropdown(true);
                }}
                onFocus={() => setShowSourceDropdown(true)}
                placeholder="e.g. Dhanbad, Kolkata, Patna, Lucknow, Jharkhand..."
                className="w-full bg-transparent text-slate-900 font-semibold text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Autocomplete Dropdown for "From" City / State */}
          {showSourceDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Select Origin City or State</span>
                <span className="text-emerald-700 flex items-center gap-1 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" /> 100% Certified
                </span>
              </div>
              {filteredSourceItems.length > 0 ? (
                filteredSourceItems.map((item) => (
                  <button
                    key={`${item.type}-${item.id || item.slug}`}
                    type="button"
                    onClick={() => handleSelectSourceItem(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-amber-50/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 group-hover:text-amber-600 text-sm">
                          {item.name}
                        </span>
                        {item.type === 'state' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                            State Network
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {item.type === 'state' ? `${item.region || 'All-India'} Zone • Full State Coverage` : `${item.state_name ? `${item.state_name} • ` : ''}Verified Relocation Hub`}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  Press enter or click &ldquo;Find Movers&rdquo; for {sourceQuery}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Destination City Input with Autocomplete */}
        <div ref={destRef} className="flex-1 relative">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200/80 focus-within:border-amber-500 focus-within:bg-white transition-all">
            <Navigation className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1 text-left">
              <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Moving To / Destination (Optional)
              </label>
              <input
                ref={destInputRef}
                type="text"
                value={destQuery}
                onChange={(e) => {
                  setDestQuery(e.target.value);
                  setShowDestDropdown(true);
                }}
                onFocus={() => setShowDestDropdown(true)}
                placeholder="Any City / State in India"
                className="w-full bg-transparent text-slate-900 font-semibold text-sm sm:text-base focus:outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Autocomplete Dropdown for "To" City / State */}
          {showDestDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 max-h-72 overflow-y-auto">
              <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
                <span>Select Destination City or State</span>
                <span className="text-blue-600 font-semibold text-[10px]">Interstate & Local</span>
              </div>
              {filteredDestItems.length > 0 ? (
                filteredDestItems.map((item) => (
                  <button
                    key={`dest-${item.type}-${item.id || item.slug}`}
                    type="button"
                    onClick={() => handleSelectDestItem(item)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50/80 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 group-hover:text-blue-600 text-sm">
                          {item.name}
                        </span>
                        {item.type === 'state' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                            State
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-600 font-medium">
                        {item.type === 'state' ? `${item.region || 'All-India'} Zone • Direct Transit Available` : `${item.state_name ? `${item.state_name} • ` : ''}Direct Transit Available`}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  Destination: &ldquo;{destQuery}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submit Search Button - Fluid full width on mobile */}
        <button
          type="submit"
          className="w-full md:w-auto px-[clamp(1.25rem,3vw,2rem)] py-[clamp(0.75rem,1.8vw,1rem)] rounded-xl font-bold text-[clamp(0.8125rem,1.2vw,1rem)] text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 flex-shrink-0"
        >
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Find Movers</span>
        </button>
      </form>

      {/* Quick Search Chips - Liquid Responsive */}
      <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
        <span className="text-slate-500 font-semibold mr-1">Popular Hubs:</span>
        {quickPicks.map((pick) => (
          <button
            key={pick.slug}
            type="button"
            onClick={() => router.push(`/packers-and-movers-${pick.slug}`)}
            className="px-2.5 sm:px-3 py-1 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 hover:text-amber-600 font-semibold shadow-sm hover:shadow transition-all active:scale-95"
          >
            {pick.name}
          </button>
        ))}
      </div>
    </div>
  );
}

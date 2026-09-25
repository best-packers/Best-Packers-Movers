'use client';

import { useState } from 'react';
import { Globe, Sparkles, CheckCircle2, Star, PhoneCall, MapPin, Loader2 } from 'lucide-react';

export default function CrawlerUI({ states = [], cities = [] }) {
  const [selectedStateId, setSelectedStateId] = useState(states[0]?.id || '');
  const [selectedCityId, setSelectedCityId] = useState('');
  const [crawling, setCrawling] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Filter cities for selected state
  const stateCities = cities.filter(c => c.state_id === selectedStateId);
  const currentCity = cities.find(c => c.id === (selectedCityId || stateCities[0]?.id));
  const currentState = states.find(s => s.id === selectedStateId);

  const handleStartCrawl = async () => {
    const targetCity = currentCity || stateCities[0];
    if (!targetCity) {
      setErrorMsg('Please select a valid city to crawl.');
      return;
    }

    setCrawling(true);
    setErrorMsg('');
    setResults(null);

    try {
      const res = await fetch('/api/admin/crawler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city_id: targetCity.id,
          city_name: targetCity.name,
          state_name: currentState?.name || '',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data);
      } else {
        setErrorMsg(data.error || 'Crawler encountered an error.');
      }
    } catch (err) {
      setErrorMsg('Network error while running crawler.');
    } finally {
      setCrawling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Card */}
      <div className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-6 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Target State
            </label>
            <select
              value={selectedStateId}
              onChange={(e) => {
                setSelectedStateId(e.target.value);
                const first = cities.find(c => c.state_id === e.target.value);
                setSelectedCityId(first ? first.id : '');
              }}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Target City / Urban Hub
            </label>
            <select
              value={selectedCityId || stateCities[0]?.id || ''}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-amber-500 focus:outline-none"
            >
              {stateCities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-900/40 border border-rose-700 text-xs text-rose-300">
            {errorMsg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-400">
            Target Query: <span className="font-mono text-amber-400">packers and movers in {currentCity?.name || 'Selected City'}</span>
          </div>

          <button
            type="button"
            onClick={handleStartCrawl}
            disabled={crawling}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {crawling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Querying Google Maps & Places...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Crawl Google/Maps for {currentCity?.name}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {results && (
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-700">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Crawl Completed Successfully</span>
              </div>
              <h2 className="text-xl font-bold text-white">
                Discovered Movers in {results.city} ({results.discovered_count} Imported)
              </h2>
            </div>
            <a
              href={`/packers-and-movers-${currentCity?.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
            >
              View Live City Page
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.movers.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-white text-sm">{m.name}</h3>
                  <div className="flex items-center bg-emerald-900/60 text-emerald-300 font-bold px-2 py-0.5 rounded text-xs gap-1 flex-shrink-0">
                    <span>{m.rating}</span>
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] text-slate-400">({m.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                  <PhoneCall className="w-3 h-3" />
                  <span>{m.phone}</span>
                </div>

                <div className="flex items-start gap-1 text-[11px] text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{m.address}</span>
                </div>

                <div className="pt-2 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold uppercase">
                    Auto-Imported to Directory
                  </span>
                  <span className="text-slate-500 font-mono">
                    source: {m.source}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

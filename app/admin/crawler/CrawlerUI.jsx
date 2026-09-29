'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Globe, Sparkles, CheckCircle2, Star, PhoneCall, MapPin, Loader2, ArrowRight, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

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
      <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 space-y-6 shadow-xl relative overflow-hidden">
        
        {/* Top Header Badge */}
        <div className="border-l-3 border-[#F7B731] pl-3 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B731]/15 text-[#F7B731] text-[10px] font-extrabold uppercase tracking-widest border border-[#F7B731]/30">
            <Zap className="w-3 h-3" />
            <span>Autonomous Intelligence Spider</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            Live Google Maps &amp; SERP Search Harvest
          </h2>
          <p className="text-xs text-[#A8B2C1]">
            Select any territory across India to scrape authentic local moving companies, real phone numbers, and ratings into the database below Slot #1 National Packers.
          </p>
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B2C1] mb-2">
              Target State / Region
            </label>
            <select
              value={selectedStateId}
              onChange={(e) => {
                setSelectedStateId(e.target.value);
                const first = cities.find(c => c.state_id === e.target.value);
                setSelectedCityId(first ? first.id : '');
              }}
              className="w-full px-4 py-3 rounded-xl bg-[#080C12]/80 border border-white/10 text-white text-sm focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] focus:outline-none transition-all font-semibold"
            >
              {states.map((st) => (
                <option key={st.id} value={st.id} className="bg-[#162236] text-white">
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#A8B2C1] mb-2">
              Target Municipal City / Urban Tehsil
            </label>
            <select
              value={selectedCityId || stateCities[0]?.id || ''}
              onChange={(e) => setSelectedCityId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#080C12]/80 border border-white/10 text-white text-sm focus:border-[#F7B731] focus:ring-1 focus:ring-[#F7B731] focus:outline-none transition-all font-semibold"
            >
              {stateCities.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#162236] text-white">
                  {c.name} {c.tier === 1 ? '★ Metro' : c.tier === 2 ? '• District Hub' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-[#C1121F]/15 border border-[#C1121F]/40 text-[#FF6B6B] text-xs font-bold">
            {errorMsg}
          </div>
        )}

        {/* Trigger Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/5">
          <div className="text-xs text-[#A8B2C1]">
            Active Live Search Target: <span className="font-mono text-[#F7B731] font-bold">&quot;packers and movers in {currentCity?.name || 'Selected City'}&quot;</span>
          </div>

          <button
            type="button"
            onClick={handleStartCrawl}
            disabled={crawling}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-extrabold text-sm text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(247,183,49,0.35)] active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {crawling ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Executing Live Google Crawl...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 stroke-[2.5]" />
                <span>Harvest Google Data for {currentCity?.name}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Crawled Results View */}
      {results && (
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Live Harvest Completed</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                Discovered Movers in {results.city} ({results.discovered_count} Verified &amp; Ranked)
              </h2>
            </div>
            
            <Link
              href={`/packers-and-movers-${currentCity?.slug}`}
              target="_blank"
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#F7B731] border border-[#F7B731]/50 hover:bg-[#F7B731] hover:text-[#080C12] transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Inspect Live Directory</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.movers.map((m) => (
              <div key={m.id} className="p-4 sm:p-5 rounded-2xl bg-[#080C12]/70 border border-white/5 hover:border-[#F7B731]/40 transition-all space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono text-[#F7B731] font-bold">Rank #{m.rank_order}</span>
                    <h3 className="font-extrabold text-white text-sm">{m.name}</h3>
                  </div>
                  <div className="flex items-center bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 font-bold px-2 py-0.5 rounded-lg text-xs gap-1 flex-shrink-0">
                    <span>{m.rating}</span>
                    <Star className="w-3 h-3 fill-current text-amber-300" />
                    <span className="text-[10px] text-[#A8B2C1]">({m.reviewCount})</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#FFD166] font-mono font-semibold">
                  <PhoneCall className="w-3.5 h-3.5 text-[#F7B731]" />
                  <span>{m.phone}</span>
                </div>

                <div className="flex items-start gap-1.5 text-xs text-[#A8B2C1]">
                  <MapPin className="w-3.5 h-3.5 text-[#6B7585] flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{m.address}</span>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Auto-Ranked in Directory
                  </span>
                  <span className="text-[#6B7585] font-mono">
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

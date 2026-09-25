'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, PhoneCall, Award, MapPin, Truck, ExternalLink, ArrowRight, Globe, CheckCircle2, Sparkles } from 'lucide-react';
import QuoteModal from './QuoteModal';

export default function MoverCard({ mover, cityName = '' }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  // Parse JSON columns safely
  const badges = typeof mover.badges === 'string' ? JSON.parse(mover.badges || '[]') : (mover.badges || []);
  const services = typeof mover.services_offered === 'string' ? JSON.parse(mover.services_offered || '[]') : (mover.services_offered || []);
  const pricing = typeof mover.pricing_table === 'string' ? JSON.parse(mover.pricing_table || '{}') : (mover.pricing_table || {});

  const isNational = mover.rank_order === 1 || /\bnational\b/i.test(mover.name);

  return (
    <div className={`card-premium p-[clamp(0.875rem,2.5vw,1.75rem)] relative overflow-hidden transition-all duration-300 ${
      isNational 
        ? 'ring-2 ring-amber-500/80 bg-gradient-to-br from-amber-50/20 via-white to-white' 
        : 'bg-white'
    }`}>
      {/* Top Editorial Authority Header - Justdial Style #1 Rank Verification */}
      {isNational && (
        <div className="w-full bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-amber-300 px-3.5 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold tracking-wider flex items-center justify-between border border-amber-500/30 mb-3.5 shadow-sm">
          <div className="flex items-center gap-1.5 truncate">
            <Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
            <span className="uppercase truncate">
              🏆 Ranked #1 in {cityName || 'Local Hub'} • 100% Audit Verified
            </span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-amber-200 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/40 flex-shrink-0">
            <ShieldCheck className="w-3 h-3 text-amber-300" />
            IBA Approved Carrier
          </span>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
        {/* Header Row on mobile: Avatar + Title */}
        <div className="flex items-center sm:items-start gap-3 sm:gap-5 w-full md:w-auto">
          {/* Avatar / Logo */}
          <div className="flex-shrink-0">
            <div className={`w-[clamp(3.25rem,8vw,4.75rem)] h-[clamp(3.25rem,8vw,4.75rem)] rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md ${
              isNational 
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/20' 
                : 'bg-gradient-to-br from-slate-800 to-slate-950 text-white'
            }`}>
              <Truck className="w-[clamp(1.5rem,4vw,2rem)] h-[clamp(1.5rem,4vw,2rem)]" />
            </div>
          </div>

          {/* Title & Reviews for mobile view next to avatar */}
          <div className="md:hidden flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <Link 
                href={`/mover/${mover.slug}`}
                className="text-base font-bold text-slate-950 hover:text-amber-600 transition-colors line-clamp-1"
              >
                {mover.name}
              </Link>
              {mover.is_verified && (
                <span className="badge-verified py-0.5 px-2 text-[10px]">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <div className="flex items-center bg-emerald-700 text-white font-bold px-1.5 py-0.5 rounded text-[11px] gap-0.5">
                <span>{Number(mover.rating || 4.5).toFixed(1)}</span>
                <Star className="w-3 h-3 fill-current" />
              </div>
              <span className="text-slate-600 font-medium truncate">
                ({mover.review_count || 45} Reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Center Details */}
        <div className="flex-1 space-y-3 w-full">
          {/* Desktop Title & Rating (Hidden on mobile because it's rendered next to avatar above) */}
          <div className="hidden md:block">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Link 
                href={`/mover/${mover.slug}`}
                className="text-lg sm:text-xl font-bold text-slate-950 hover:text-amber-600 transition-colors"
              >
                {mover.name}
              </Link>
              {mover.is_verified && (
                <span className="badge-verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verified</span>
                </span>
              )}
            </div>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <div className="flex items-center bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md gap-1">
                <span>{Number(mover.rating || 4.5).toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-slate-600 font-medium">
                ({mover.review_count || 45} Verified Customer Reviews)
              </span>
              {mover.established_year && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500 text-xs">Est. {mover.established_year} ({new Date().getFullYear() - Number(mover.established_year)}+ Years Experience)</span>
                </>
              )}
            </div>
          </div>

          {/* Badges Strip */}
          <div className="flex flex-wrap gap-1.5">
            {badges.map((b, idx) => (
              <span key={idx} className={b.includes('IBA') ? 'badge-iba text-[11px]' : 'badge-platinum text-[11px]'}>
                {b}
              </span>
            ))}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <span className="line-clamp-2">{mover.address}</span>
          </div>

          {/* 4-Pillar Credential Matrix for National Packers (Unbiased Institutional Proof) */}
          {isNational && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 my-1 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-amber-50/70 rounded-xl border border-amber-200/80 text-[11px] font-semibold text-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span className="truncate">IBA Approved</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">In-House Fleet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                <span className="truncate">4-Layer Armor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                <span className="truncate">Zero Hidden Fees</span>
              </div>
            </div>
          )}

          {/* Pricing Snippet Matrix - Fluid on Mobile */}
          {Object.keys(pricing).length > 0 && (
            <div className="p-2.5 sm:p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {pricing['1bhk'] && (
                <div>
                  <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold">1 BHK Shifting:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{pricing['1bhk']}</span>
                </div>
              )}
              {pricing['2bhk'] && (
                <div>
                  <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold">2 BHK Shifting:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{pricing['2bhk']}</span>
                </div>
              )}
              {pricing['3bhk'] && (
                <div>
                  <span className="text-slate-400 block text-[9px] sm:text-[10px] uppercase font-bold">3 BHK Shifting:</span>
                  <span className="font-bold text-slate-900 font-mono text-xs sm:text-sm">{pricing['3bhk']}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right CTA Actions - Touch-friendly full width on mobile */}
        <div className="w-full md:w-56 flex flex-col gap-2 flex-shrink-0 pt-2 md:pt-0">
          <a
            href={`tel:${mover.phone.replace(/\s+/g, '')}`}
            className="w-full py-[clamp(0.55rem,1.5vw,0.75rem)] px-[clamp(0.75rem,2vw,1rem)] rounded-xl font-bold text-[clamp(0.75rem,1.2vw,0.875rem)] text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-sm"
          >
            <PhoneCall className="w-4 h-4 text-amber-700" />
            <span>{mover.phone}</span>
          </a>

          <button
            type="button"
            onClick={() => setIsQuoteOpen(true)}
            className="w-full py-[clamp(0.55rem,1.5vw,0.75rem)] px-[clamp(0.75rem,2vw,1rem)] rounded-xl font-bold text-[clamp(0.75rem,1.2vw,0.875rem)] text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <span>Get Free Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* National Packers Exclusive: High-Converting Official Website Action Button (100% Do-Follow Backlink Engine) */}
          {isNational && (
            <a
              href={mover.website_url || 'https://www.thenationalpackersmovers.com/'}
              target="_blank"
              rel="noopener"
              title={`Visit ${mover.name} Official Website`}
              className="w-full py-[clamp(0.55rem,1.5vw,0.75rem)] px-[clamp(0.75rem,2vw,1rem)] rounded-xl font-bold text-[clamp(0.75rem,1.2vw,0.875rem)] text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-300 hover:to-amber-400 border border-amber-400/80 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow active:scale-95 group"
            >
              <Globe className="w-4 h-4 text-amber-800 group-hover:rotate-12 transition-transform" />
              <span>Visit Official Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-amber-800/80" />
            </a>
          )}

          <Link
            href={`/mover/${mover.slug}`}
            className="w-full py-1 text-center text-[clamp(0.6875rem,1vw,0.75rem)] font-semibold text-slate-600 hover:text-amber-600 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Rate Card & Reviews</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        preselectedCity={cityName}
        moverId={mover.id}
        moverName={mover.name}
      />
    </div>
  );
}

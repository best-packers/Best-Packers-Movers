'use client';

import { useState } from 'react';
import { PhoneCall, ArrowRight, ShieldCheck, Clock, Award, CheckCircle2 } from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';

export default function ProfileStickySidebar({ phone, moverId, moverName, cityName, isNational }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-lg space-y-6">
      <div className="space-y-1.5">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <Clock className="w-3.5 h-3.5" />
          <span>Instant Quote Response (&lt; 5 mins)</span>
        </div>
        <h3 className="text-lg font-extrabold text-slate-950 pt-1 leading-snug">
          Request Free Moving Estimate
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Direct guaranteed quote from {moverName} with zero broker commission.
        </p>
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setIsQuoteOpen(true)}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 group"
        >
          <span>Calculate Shifting Price</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <a
          href={`tel:${phone.replace(/\s+/g, '')}`}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm text-slate-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <PhoneCall className="w-4 h-4 text-amber-700" />
          <span>Call: {phone}</span>
        </a>
      </div>

      {/* Directory Verification Guarantee Box */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
          BestPackers Directory Guarantee
        </div>
        <div className="space-y-2.5 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span><strong>100% Background Checked:</strong> License & Physical Hub Verified in {cityName}.</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <span><strong>Zero Spot Demands:</strong> Binding written rate card before loading.</span>
          </div>
          <div className="flex items-start gap-2">
            <Award className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <span><strong>Transit Policy Included:</strong> Full protection coverage against in-transit loss.</span>
          </div>
        </div>
      </div>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        preselectedCity={cityName}
        moverId={moverId}
        moverName={moverName}
      />
    </div>
  );
}

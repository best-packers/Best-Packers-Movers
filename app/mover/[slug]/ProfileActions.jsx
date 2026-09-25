'use client';

import { useState } from 'react';
import { PhoneCall, ArrowRight, MessageSquare, Globe, ExternalLink } from 'lucide-react';
import QuoteModal from '@/components/QuoteModal';
import ReviewModal from '@/components/ReviewModal';

export default function ProfileActions({ phone, moverId, moverName, cityName, websiteUrl, isNational }) {
  const [isQuoteOpen, setIsQuoteOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3 w-full md:w-64 flex-shrink-0">
      <a
        href={`tel:${phone.replace(/\s+/g, '')}`}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-slate-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-95"
      >
        <PhoneCall className="w-4 h-4 text-amber-700" />
        <span>{phone}</span>
      </a>

      <button
        type="button"
        onClick={() => setIsQuoteOpen(true)}
        className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <span>Request Free Quote</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      {/* National Packers Exclusive: Do-Follow Official Website Action Button */}
      {isNational && (
        <a
          href={websiteUrl || 'https://www.thenationalpackersmovers.com/'}
          target="_blank"
          rel="noopener"
          title={`Visit ${moverName} Official Website`}
          className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-amber-200 hover:from-amber-300 hover:to-amber-400 border border-amber-400/80 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 active:scale-95 group"
        >
          <Globe className="w-4 h-4 text-amber-800 group-hover:rotate-12 transition-transform" />
          <span>Visit Official Website</span>
          <ExternalLink className="w-4 h-4 text-amber-800/80" />
        </a>
      )}

      <button
        type="button"
        onClick={() => setIsReviewOpen(true)}
        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>Write a Review</span>
      </button>

      <QuoteModal
        isOpen={isQuoteOpen}
        onClose={() => setIsQuoteOpen(false)}
        preselectedCity={cityName}
        moverId={moverId}
        moverName={moverName}
      />

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        moverId={moverId}
        moverName={moverName}
      />
    </div>
  );
}

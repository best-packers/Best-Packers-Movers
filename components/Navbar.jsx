'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, ShieldCheck, PhoneCall, Award, Menu, X, Sparkles, Calculator, Lock, ChevronRight } from 'lucide-react';
import QuoteModal from './QuoteModal';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all w-full max-w-full overflow-hidden">
        {/* Top Notification Strip - Fluid Mobile Responsive */}
        <div className="bg-slate-950 text-white text-[11px] sm:text-xs py-1 px-3 sm:px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
              <span className="text-slate-300 truncate">India&apos;s #1 Verified Packers & Movers Directory</span>
              <span className="hidden md:inline text-slate-500">|</span>
              <span className="hidden md:inline-flex items-center gap-1 text-amber-300 font-medium">
                <Award className="w-3.5 h-3.5" /> 100% IBA Approved Fleets
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-auto">
              <a 
                href="tel:+919835168368" 
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-bold transition-colors text-[11px] sm:text-xs"
              >
                <PhoneCall className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Helpline:</span>
                <span>+91 98351 68368</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Navbar - 100% Contained, Never Overflows */}
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-shrink group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-base sm:text-xl font-extrabold tracking-tight text-slate-950 font-serif truncate">
                  Best<span className="text-amber-600">Packer</span>Movers
                </span>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1 py-0.2 rounded flex-shrink-0">
                  .com
                </span>
              </div>
              <p className="hidden md:block text-[11px] text-slate-700 font-bold tracking-wide">
                PAN-India Certified Relocation Directory
              </p>
            </div>
          </Link>

          {/* Center Nav Links - Desktop (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-slate-700 flex-shrink-0">
            <Link 
              href="/" 
              className={`transition-colors hover:text-amber-600 ${pathname === '/' ? 'text-amber-600' : ''}`}
            >
              Home
            </Link>
            <Link 
              href="/top-packers-and-movers" 
              className={`transition-colors hover:text-amber-600 ${pathname === '/top-packers-and-movers' ? 'text-amber-600' : ''}`}
            >
              Top Movers
            </Link>
            <Link 
              href="/iba-approved-packers-and-movers" 
              className={`transition-colors hover:text-amber-600 flex items-center gap-1 ${pathname === '/iba-approved-packers-and-movers' ? 'text-amber-600' : ''}`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> IBA Approved
            </Link>
            <Link 
              href="/#calculator" 
              className="hover:text-amber-600 transition-colors"
            >
              Cost Calculator
            </Link>
            <Link 
              href="/admin" 
              className="text-slate-700 hover:text-slate-900 transition-colors text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md flex items-center gap-1"
            >
              <Lock className="w-3 h-3 text-slate-500" /> Admin Portal
            </Link>
          </nav>

          {/* Action Buttons & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Quick Call Icon on Mobile, Call HQ on Desktop */}
            <a
              href="tel:+919835168368"
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-amber-500 text-amber-600 hover:bg-amber-50 font-bold text-xs transition-all flex items-center gap-1"
              title="Call 24x7 Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Call HQ</span>
            </a>

            {/* Quick Quote Button */}
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-2.5 sm:px-4 py-2 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 hidden sm:inline" />
              <span className="hidden sm:inline">Get Free Quotes</span>
              <span className="sm:hidden">Quote</span>
            </button>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-900" />
              ) : (
                <Menu className="w-5 h-5 text-slate-900" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-x-0 top-[73px] sm:top-[89px] bottom-0 z-50 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white border-b border-slate-200 shadow-2xl max-h-[calc(100vh-80px)] overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="space-y-1">
                <Link
                  href="/"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                    pathname === '/' ? 'bg-amber-50 text-amber-700' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <span>Home</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/top-packers-and-movers"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                    pathname === '/top-packers-and-movers' ? 'bg-amber-50 text-amber-700' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>Top Movers</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                      All-India
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/iba-approved-packers-and-movers"
                  className={`flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                    pathname === '/iba-approved-packers-and-movers' ? 'bg-blue-50 text-blue-700' : 'text-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>IBA Approved Fleets</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/#calculator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-amber-600" />
                    <span>Cost Calculator</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>

                <Link
                  href="/admin"
                  className="flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Admin Control Center</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </Link>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <a
                  href="tel:+919835168368"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-amber-700 bg-amber-50 border border-amber-200 active:scale-95 transition-all shadow-sm"
                >
                  <PhoneCall className="w-4 h-4 text-amber-600" />
                  <span>Call 24x7 Helpline: +91 98351 68368</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsQuoteModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 shadow-md active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Request Instant Free Quotes</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Quote Modal */}
      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
      />
    </>
  );
}

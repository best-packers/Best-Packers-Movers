'use client';

import { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, CheckCircle, Sparkles } from 'lucide-react';
import QuoteModal from './QuoteModal';

export default function CostEstimator({ cityName = 'Your City' }) {
  const [moveType, setMoveType] = useState('local'); // 'local' or 'domestic'
  const [bhk, setBhk] = useState('2bhk');
  const [distance, setDistance] = useState(15);
  const [isPremiumPacking, setIsPremiumPacking] = useState(true);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);

  // Pricing Matrix calculation
  const basePrices = {
    '1bhk': { localBase: 3500, perKm: 18, packingBase: 1200 },
    '2bhk': { localBase: 5500, perKm: 26, packingBase: 1800 },
    '3bhk': { localBase: 8500, perKm: 34, packingBase: 2500 },
    '4bhk': { localBase: 12500, perKm: 42, packingBase: 3500 },
    'vehicle': { localBase: 2500, perKm: 12, packingBase: 800 },
  };

  const selectedConfig = basePrices[bhk] || basePrices['2bhk'];
  const effectiveDistance = moveType === 'local' ? Math.min(distance, 50) : Math.max(distance, 100);

  const freightCost = moveType === 'local' 
    ? selectedConfig.localBase + (effectiveDistance * selectedConfig.perKm * 0.8)
    : selectedConfig.localBase * 1.5 + (effectiveDistance * selectedConfig.perKm);

  const packingCost = isPremiumPacking ? selectedConfig.packingBase * 1.3 : selectedConfig.packingBase;
  const loadingUnloading = selectedConfig.localBase * 0.35;

  const totalLow = Math.round((freightCost + packingCost + loadingUnloading) * 0.95 / 100) * 100;
  const totalHigh = Math.round((freightCost + packingCost + loadingUnloading) * 1.15 / 100) * 100;

  return (
    <div id="calculator" className="card-premium p-[clamp(0.875rem,2.5vw,2rem)] bg-gradient-to-br from-white via-amber-50/20 to-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-amber-600 text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Interactive Relocation Tool</span>
          </div>
          <h3 className="text-[clamp(1.15rem,2.5vw+0.35rem,1.5rem)] font-bold text-slate-950">
            Packers & Movers Cost Estimator ({cityName})
          </h3>
          <p className="text-[clamp(0.75rem,1vw,0.875rem)] text-slate-500 mt-1">
            Calculate accurate local & intercity home shifting charges with zero hidden fees.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => { setMoveType('local'); setDistance(15); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-center ${
              moveType === 'local'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Local (Within City)
          </button>
          <button
            type="button"
            onClick={() => { setMoveType('domestic'); setDistance(450); }}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all text-center ${
              moveType === 'domestic'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Intercity (Domestic)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Controls Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* BHK Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Step 1: Choose House / Move Size
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-xs">
              {[
                { id: '1bhk', label: '1 BHK' },
                { id: '2bhk', label: '2 BHK' },
                { id: '3bhk', label: '3 BHK' },
                { id: '4bhk', label: '4+ BHK' },
                { id: 'vehicle', label: 'Vehicle' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBhk(item.id)}
                  className={`py-3 px-2 rounded-xl border text-center font-bold transition-all ${
                    bhk === item.id
                      ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Distance Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
              <span className="uppercase tracking-wider text-slate-500">
                Step 2: Approximate Shifting Distance
              </span>
              <span className="text-amber-600 font-mono text-sm bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                {distance} KM
              </span>
            </div>
            <input
              type="range"
              min={moveType === 'local' ? 5 : 80}
              max={moveType === 'local' ? 60 : 2500}
              step={moveType === 'local' ? 2 : 25}
              value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>{moveType === 'local' ? '5 KM' : '80 KM'}</span>
              <span>{moveType === 'local' ? '30 KM (Metro Local)' : '1000 KM (Interstate)'}</span>
              <span>{moveType === 'local' ? '60 KM' : '2500 KM'}</span>
            </div>
          </div>

          {/* Packing Quality Toggle */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <div className="font-bold text-xs text-slate-900">
                Multi-Layer Waterproof Bubble Packaging
              </div>
              <div className="text-[11px] text-slate-500">
                Heavy corrugated sheets, bubble wrap & stretch film for electronics & furniture
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPremiumPacking(!isPremiumPacking)}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 flex-shrink-0 ${
                isPremiumPacking ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white block shadow-sm transform transition-transform ${
                  isPremiumPacking ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pricing Output Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white rounded-2xl p-[clamp(1rem,2.5vw,1.5rem)] shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

          <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Estimated Relocation Cost</span>
          </div>

          <div className="text-[clamp(1.4rem,4.5vw+0.2rem,2.25rem)] font-extrabold text-white tracking-tight my-2 break-words">
            ₹{totalLow.toLocaleString('en-IN')} <span className="text-slate-400 text-base sm:text-lg font-normal">-</span> ₹{totalHigh.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mb-6">
            Includes GST, toll charges, door-to-door transit, and labor.
          </p>

          <div className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
            <div className="flex justify-between">
              <span>Packing & Material Charges:</span>
              <span className="font-semibold text-white font-mono">₹{Math.round(packingCost).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Loading & Unloading Labor:</span>
              <span className="font-semibold text-white font-mono">₹{Math.round(loadingUnloading).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Transit Freight ({distance} KM):</span>
              <span className="font-semibold text-white font-mono">₹{Math.round(freightCost).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-start gap-2 text-[11px] text-amber-300/90 leading-tight">
            <span className="text-amber-400 font-bold text-xs flex-shrink-0">⚠️</span>
            <span>
              <strong>Indicative Estimate:</strong> Final quotes vary based on physical inventory volume, floor level / lift status, packing grade, and on-site survey.
            </span>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Lock in This Free Quote</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>BestPackerMovers Zero Hidden Cost Guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Standard Price Disclaimer */}
      <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-slate-700 leading-relaxed shadow-sm">
        <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-1.5">
          <span>💡</span>
          <span>Important Price Disclaimer ({cityName}):</span>
        </div>
        <p>
          These are estimated price ranges based on average moves. The actual cost of relocation in <strong className="text-slate-900">{cityName}</strong> depends on the exact volume of goods, type of packing material, building floor level (lift availability), total distance, chosen service type, and whether a standard or premium relocation package is selected. Final shifting quotes are provided after a free, zero-obligation pre-move survey.
        </p>
      </div>

      <QuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        preselectedCity={cityName}
      />
    </div>
  );
}

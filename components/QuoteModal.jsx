'use client';

import { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, ArrowRight, Truck, PhoneCall, Sparkles } from 'lucide-react';

export default function QuoteModal({ isOpen, onClose, preselectedCity = '', moverId = null, moverName = '' }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    from_city: preselectedCity || '',
    to_city: '',
    move_date: '',
    move_size: '2 BHK',
    mover_id: moverId,
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const moveSizes = [
    { id: '1 BHK', label: '1 BHK (Compact Shift)' },
    { id: '2 BHK', label: '2 BHK (Standard Family)' },
    { id: '3 BHK', label: '3 BHK (Large Home)' },
    { id: '4+ BHK / Villa', label: '4+ BHK / Villa' },
    { id: 'Vehicle Only', label: 'Car / Bike Transport' },
    { id: 'Commercial Office', label: 'Office / Commercial' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_phone || formData.customer_phone.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!formData.customer_name.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source_page: typeof window !== 'undefined' ? window.location.pathname : '',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitted(true);
        // Instant WhatsApp Forwarding to Central Verification Desk
        const waText = encodeURIComponent(
          `*New Relocation Inquiry - BestPackerMovers.com*\n` +
          `• Name: ${formData.customer_name}\n` +
          `• Phone: ${formData.customer_phone}\n` +
          `• Route: ${formData.from_city} ➔ ${formData.to_city || 'Local Shifting'}\n` +
          `• Move Size: ${formData.move_size}\n` +
          `• Preferred Date: ${formData.move_date || 'Flexible'}\n` +
          (moverName ? `• Target Mover: ${moverName}\n` : '') +
          `Please provide an instant verified quote.`
        );
        setTimeout(() => {
          window.open(`https://wa.me/919835168368?text=${waText}`, '_blank');
        }, 1200);
      } else {
        setErrorMsg(data.error || 'Failed to submit quote request. Please try again.');
      }
    } catch (err) {
      setErrorMsg('Network error. Please call +91 98351 68368 directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 relative animate-scaleUp my-auto">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white p-4 sm:p-6 relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 sm:top-5 right-4 sm:right-5 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Guaranteed Lowest Price Quote</span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold tracking-tight pr-6">
            {moverName ? `Get Official Quote: ${moverName}` : 'Compare Top Verified Packers & Movers'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Zero booking advance • Free cancellation • IBA approved insurance bills
          </p>
        </div>

        {/* Modal Body - Scrollable on mobile */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 overscroll-contain">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold text-slate-950">Quote Request Dispatched!</h4>
              <p className="text-sm text-slate-600 max-w-sm mx-auto">
                Thank you, <strong className="text-slate-900">{formData.customer_name}</strong>. Our verified relocation team has received your inquiry for <strong>{formData.from_city}</strong> to <strong>{formData.to_city || 'Local'}</strong>.
              </p>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 text-left space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <PhoneCall className="w-3.5 h-3.5" /> Instant Hotline Dispatch
                </div>
                <div>A senior logistics manager will call you within 5 minutes at <strong>{formData.customer_phone}</strong> with starting rate cards.</div>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-950 text-white font-semibold text-sm hover:bg-slate-800 transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Step 1: Move Location & Date */}
              {step === 1 && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Moving From (City) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.from_city}
                        onChange={(e) => setFormData({ ...formData, from_city: e.target.value })}
                        placeholder="e.g. Dhanbad"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Moving To (City / Area) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.to_city}
                        onChange={(e) => setFormData({ ...formData, to_city: e.target.value })}
                        placeholder="e.g. Kolkata or Local"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Expected Moving Date
                    </label>
                    <input
                      type="date"
                      value={formData.move_date}
                      onChange={(e) => setFormData({ ...formData, move_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Select Move Size
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {moveSizes.map((size) => (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, move_size: size.id })}
                          className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                            formData.move_size === size.id
                              ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 text-slate-700'
                          }`}
                        >
                          {size.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (!formData.from_city.trim() || !formData.to_city.trim()) {
                          setErrorMsg('Please specify both Moving From and Moving To locations.');
                          return;
                        }
                        setErrorMsg('');
                        setStep(2);
                      }}
                      className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <span>Next: Enter Contact Info</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Contact Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <div>
                      <strong>{formData.from_city}</strong> ➔ <strong>{formData.to_city}</strong> ({formData.move_size})
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-amber-600 font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      10-Digit Mobile Number * (For Instant WhatsApp Estimate)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3.5 py-2.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-100 text-sm font-semibold text-slate-600">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.customer_phone}
                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value.replace(/\D/g, '') })}
                        placeholder="9876543210"
                        className="w-full px-3.5 py-2.5 rounded-r-xl border border-slate-300 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 font-mono font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-emerald-700">
                    <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                    <span>Your number is 100% confidential. No spam policy.</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 text-center leading-tight">
                    💡 <em>Rates shown online are estimates. Final quotation is locked after your free, zero-obligation pre-move survey.</em>
                  </div>

                  <div className="pt-2 flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <span>Submitting Request...</span>
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          <span>Get Free Instant Quotes Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

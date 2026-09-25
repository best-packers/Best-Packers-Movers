'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ExternalLink, Save, CheckCircle2, ShieldCheck, 
  Award, Star, Truck, Calendar, DollarSign, FileText, Loader2, Plus, X 
} from 'lucide-react';

export default function ProfileEditorUI({ mover }) {
  // Parse existing JSON data safely
  const initialBadges = typeof mover.badges === 'string' ? JSON.parse(mover.badges || '[]') : (mover.badges || []);
  const initialServices = typeof mover.services_offered === 'string' ? JSON.parse(mover.services_offered || '[]') : (mover.services_offered || []);
  const initialPricing = typeof mover.pricing_table === 'string' ? JSON.parse(mover.pricing_table || '{}') : (mover.pricing_table || {});

  const [form, setForm] = useState({
    id: mover.id,
    name: mover.name || '',
    phone: mover.phone || '',
    email: mover.email || '',
    website_url: mover.website_url || '',
    address: mover.address || '',
    rating: Number(mover.rating || 4.5),
    review_count: Number(mover.review_count || 50),
    rank_order: Number(mover.rank_order || 99),
    is_verified: !!mover.is_verified,
    is_featured: !!mover.is_featured,
    established_year: mover.established_year || '',
    fleet_size: mover.fleet_size || '',
    about_text: mover.about_text || '',
    badges: initialBadges,
    services: initialServices,
    pricing: {
      '1bhk': initialPricing['1bhk'] || '₹3,500 - ₹6,500',
      '2bhk': initialPricing['2bhk'] || '₹5,500 - ₹9,500',
      '3bhk': initialPricing['3bhk'] || '₹8,500 - ₹14,500',
      '4bhk_villa': initialPricing['4bhk_villa'] || '₹12,500 - ₹22,000',
      'vehicle': initialPricing['vehicle'] || '₹4,500 - ₹9,000',
      'office': initialPricing['office'] || 'Custom Inspection Quote'
    }
  });

  const [newBadge, setNewBadge] = useState('');
  const [newService, setNewService] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const availableBadges = [
    '#1 Top Rated',
    'Platinum Verified',
    'IBA Approved',
    'ISO Certified',
    'Google Verified',
    'Licensed Carrier',
    '100% Damage Protection',
    'GPS Tracked Fleets'
  ];

  const availableServices = [
    'Household Relocation',
    'Car & Bike Transport',
    'Corporate Office Shifting',
    'Warehouse Storage',
    'Transit Insurance',
    'Pet Relocation',
    'Industrial Heavy Transport'
  ];

  const handleToggleBadge = (badge) => {
    if (form.badges.includes(badge)) {
      setForm({ ...form, badges: form.badges.filter(b => b !== badge) });
    } else {
      setForm({ ...form, badges: [...form.badges, badge] });
    }
  };

  const handleAddCustomBadge = (e) => {
    e.preventDefault();
    if (newBadge.trim() && !form.badges.includes(newBadge.trim())) {
      setForm({ ...form, badges: [...form.badges, newBadge.trim()] });
      setNewBadge('');
    }
  };

  const handleToggleService = (service) => {
    if (form.services.includes(service)) {
      setForm({ ...form, services: form.services.filter(s => s !== service) });
    } else {
      setForm({ ...form, services: [...form.services, service] });
    }
  };

  const handleAddCustomService = (e) => {
    e.preventDefault();
    if (newService.trim() && !form.services.includes(newService.trim())) {
      setForm({ ...form, services: [...form.services, newService.trim()] });
      setNewService('');
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedMsg('');
    setErrorMsg('');

    try {
      const payload = {
        id: form.id,
        name: form.name,
        phone: form.phone,
        email: form.email,
        website_url: form.website_url,
        address: form.address,
        rating: form.rating,
        review_count: form.review_count,
        rank_order: form.rank_order,
        is_verified: form.is_verified,
        is_featured: form.is_featured,
        established_year: form.established_year,
        fleet_size: form.fleet_size,
        about_text: form.about_text,
        badges: form.badges,
        services_offered: form.services,
        pricing_table: form.pricing
      };

      const res = await fetch('/api/admin/movers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg('Profile updated successfully! All changes are live on the directory.');
        setTimeout(() => setSavedMsg(''), 4000);
      } else {
        setErrorMsg(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg('Network error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/movers"
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-750 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{form.name}</h1>
              <span className="text-[11px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                {mover.city_name}, {mover.state_name}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Admin is God • Full Control over Company Profile, Rate Cards, & Badges
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href={`/mover/${mover.slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Live Profile</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-xl bg-emerald-900/40 border border-emerald-600/80 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-900/40 border border-rose-700 text-rose-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: Form Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Company Identity */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <Truck className="w-4 h-4 text-amber-400" />
            <span>1. Basic Company Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Direct Calling Phone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Official Website URL</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://www.company.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Physical Street Address & Hub</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Plot No. 45, Transport Nagar, Main Highway Bypass"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Ranking, Track Record & Visibility */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <Star className="w-4 h-4 text-amber-400" />
            <span>2. Rankings, Star Rating & Track Record</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Rank Position</label>
              <input
                type="number"
                min="1"
                value={form.rank_order}
                onChange={(e) => setForm({ ...form, rank_order: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">1 is top of page</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Star Rating (1-5)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">e.g. 4.8</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Review Count</label>
              <input
                type="number"
                min="0"
                value={form.review_count}
                onChange={(e) => setForm({ ...form, review_count: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total verified reviews</span>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Established Year</label>
              <input
                type="text"
                value={form.established_year}
                onChange={(e) => setForm({ ...form, established_year: e.target.value })}
                placeholder="e.g. 1987 or 2012"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-center focus:border-amber-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Year founded</span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-slate-400 font-semibold mb-1">Fleet Strength / Truck Capacity</label>
              <input
                type="text"
                value={form.fleet_size}
                onChange={(e) => setForm({ ...form, fleet_size: e.target.value })}
                placeholder="e.g. 45+ Container Trucks or 15 Commercial Vehicles"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-6 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_verified}
                  onChange={(e) => setForm({ ...form, is_verified: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs font-bold text-white">Verified Mover Badge</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span className="text-xs font-bold text-white">Featured Listing</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Trust Badges Manager */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <Award className="w-4 h-4 text-amber-400" />
            <span>3. Trust & Certification Badges</span>
          </h2>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableBadges.map((badge) => {
                const isSelected = form.badges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => handleToggleBadge(badge)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{badge}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Badges active */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {form.badges
                .filter(b => !availableBadges.includes(b))
                .map((cb) => (
                  <span key={cb} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-900/60 border border-purple-700 text-purple-200 text-xs font-bold">
                    <span>{cb}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleBadge(cb)}
                      className="hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
            </div>

            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="Add custom badge (e.g. ISO 9001)"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomBadge}
                className="px-3 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold hover:bg-slate-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: Itemized Pricing Rate Card */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>4. Verified Shifting Rate Card (Pricing Matrix)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">1 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['1bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '1bhk': e.target.value } })}
                placeholder="₹3,500 - ₹6,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">2 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['2bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '2bhk': e.target.value } })}
                placeholder="₹5,500 - ₹9,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">3 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['3bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '3bhk': e.target.value } })}
                placeholder="₹8,500 - ₹14,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">4 BHK / Villa Rates</label>
              <input
                type="text"
                value={form.pricing['4bhk_villa'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '4bhk_villa': e.target.value } })}
                placeholder="₹12,500 - ₹22,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Vehicle / Car Transport</label>
              <input
                type="text"
                value={form.pricing['vehicle'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, 'vehicle': e.target.value } })}
                placeholder="₹4,500 - ₹9,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Office & Commercial Shifting</label>
              <input
                type="text"
                value={form.pricing['office'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, 'office': e.target.value } })}
                placeholder="Custom Inspection Quote"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 5: Services Offered Catalog */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>5. Services Offered Catalog</span>
          </h2>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {availableServices.map((service) => {
                const isSelected = form.services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleToggleService(service)}
                    className={`p-3 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-400/20 border border-amber-400 text-amber-200'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
                    }`}
                  >
                    <span>{service}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-amber-500 pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>

            {/* Custom Services */}
            <div className="flex items-center gap-2 pt-2 max-w-sm">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add custom service (e.g. Fine Art Moving)"
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs flex-1 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomService}
                className="px-3 py-2 rounded-xl bg-slate-700 text-white text-xs font-bold hover:bg-slate-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 6: Corporate Biography & About Us */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-700">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>6. About Company Description (Public SSR Profile)</span>
          </h2>

          <div>
            <textarea
              rows="5"
              value={form.about_text}
              onChange={(e) => setForm({ ...form, about_text: e.target.value })}
              placeholder="Describe company operations, container fleets, packing standards, tracking, and coverage..."
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs leading-relaxed focus:border-amber-500 focus:outline-none"
            ></textarea>
            <p className="text-[11px] text-slate-400 mt-1">
              This overview is rendered directly in the &ldquo;About Company&rdquo; section of the public profile page.
            </p>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            href="/admin/movers"
            className="px-6 py-3 rounded-xl border border-slate-700 text-slate-300 hover:text-white text-xs font-bold"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-bold text-xs text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all flex items-center gap-2 shadow-xl disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Publish Updates</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

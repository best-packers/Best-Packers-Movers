'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, ExternalLink, Save, CheckCircle2, ShieldCheck, 
  Award, Star, Truck, Calendar, DollarSign, FileText, Loader2, Plus, X, Lock, Unlock, Sparkles,
  Upload, Image as ImageIcon, Trash2, Tag, Eye
} from 'lucide-react';

export default function ProfileEditorUI({ mover }) {
  const isMaster = mover.id === 'np-master';
  const logoInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  // Parse existing JSON data safely
  const initialBadges = typeof mover.badges === 'string' ? JSON.parse(mover.badges || '[]') : (mover.badges || []);
  const initialServices = typeof mover.services_offered === 'string' ? JSON.parse(mover.services_offered || '[]') : (mover.services_offered || []);
  const initialPricing = typeof mover.pricing_table === 'string' ? JSON.parse(mover.pricing_table || '{}') : (mover.pricing_table || {});
  const initialGallery = typeof mover.gallery_images === 'string' ? JSON.parse(mover.gallery_images || '[]') : (mover.gallery_images || []);

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
    is_paid: !!mover.is_paid,
    established_year: mover.established_year || '',
    fleet_size: mover.fleet_size || '',
    about_text: mover.about_text || '',
    logo_url: mover.logo_url || '',
    gallery_images: Array.isArray(initialGallery) ? initialGallery : [],
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Fleet');
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

  const galleryCategories = [
    'Fleet',
    'Packaging',
    'Warehousing',
    'Certifications',
    'Specialized',
    'Office',
    'General'
  ];

  // LOGO UPLOAD HANDLER
  const handleLogoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success && data.url) {
        setForm(prev => ({ ...prev, logo_url: data.url }));
        setSavedMsg('Logo uploaded successfully!');
        setTimeout(() => setSavedMsg(''), 3000);
      } else {
        // Fallback: Read as base64 DataURL
        const reader = new FileReader();
        reader.onload = () => {
          setForm(prev => ({ ...prev, logo_url: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      // Fallback to DataURL
      const reader = new FileReader();
      reader.onload = () => {
        setForm(prev => ({ ...prev, logo_url: reader.result }));
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingLogo(false);
    }
  };

  // MULTI-PHOTO GALLERY UPLOAD HANDLER
  const handleGalleryFilesUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingGallery(true);
    setErrorMsg('');
    try {
      const newItems = [];
      for (const file of files) {
        try {
          const formData = new FormData();
          formData.append('file', file);
          const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
          });
          const data = await res.json();
          if (data.success && data.url) {
            newItems.push({
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              url: data.url,
              caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              category: newPhotoCategory
            });
          } else {
            // Read as DataURL fallback
            const dataUrl = await new Promise((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result);
              r.readAsDataURL(file);
            });
            newItems.push({
              id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              url: dataUrl,
              caption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
              category: newPhotoCategory
            });
          }
        } catch (_) {}
      }

      setForm(prev => ({
        ...prev,
        gallery_images: [...prev.gallery_images, ...newItems]
      }));
      setSavedMsg(`Added ${newItems.length} photos to gallery!`);
      setTimeout(() => setSavedMsg(''), 3000);
    } finally {
      setUploadingGallery(false);
    }
  };

  // ADD PHOTO BY URL
  const handleAddPhotoByUrl = (e) => {
    e.preventDefault();
    if (!newPhotoUrl.trim()) return;

    const newItem = {
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      url: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || 'Verified Infrastructure & Fleet',
      category: newPhotoCategory
    };

    setForm(prev => ({
      ...prev,
      gallery_images: [...prev.gallery_images, newItem]
    }));
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhoto = (id) => {
    setForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter(img => img.id !== id)
    }));
  };

  const handleUpdatePhotoCategory = (id, newCat) => {
    setForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.map(img => img.id === id ? { ...img, category: newCat } : img)
    }));
  };

  const handleUpdatePhotoCaption = (id, newCap) => {
    setForm(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.map(img => img.id === id ? { ...img, caption: newCap } : img)
    }));
  };

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
        is_paid: form.is_paid,
        established_year: form.established_year,
        fleet_size: form.fleet_size,
        about_text: form.about_text,
        logo_url: form.logo_url,
        gallery_images: form.gallery_images,
        badges: form.badges,
        services_offered: form.services,
        pricing_table: form.pricing
      };

      if (isMaster) {
        await fetch('/api/admin/master-profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            phone: form.phone,
            email: form.email,
            website_url: form.website_url,
            address_template: form.address,
            rating: form.rating,
            review_count: form.review_count,
            established_year: form.established_year,
            fleet_size: form.fleet_size,
            about_template: form.about_text,
            logo_url: form.logo_url,
            gallery_images: form.gallery_images,
            badges: form.badges,
            services_offered: form.services,
            pricing_table: form.pricing
          })
        });
      }

      const res = await fetch('/api/admin/movers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedMsg(
          isMaster 
            ? 'Master National Packers & Movers Profile updated! Propagated across all 7,606+ city and state pages.' 
            : 'Profile updated successfully! All changes, logos, and gallery photos are live.'
        );
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
      {/* ⭐ Central Master Profile Alert Banner */}
      {isMaster && (
        <div className="p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-amber-500/25 via-[#162236] to-[#162236] border-2 border-[#F7B731] shadow-2xl relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#F7B731] text-[#080C12] shadow-lg flex-shrink-0">
              <Sparkles className="w-6 h-6 fill-current" />
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B731] text-[#080C12] text-[10px] font-black uppercase tracking-wider">
                Permanent Slot #1 Global Singleton
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Central Master National Packers &amp; Movers Profile
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                You are editing the <strong>Master Singleton</strong> for National Packers &amp; Movers. Any modification to the logo, gallery photos, phone number, pricing matrix, or certifications will <strong>dynamically update Slot #1 across every single city and state directory page</strong> on the entire platform.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-[#F7B731] font-mono">
                <span className="bg-black/40 px-2.5 py-1 rounded-md border border-[#F7B731]/30">Dynamic Variables:</span>
                <span className="bg-black/40 px-2 py-1 rounded-md border border-white/10 text-white">&#123;cityName&#125; &rarr; Target City</span>
                <span className="bg-black/40 px-2 py-1 rounded-md border border-white/10 text-white">&#123;stateName&#125; &rarr; Target State</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl sm:rounded-3xl bg-[#162236] border border-white/5 shadow-xl">
        <div className="flex items-center gap-3.5 min-w-0">
          <Link
            href="/admin/movers"
            className="p-2.5 rounded-xl bg-[#080C12] border border-white/10 text-[#A8B2C1] hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate">
                {isMaster ? 'National Packers & Movers (Central Master)' : form.name}
              </h1>
              {form.is_verified && (
                <span className="badge-verified text-[10px] hidden sm:inline-flex">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Verified</span>
                </span>
              )}
            </div>
            <p className="text-xs text-[#A8B2C1] truncate">
              {isMaster ? 'Global Platform Singleton' : `${mover.city_name || ''} • ${mover.state_name || ''}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          {!isMaster && mover.slug && (
            <Link
              href={`/mover/${mover.slug}`}
              target="_blank"
              className="px-4 py-2.5 rounded-xl border border-white/10 hover:border-[#F7B731]/40 text-xs font-bold text-[#F7B731] hover:bg-[#F7B731] hover:text-[#080C12] transition-all flex items-center gap-1.5"
            >
              <span>View Public Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-black text-xs text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center gap-2 shadow-[0_4px_16px_rgba(247,183,49,0.3)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{savedMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-[#C1121F]/20 border border-[#C1121F]/40 text-[#FF6B6B] text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-lg">
          <X className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Grid: Form Sections */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Logo & Visual Identity */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#F7B731]" />
              <span>1. Corporate Logo &amp; Identity</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-[#080C12] border border-white/10">
            {/* Logo Preview Square */}
            <div className="w-24 h-24 rounded-2xl bg-[#162236] border-2 border-white/15 overflow-hidden flex items-center justify-center relative group flex-shrink-0 shadow-inner">
              {form.logo_url ? (
                <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-2xl font-black text-[#F7B731]">
                  {form.name?.substring(0, 2).toUpperCase() || 'LOGO'}
                </span>
              )}
            </div>

            {/* Logo Controls */}
            <div className="flex-1 space-y-3 w-full">
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={uploadingLogo}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#080C12] bg-[#F7B731] hover:bg-[#FFD166] transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {uploadingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>Upload Logo Image</span>
                </button>

                {form.logo_url && (
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, logo_url: '' }))}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-[#FF6B6B] hover:bg-white/5 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] text-[#A8B2C1] font-bold mb-1">
                  Or Paste External Logo Image URL:
                </label>
                <input
                  type="text"
                  value={form.logo_url}
                  onChange={(e) => setForm(prev => ({ ...prev, logo_url: e.target.value }))}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3 py-1.5 rounded-xl bg-[#162236] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F7B731]"
                />
              </div>
            </div>
          </div>

          {/* Contact & Location Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
              />
              {isMaster && (
                <p className="text-[10px] text-[#F7B731] mt-1">Hint: Can use &#123;cityName&#125; for automatic city dynamic replacement.</p>
              )}
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Direct Phone Number *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Email Address</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="dispatch@thenationalpackersmovers.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Official Website URL</label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => setForm({ ...form, website_url: e.target.value })}
                placeholder="https://www.thenationalpackersmovers.com/"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Physical Street Address &amp; Terminal</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Plot No. 45, Transport Nagar, Main Highway Bypass"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
              />
              {isMaster && (
                <p className="text-[10px] text-[#F7B731] mt-1">Hint: Can use &#123;cityName&#125; and &#123;stateName&#125; placeholders.</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Verified Photo Gallery Manager */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-3 border-[#F7B731] pl-3">
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#F7B731]" />
                <span>2. Infrastructure &amp; Fleet Photo Gallery</span>
                <span className="text-xs bg-[#F7B731]/15 text-[#F7B731] px-2 py-0.5 rounded-full font-bold">
                  {form.gallery_images.length} Photos
                </span>
              </h2>
              <p className="text-xs text-[#A8B2C1] mt-0.5">
                Upload containerized fleet photos, packaging material demonstrations, transit warehouses, and IBA certificates.
              </p>
            </div>

            {/* Upload Action */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                multiple
                ref={galleryInputRef}
                onChange={handleGalleryFilesUpload}
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-[#080C12] bg-[#F7B731] hover:bg-[#FFD166] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {uploadingGallery ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>Upload Photos from Device</span>
              </button>
            </div>
          </div>

          {/* Quick URL Adder */}
          <div className="p-3.5 rounded-2xl bg-[#080C12] border border-white/10 space-y-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#F7B731]" />
              <span>Or Add Photo by Web URL:</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="sm:col-span-2">
                <input
                  type="url"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3 py-2 rounded-xl bg-[#162236] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#F7B731]"
                />
              </div>

              <div>
                <input
                  type="text"
                  value={newPhotoCaption}
                  onChange={(e) => setNewPhotoCaption(e.target.value)}
                  placeholder="Caption (e.g. Covered Container Truck)"
                  className="w-full px-3 py-2 rounded-xl bg-[#162236] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#F7B731]"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={newPhotoCategory}
                  onChange={(e) => setNewPhotoCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#162236] border border-white/10 text-white focus:outline-none focus:border-[#F7B731]"
                >
                  {galleryCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-[#162236] text-white">{cat}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddPhotoByUrl}
                  className="px-3 py-2 rounded-xl bg-[#F7B731] text-[#080C12] font-black text-xs hover:bg-[#FFD166] transition-colors flex-shrink-0"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          {form.gallery_images.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {form.gallery_images.map((img) => (
                <div 
                  key={img.id}
                  className="p-3 rounded-2xl bg-[#080C12] border border-white/10 space-y-2.5 relative group hover:border-[#F7B731]/40 transition-all shadow-md"
                >
                  <div className="h-36 rounded-xl bg-[#162236] overflow-hidden relative border border-white/5">
                    <img 
                      src={img.url} 
                      alt={img.caption || 'Gallery photo'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-black text-[#F7B731] uppercase tracking-wider border border-white/10">
                      {img.category || 'General'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(img.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#C1121F]/80 hover:bg-[#C1121F] text-white transition-colors"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <input
                      type="text"
                      value={img.caption || ''}
                      onChange={(e) => handleUpdatePhotoCaption(img.id, e.target.value)}
                      placeholder="Caption..."
                      className="w-full px-2.5 py-1.5 rounded-lg bg-[#162236] border border-white/10 text-white text-[11px] focus:outline-none focus:border-[#F7B731]"
                    />

                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={img.category || 'General'}
                        onChange={(e) => handleUpdatePhotoCategory(img.id, e.target.value)}
                        className="px-2 py-1 rounded-lg bg-[#162236] border border-white/10 text-[10px] font-bold text-[#A8B2C1] focus:outline-none focus:border-[#F7B731]"
                      >
                        {galleryCategories.map(cat => (
                          <option key={cat} value={cat} className="bg-[#162236] text-white">{cat}</option>
                        ))}
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {img.id.slice(-6)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400 border-2 border-dashed border-white/10 rounded-2xl">
              No gallery photos uploaded yet. Upload fleet, warehouse, and packaging pictures to build trust!
            </div>
          )}
        </div>

        {/* Section 3: Ranking, Star Rating & Phone Unlock Switch */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-300" />
              <span>3. Ranking, Star Rating &amp; Lead Interception Gate</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Rank Position</label>
              <input
                type="number"
                disabled={isMaster}
                value={form.rank_order}
                onChange={(e) => setForm({ ...form, rank_order: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono font-bold focus:border-[#F7B731] focus:outline-none disabled:opacity-60"
              />
              {isMaster && (
                <span className="text-[10px] text-[#F7B731] font-bold mt-1 block">Slot #1 Permanent</span>
              )}
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Customer Rating (★)</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono font-bold focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Verified Review Count</label>
              <input
                type="number"
                value={form.review_count}
                onChange={(e) => setForm({ ...form, review_count: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Fleet Capacity</label>
              <input
                type="text"
                value={form.fleet_size}
                onChange={(e) => setForm({ ...form, fleet_size: e.target.value })}
                placeholder="45+ Container Trucks"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Established Year</label>
              <input
                type="text"
                value={form.established_year}
                onChange={(e) => setForm({ ...form, established_year: e.target.value })}
                placeholder="1987"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div className="flex flex-col justify-end">
              <label className="block text-[#A8B2C1] font-bold uppercase mb-2">Phone Masking Status</label>
              {isMaster ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Always Unlocked</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_paid: !form.is_paid })}
                  className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    form.is_paid
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : 'bg-[#F7B731]/15 text-[#F7B731] border border-[#F7B731]/40'
                  }`}
                >
                  {form.is_paid ? (
                    <>
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unlocked (Paid)</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked (Lead Gate)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Section 4: Trust & Certification Badges */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-[#F7B731]" />
              <span>4. Trust &amp; Certification Badges</span>
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {availableBadges.map((badge) => {
                const isSelected = form.badges.includes(badge);
                return (
                  <button
                    key={badge}
                    type="button"
                    onClick={() => handleToggleBadge(badge)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#F7B731] text-[#080C12] shadow-sm'
                        : 'bg-[#080C12] text-[#A8B2C1] border border-white/10 hover:text-white'
                    }`}
                  >
                    <span>{badge}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 max-w-sm">
              <input
                type="text"
                value={newBadge}
                onChange={(e) => setNewBadge(e.target.value)}
                placeholder="Add custom badge (e.g. ISO 9001:2015)"
                className="px-3.5 py-2 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs flex-1 focus:outline-none focus:border-[#F7B731]"
              />
              <button
                type="button"
                onClick={handleAddCustomBadge}
                className="px-3.5 py-2 rounded-xl bg-[#F7B731] text-[#080C12] font-black text-xs hover:bg-[#FFD166] transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 5: Itemized Pricing Rate Card */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>5. Verified Shifting Rate Card (Pricing Matrix)</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">1 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['1bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '1bhk': e.target.value } })}
                placeholder="₹3,500 - ₹6,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">2 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['2bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '2bhk': e.target.value } })}
                placeholder="₹5,500 - ₹9,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">3 BHK Shifting Rates</label>
              <input
                type="text"
                value={form.pricing['3bhk'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '3bhk': e.target.value } })}
                placeholder="₹8,500 - ₹14,500"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">4 BHK / Villa Rates</label>
              <input
                type="text"
                value={form.pricing['4bhk_villa'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, '4bhk_villa': e.target.value } })}
                placeholder="₹12,500 - ₹22,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Vehicle / Car Transport</label>
              <input
                type="text"
                value={form.pricing['vehicle'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, 'vehicle': e.target.value } })}
                placeholder="₹4,500 - ₹9,000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#A8B2C1] font-bold uppercase mb-1">Office &amp; Commercial</label>
              <input
                type="text"
                value={form.pricing['office'] || ''}
                onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, 'office': e.target.value } })}
                placeholder="Custom Inspection Quote"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080C12] border border-white/10 text-white font-mono focus:border-[#F7B731] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Section 6: Services Catalog */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>6. Services Offered Catalog</span>
            </h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {availableServices.map((service) => {
                const isSelected = form.services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => handleToggleService(service)}
                    className={`p-3 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-[#F7B731]/15 border border-[#F7B731] text-[#F7B731]'
                        : 'bg-[#080C12] text-[#A8B2C1] border border-white/10 hover:text-white'
                    }`}
                  >
                    <span>{service}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-[#F7B731] pointer-events-none"
                    />
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 pt-2 max-w-sm">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add custom service (e.g. Fine Art Moving)"
                className="px-3.5 py-2 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs flex-1 focus:outline-none focus:border-[#F7B731]"
              />
              <button
                type="button"
                onClick={handleAddCustomService}
                className="px-3.5 py-2 rounded-xl bg-[#F7B731] text-[#080C12] font-black text-xs hover:bg-[#FFD166] transition-colors"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        </div>

        {/* Section 7: Corporate Biography */}
        <div className="bg-[#162236] rounded-2xl sm:rounded-3xl border border-white/5 p-6 sm:p-7 space-y-4 shadow-xl">
          <div className="border-l-3 border-[#F7B731] pl-3">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#F7B731]" />
              <span>7. About Company Description (Public SSR Profile)</span>
            </h2>
          </div>

          <div>
            <textarea
              rows="5"
              value={form.about_text}
              onChange={(e) => setForm({ ...form, about_text: e.target.value })}
              placeholder="Describe company operations, container fleets, packing standards, tracking, and coverage..."
              className="w-full px-4 py-3 rounded-xl bg-[#080C12] border border-white/10 text-white text-xs leading-relaxed focus:border-[#F7B731] focus:outline-none"
            ></textarea>
            {isMaster ? (
              <p className="text-[11px] text-[#F7B731] mt-1.5 font-medium">
                Master Template Note: Use &#123;cityName&#125; and &#123;stateName&#125; in the text. They will automatically be replaced with the respective city and state on all 7,606+ city landing pages.
              </p>
            ) : (
              <p className="text-[11px] text-[#A8B2C1] mt-1.5">
                Rendered on the public SSR profile page. High keyword density improves search rank.
              </p>
            )}
          </div>
        </div>

        {/* Bottom Publish Bar */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Link
            href="/admin/movers"
            className="px-6 py-3 rounded-xl border border-white/10 text-[#A8B2C1] hover:text-white text-xs font-bold transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-xl font-black text-xs text-[#080C12] bg-gradient-to-r from-[#F7B731] via-[#FFD166] to-[#F7B731] hover:brightness-105 transition-all flex items-center gap-2 shadow-[0_4px_20px_rgba(247,183,49,0.35)] disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin stroke-[2.5]" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Publish Updates</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}

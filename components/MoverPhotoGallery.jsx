'use client';

import { useState } from 'react';
import { Image as ImageIcon, Sparkles, Award, ShieldCheck, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export default function MoverPhotoGallery({ mover, isNational = false }) {
  // Parse gallery images
  let images = [];
  try {
    const parsed = typeof mover.gallery_images === 'string' ? JSON.parse(mover.gallery_images || '[]') : (mover.gallery_images || []);
    images = Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    images = [];
  }

  // Fallback defaults for National Packers if empty
  if (isNational && images.length === 0) {
    images = [
      {
        id: 'g-np-default-1',
        url: 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?auto=format&fit=crop&w=1000&q=80',
        caption: 'Company-Owned GPS Monitored Container Fleets',
        category: 'Fleet'
      },
      {
        id: 'g-np-default-2',
        url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
        caption: '4-Layer Waterproof Heavy Bubble Cushioning & Edge Protection',
        category: 'Packaging'
      },
      {
        id: 'g-np-default-3',
        url: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1000&q=80',
        caption: 'Secure CCTV Monitored Transit Storage & Warehousing Facilities',
        category: 'Warehousing'
      },
      {
        id: 'g-np-default-4',
        url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=80',
        caption: 'Specialized Hydraulic Crane Rigging & Heavy Balcony Lifting',
        category: 'Specialized'
      },
      {
        id: 'g-np-default-5',
        url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=80',
        caption: 'Official IBA Approval & ISO 9001:2015 Audit Certification',
        category: 'Certifications'
      }
    ];
  }

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Extract categories
  const categories = ['ALL', ...Array.from(new Set(images.map(img => img.category || 'General').filter(Boolean)))];

  const filteredImages = activeCategory === 'ALL'
    ? images
    : images.filter(img => (img.category || 'General').toLowerCase() === activeCategory.toLowerCase());

  if (images.length === 0) return null;

  return (
    <section className={`rounded-3xl p-6 sm:p-8 border shadow-sm transition-all ${
      isNational
        ? 'bg-gradient-to-br from-[#0B111A] via-[#162236] to-[#0B111A] border-[#F7B731]/40 text-white shadow-2xl relative overflow-hidden'
        : 'bg-white border-slate-200/90 text-slate-900'
    }`}>
      {/* Background Glow for National Packers */}
      {isNational && (
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#F7B731]/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            {isNational ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#F7B731] text-[#080C12] text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Audited Infrastructure Showcase</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Verified Facilities</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
            {isNational ? 'Fleet, Warehouses & Packaging Excellence' : `${mover.name} Photo Gallery`}
          </h2>
          <p className={`text-xs mt-0.5 ${isNational ? 'text-slate-300' : 'text-slate-500'}`}>
            Inspected and verified physical assets, container fleets, and material standards.
          </p>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 2 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {categories.map((cat) => {
              const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    isSelected
                      ? (isNational ? 'bg-[#F7B731] text-[#080C12] shadow-sm' : 'bg-slate-900 text-white')
                      : (isNational ? 'bg-white/5 text-slate-300 hover:text-white border border-white/10' : 'bg-slate-100 text-slate-600 hover:text-slate-900')
                  }`}
                >
                  {cat === 'ALL' ? `All (${images.length})` : cat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Gallery Photo Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-5 relative z-10">
        {filteredImages.map((img, idx) => (
          <div
            key={img.id || idx}
            onClick={() => setLightboxIndex(idx)}
            className={`group rounded-2xl overflow-hidden cursor-pointer border relative transition-all duration-300 hover:-translate-y-1 ${
              isNational
                ? 'bg-[#080C12] border-white/10 hover:border-[#F7B731]/60 hover:shadow-xl hover:shadow-[#F7B731]/15'
                : 'bg-slate-50 border-slate-200 hover:border-slate-400 hover:shadow-md'
            }`}
          >
            {/* Image Thumbnail Container */}
            <div className="h-48 sm:h-52 w-full overflow-hidden relative">
              <img
                src={img.url}
                alt={img.caption || `${mover.name} verification photo`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Category Pill */}
              <span className={`absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                isNational
                  ? 'bg-black/80 text-[#F7B731] border border-[#F7B731]/30'
                  : 'bg-white/90 text-slate-800 border border-slate-200'
              }`}>
                {img.category || 'Verified'}
              </span>

              {/* Zoom Hover Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <div className="p-3 rounded-full bg-black/60 backdrop-blur-md">
                  <ZoomIn className="w-5 h-5 text-[#F7B731]" />
                </div>
              </div>

              {/* National Verified Badge Overlay */}
              {isNational && (
                <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-[#F7B731] text-[#080C12] text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Award className="w-3 h-3 fill-current" />
                  <span>IBA Inspected</span>
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="p-3.5">
              <p className={`text-xs font-bold line-clamp-2 ${
                isNational ? 'text-white' : 'text-slate-800'
              }`}>
                {img.caption || `${mover.name} logistics operations and verified equipment`}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fadeIn"
          onClick={() => setLightboxIndex(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-[#080C12] rounded-3xl border border-white/10 overflow-hidden p-3 sm:p-5 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar in Modal */}
            <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-[#F7B731] uppercase tracking-wider">
                  {filteredImages[lightboxIndex]?.category || 'Gallery'}
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-xs text-slate-400">
                  Photo {lightboxIndex + 1} of {filteredImages.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Full-Size Image Container */}
            <div className="h-[60vh] sm:h-[70vh] w-full flex items-center justify-center bg-black/60 rounded-2xl overflow-hidden relative">
              <img
                src={filteredImages[lightboxIndex]?.url}
                alt={filteredImages[lightboxIndex]?.caption || 'Full view'}
                className="max-h-full max-w-full object-contain"
              />

              {/* Prev / Next Buttons */}
              {filteredImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex - 1 + filteredImages.length) % filteredImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightboxIndex((lightboxIndex + 1) % filteredImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/10 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Caption */}
            <div className="pt-1 flex items-center justify-between text-white text-xs">
              <p className="font-semibold text-slate-200">
                {filteredImages[lightboxIndex]?.caption || mover.name}
              </p>
              {isNational && (
                <span className="text-[10px] text-[#F7B731] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>IBA &amp; ISO Quality Standard</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

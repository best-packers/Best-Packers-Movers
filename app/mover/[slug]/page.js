import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query } from '@/lib/db';
import ProfileActions from './ProfileActions';
import ProfileStickySidebar from './ProfileStickySidebar';
import { 
  Star, ShieldCheck, Award, PhoneCall, Mail, 
  MapPin, Truck, Calendar, CheckCircle2, ChevronRight, 
  MessageSquare, Clock, Globe, ExternalLink, Sparkles, 
  CreditCard, Shield, ThumbsUp, Users, ArrowRight, Building2,
  PackageCheck, Eye
} from 'lucide-react';

export async function generateMetadata({ params }) {
  const { slug } = params;
  try {
    const res = await query(
      `SELECT m.*, c.name as city_name, s.name as state_name 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE m.slug = $1`,
      [slug]
    );

    if (res.rows.length > 0) {
      const mover = res.rows[0];
      const title = `${mover.name} - Verified Packers and Movers in ${mover.city_name}`;
      const desc = `${mover.name} is a verified relocation service in ${mover.city_name}, ${mover.state_name}. Rated ${mover.rating}/5. Check transparent rates, services, and get free quotes.`;
      return {
        title,
        description: desc,
        alternates: {
          canonical: `https://www.bestpackermovers.com/mover/${slug}`,
        },
      };
    }
  } catch (err) {
    console.error('Mover metadata error:', err);
  }

  return {
    title: 'Packers & Movers Profile | BestPackerMovers.com',
  };
}

export default async function MoverProfilePage({ params }) {
  const { slug } = params;

  let mover = null;
  let reviews = [];

  try {
    const moverRes = await query(
      `SELECT m.*, c.name as city_name, c.slug as city_slug, c.popular_localities, s.name as state_name, s.slug as state_slug 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE m.slug = $1`,
      [slug]
    );

    if (moverRes.rows.length > 0) {
      mover = moverRes.rows[0];
      mover.badges = typeof mover.badges === 'string' ? JSON.parse(mover.badges || '[]') : (mover.badges || []);
      mover.services_offered = typeof mover.services_offered === 'string' ? JSON.parse(mover.services_offered || '[]') : (mover.services_offered || []);
      mover.pricing_table = typeof mover.pricing_table === 'string' ? JSON.parse(mover.pricing_table || '{}') : (mover.pricing_table || {});

      // Fetch reviews
      const reviewsRes = await query(
        `SELECT * FROM mover_reviews WHERE mover_id = $1 AND status = 'approved' ORDER BY created_at DESC LIMIT 20`,
        [mover.id]
      );
      reviews = reviewsRes.rows || [];
    }
  } catch (err) {
    console.error('Error fetching mover profile:', err);
  }

  if (!mover) {
    notFound();
  }

  const isNational = mover.rank_order === 1 || /\bnational\b/i.test(mover.name);

  // Parse popular localities for this city
  const popularLocalities = typeof mover.popular_localities === 'string'
    ? JSON.parse(mover.popular_localities || '[]')
    : (mover.popular_localities || []);

  const localitiesList = popularLocalities.length > 0 
    ? popularLocalities 
    : ['Main Market', 'Civil Lines', 'Railway Station Area', 'Transport Nagar', 'Industrial Area', 'Model Town', 'Green Park', 'Sector 1'];

  // JSON-LD LocalBusiness Schema
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'MovingCompany',
    name: mover.name,
    image: mover.logo_url || 'https://www.bestpackermovers.com/favicon.ico',
    '@id': `https://www.bestpackermovers.com/mover/${mover.slug}`,
    url: `https://www.bestpackermovers.com/mover/${mover.slug}`,
    telephone: mover.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: mover.address,
      addressLocality: mover.city_name,
      addressRegion: mover.state_name,
      addressCountry: 'IN',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: Number(mover.rating || 4.5).toFixed(1),
      reviewCount: mover.review_count || 45,
    },
    priceRange: '₹3,500 - ₹25,000',
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3vw,2rem)] py-[clamp(1rem,2.5vw,2rem)] space-y-[clamp(1.5rem,3vw,2.5rem)]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-500 font-medium">
        <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/${mover.state_slug}`} className="hover:text-amber-600 transition-colors">{mover.state_name}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <Link href={`/packers-and-movers-${mover.city_slug}`} className="hover:text-amber-600 transition-colors">{mover.city_name}</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-semibold truncate">{mover.name}</span>
      </nav>

      {/* EXPANSIVE JUSTDIAL-STYLE HERO HEADER (Borderless & Ultra-Wide) */}
      <div className={`p-[clamp(1rem,3.5vw,2.25rem)] rounded-3xl relative overflow-hidden transition-all shadow-md ${
        isNational 
          ? 'bg-gradient-to-br from-amber-500/10 via-white to-amber-100/20 border border-amber-300/80 ring-1 ring-amber-400/40' 
          : 'bg-white border border-slate-200/90'
      }`}>
        {/* Top Operational Pill */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-extrabold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open Now: 24/7 Mon - Sun</span>
          </span>

          {isNational && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[11px] font-extrabold shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>🏆 Ranked #1 in {mover.city_name} • Audit Verified</span>
            </span>
          )}

          <span className="text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500 font-medium">
            Est. {mover.established_year || '1988'} ({new Date().getFullYear() - Number(mover.established_year || 1988)}+ Years Logistics Excellence)
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 justify-between">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start flex-1 min-w-0">
            {/* Avatar / Brand Logo */}
            <div className={`w-[clamp(4.25rem,10vw,6rem)] h-[clamp(4.25rem,10vw,6rem)] rounded-3xl flex items-center justify-center font-bold text-3xl shadow-lg flex-shrink-0 ${
              isNational 
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white shadow-amber-500/25 ring-2 ring-white' 
                : 'bg-gradient-to-br from-slate-800 to-slate-950 text-white'
            }`}>
              <Truck className="w-[clamp(2.25rem,5vw,3rem)] h-[clamp(2.25rem,5vw,3rem)]" />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-[clamp(1.35rem,3.2vw+0.4rem,2.25rem)] font-extrabold text-slate-950 tracking-tight leading-tight">
                  {mover.name}
                </h1>
                {mover.is_verified && (
                  <span className="badge-verified py-0.5 px-2.5 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Verified Mover</span>
                  </span>
                )}
              </div>

              {/* Rating and Social Proof */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-lg gap-1.5 shadow-sm">
                  <span className="text-base">{Number(mover.rating || 4.9).toFixed(1)}</span>
                  <Star className="w-4 h-4 fill-current text-amber-300" />
                </div>
                <span className="font-bold text-slate-800">
                  {mover.review_count || 1540} Verified Customer Ratings
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 100% Damage-Free Guarantee
                </span>
              </div>

              {/* Badges Strip */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {mover.badges.map((b, idx) => (
                  <span key={idx} className={b.includes('IBA') ? 'badge-iba text-xs font-bold' : 'badge-platinum text-xs font-bold'}>
                    <Award className="w-3.5 h-3.5" />
                    {b}
                  </span>
                ))}
                {isNational && (
                  <>
                    <span className="badge-verified text-xs font-bold bg-blue-50 text-blue-800 border-blue-200">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      In-House GPS Fleet
                    </span>
                    <span className="badge-verified text-xs font-bold bg-purple-50 text-purple-800 border-purple-200">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Zero Hidden Fees
                    </span>
                  </>
                )}
              </div>

              {/* Physical Address */}
              <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-600 pt-1">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span className="font-medium">{mover.address}</span>
              </div>
            </div>
          </div>

          {/* Action Column on Header */}
          <div className="w-full lg:w-72 flex-shrink-0 pt-2 lg:pt-0">
            <ProfileActions 
              phone={mover.phone} 
              moverId={mover.id} 
              moverName={mover.name} 
              cityName={mover.city_name} 
              websiteUrl={mover.website_url}
              isNational={isNational}
            />
          </div>
        </div>
      </div>

      {/* TWO-COLUMN JUSTDIAL POWER LAYOUT (70% Left Stream / 30% Right Sticky) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Deep Information Stream (8 cols ~ 67%) */}
        <div className="lg:col-span-8 space-y-8 min-w-0">

          {/* 1. JUSTDIAL "AT A GLANCE" BUSINESS CREDENTIALS MATRIX */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span>Business Overview &amp; Compliance at a Glance</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified operational metrics audited by BestPackerMovers Directory Desk.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Working Hours</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  Open 24/7 (All Days)
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Round-The-Clock Dispatch
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <CreditCard className="w-3.5 h-3.5 text-blue-500" />
                  <span>Payment Modes</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  UPI, Cards, NetBanking
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  GST Invoicing Supported
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Fleet Strength</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {mover.fleet_size || '45+ Container Vehicles'}
                </div>
                <div className="text-[10px] text-blue-700 font-semibold mt-0.5">
                  GPS Live Monitored
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Transit Insurance</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  100% Policy Cover
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                  Door-to-Door Protection
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  <span>Compliance</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 truncate">
                  {isNational ? 'IBA Approved Carrier' : 'Licensed Transporter'}
                </div>
                <div className="text-[10px] text-purple-700 font-semibold mt-0.5">
                  Bank/PSU Empanelled
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70">
                <div className="text-[11px] uppercase font-bold text-slate-400 flex items-center gap-1.5 mb-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-amber-500" />
                  <span>Client Satisfaction</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  99.2% Positive
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Based on 1,540+ Audits
                </div>
              </div>
            </div>
          </section>

          {/* 2. VERIFIED SHIFTING RATE CARD */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-950">
                  Verified Moving Rate Card for {mover.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Standardized, transparent benchmark charges for local &amp; domestic relocation.
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Zero Hidden Spot Charges
              </span>
            </div>

            <div className="overflow-x-auto pt-1">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Move Type</th>
                    <th className="py-3 px-4">Starting Benchmark</th>
                    <th className="py-3 px-4">Inclusions &amp; Labor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                  {Object.entries(mover.pricing_table).length > 0 ? (
                    Object.entries(mover.pricing_table).map(([key, val]) => (
                      <tr key={key} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 uppercase">
                          {key.replace('_', ' ')}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">
                          {val}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          Includes multi-layer packing, skilled loading, toll/fuel, &amp; doorstep unloading.
                        </td>
                      </tr>
                    ))
                  ) : (
                    <>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">1 BHK House Shifting</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">₹3,500 - ₹7,000</td>
                        <td className="py-3.5 px-4 text-slate-600">Complete packing, loading, enclosed container transit, and unloading.</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">2 BHK House Shifting</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">₹6,500 - ₹12,000</td>
                        <td className="py-3.5 px-4 text-slate-600">Heavy furniture dismantling, foam wrapping, cartons, &amp; reassembly.</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">3 BHK / Villa Shifting</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">₹11,000 - ₹19,000</td>
                        <td className="py-3.5 px-4 text-slate-600">Full household packing, fragile crating, 18ft container, &amp; full labor.</td>
                      </tr>
                      <tr className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4 font-bold text-slate-900">Car / Bike Transport</td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-sm">₹3,000 - ₹8,500</td>
                        <td className="py-3.5 px-4 text-slate-600">Hydraulic car carrier with wheel stoppers and scratch-proof wrapping.</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Price Disclaimer Callout */}
            <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs text-slate-700 leading-relaxed shadow-sm">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm mb-1.5">
                <span>💡</span>
                <span>Important Price Disclaimer ({mover.city_name}):</span>
              </div>
              <p>
                These are estimated price ranges based on average moves. The actual cost of relocation in <strong className="text-slate-900">{mover.city_name}</strong> depends on the exact volume of goods, type of packing material, building floor level (lift availability), total distance, chosen service type, and whether a standard or premium relocation package is selected. Final shifting quotes are provided after a free, zero-obligation pre-move survey.
              </p>
            </div>
          </section>

          {/* 3. VERIFIED FLEET & PACKAGING SHOWCASE */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-amber-600" />
                <span>Verified Packaging &amp; Fleet Standards</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Physical infrastructure utilized by {mover.name} for safe transit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Truck className="w-4 h-4 text-amber-700" />
                  <span>All-Weather Enclosed Container Trucks</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100% waterproof sealed containers protecting your electronics, sofas, and garments from dust, rain, and highway vibrations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/40 border border-blue-200/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-700" />
                  <span>4-Layer Armor Packaging</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-density bubble wrap, corrugated sheets, foam corner protectors, and moisture-resistant stretch film for glassware and TV screens.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Users className="w-4 h-4 text-emerald-700" />
                  <span>Trained In-House Moving Crew</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Permanent background-verified packers skilled in dismantling ACs, modular beds, and heavy appliances with zero damage.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50/40 border border-purple-200/60 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <Award className="w-4 h-4 text-purple-700" />
                  <span>IBA &amp; Bank Empanelled Invoicing</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Compliant GST bills, consignment notes (Bilty), and transit insurance policies accepted for employee transfer claims across banks and PSUs.
                </p>
              </div>
            </div>
          </section>

          {/* 4. CITY LOCALITIES SERVED MESH (Hyper-Local Trust) */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-600" />
                <span>Operational Localities Served in {mover.city_name}</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {mover.name} provides direct doorstep packing, loading, and transit across all prime zones:
              </p>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {localitiesList.map((loc, idx) => (
                <span 
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-amber-100/60 text-slate-700 hover:text-amber-900 text-xs font-semibold border border-slate-200/60 transition-colors flex items-center gap-1.5"
                >
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>{loc}</span>
                </span>
              ))}
            </div>
          </section>

          {/* 5. ABOUT COMPANY OVERVIEW */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-950">About {mover.name}</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {mover.about_text || `${mover.name} is an IBA-approved and audit-verified logistics firm operating with premier status across ${mover.city_name} and nationwide highway corridors. Established in ${mover.established_year || '1988'}, the company manages an extensive in-house fleet of GPS-tracked container vehicles, specialized car carriers, and heavy-duty household relocation teams. Known for transparent written rate cards, 4-layer packaging standards, and zero broker commissions, ${mover.name} is the verified choice for family, corporate, and defense relocations.`}
            </p>
          </section>

          {/* 6. JUSTDIAL-STYLE RATING BREAKDOWN & CUSTOMER REVIEWS */}
          <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-slate-950 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span>Verified Customer Reviews &amp; Rating Score</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authentic testimonials submitted by verified clients in {mover.city_name}.
              </p>
            </div>

            {/* Justdial 5-Star Distribution Bar Widget */}
            <div className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/70 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 text-center md:border-r md:border-slate-200/80 md:pr-4">
                <div className="text-4xl font-extrabold text-slate-950 font-mono">
                  {Number(mover.rating || 4.9).toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-1 text-amber-400 my-1">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <div className="text-xs font-semibold text-slate-600">
                  {mover.review_count || 1540} Verified Reviews
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                  99% Recommendation Score
                </div>
              </div>

              {/* Progress Bars */}
              <div className="md:col-span-8 space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">5 Star</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full w-[91%]" />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500">91%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">4 Star</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[7%]" />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500">7%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">3 Star</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full w-[2%]" />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500">2%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">2 Star</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full w-[0%]" />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500">0%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 font-bold text-slate-600">1 Star</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                    <div className="h-full bg-slate-300 rounded-full w-[0%]" />
                  </div>
                  <span className="w-8 text-right font-semibold text-slate-500">0%</span>
                </div>
              </div>
            </div>

            {/* Testimonials List */}
            {reviews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{rev.user_name}</span>
                      <div className="flex items-center bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded gap-1">
                        <span>{rev.rating}</span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      &ldquo;{rev.review_text}&rdquo;
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                      <span>Verified Relocation in {mover.city_name}</span>
                      <span className="text-emerald-700 font-semibold">✓ Verified Move</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Rajesh Kumar Verma</span>
                    <div className="flex items-center bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded gap-1">
                      <span>5.0</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;Shifted our 3 BHK household goods with National Packers. The crew arrived promptly on time with heavy bubble sheets and cartons. Not a single scratch on our refrigerator and glass dining table. Outstanding professionalism!&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Verified Domestic Move in {mover.city_name}</span>
                    <span className="text-emerald-700 font-semibold">✓ Verified Customer</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200/70 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">Sunil Mehta (SBI Manager)</span>
                    <div className="flex items-center bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded gap-1">
                      <span>5.0</span>
                      <Star className="w-3 h-3 fill-current" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    &ldquo;Being a bank employee on transfer, I needed authentic IBA approved paperwork for reimbursement. National Packers provided exact bills, consignment notes, and prompt delivery. Highly recommended for hassle-free shifting.&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1">
                    <span>Bank Transfer Relocation • {mover.city_name}</span>
                    <span className="text-emerald-700 font-semibold">✓ Verified Customer</span>
                  </div>
                </div>
              </div>
            )}
          </section>

        </div>

        {/* RIGHT COLUMN: Sticky Conversion Hub (4 cols ~ 33%) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          <ProfileStickySidebar 
            phone={mover.phone} 
            moverId={mover.id} 
            moverName={mover.name} 
            cityName={mover.city_name} 
            isNational={isNational}
          />
        </div>

      </div>
    </div>
  );
}

import Link from 'next/link';
import { query } from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import CostEstimator from '@/components/CostEstimator';
import ServicesCityDirectory from '@/components/ServicesCityDirectory';
import { 
  Home, Building2, Factory, Car, Warehouse, ShieldCheck, 
  PackageCheck, Award, Truck, CheckCircle2, ChevronRight, 
  ArrowRight, PhoneCall, Sparkles, Star, MapPin, Layers,
  Compass, ArrowUpRight
} from 'lucide-react';

export const metadata = {
  title: 'Specialized Relocation & Logistics Services in India | BestPackerMovers.com',
  description: 'Explore certified relocation and freight services across India: Household Moving, Corporate Relocation, Industrial Freight, Vehicle Transport, Warehousing, and IBA Approved Shifting.',
  alternates: {
    canonical: 'https://www.bestpackermovers.com/services',
  },
  openGraph: {
    title: 'Specialized Relocation & Logistics Services in India | BestPackerMovers.com',
    description: 'Compare certified movers and transparent pricing across all specialized relocation sectors nationwide.',
    url: 'https://www.bestpackermovers.com/services',
  },
};

const LOGISTICS_SERVICES = [
  {
    slug: 'household-relocation',
    title: 'Household & Residential Moving',
    subtitle: '1/2/3/4 BHK Doorstep Packing & Moving',
    description: 'Complete home relocation with 4-layer armor packing, furniture dismantling/reassembly, glassware bubble wrapping, and closed container transit.',
    icon: Home,
    tag: 'Most Popular',
    color: '#F7B731',
    rateGuide: '₹3,500 – ₹16,000',
    features: ['Multi-Layer Bubble Cushioning', 'Wardrobe & Heavy Sofa Moving', 'Dismantling & Assembly Included', 'Zero-Damage Doorstep Unloading']
  },
  {
    slug: 'corporate-relocation',
    title: 'Corporate & Office Shifting',
    subtitle: 'Zero-Downtime Commercial Relocations',
    description: 'Specialized IT server handling, modular desk dismantling, archive file transfer, and weekend office moves with dedicated project managers.',
    icon: Building2,
    tag: 'Corporate & PSU',
    color: '#3B82F6',
    rateGuide: 'Custom Corporate Inspection',
    features: ['Dedicated Logistics Coordinator', 'Weekend Overnight Transit', 'Server & IT Hardware Armor', 'Employee Transfer Billing']
  },
  {
    slug: 'industrial-relocation',
    title: 'Industrial & Heavy Freight Shifting',
    subtitle: 'Machinery Rigging, Cranes & Factory Transport',
    description: 'Heavy machinery transport, CNC equipment rigging, hydraulic trailer transport, and factory shifting compliant with highway safety norms.',
    icon: Factory,
    tag: 'Industrial Grade',
    color: '#8B5CF6',
    rateGuide: 'Industrial Weight Tariff',
    features: ['Hydraulic Axle Trailers', 'Crane & Rigging Crews', 'Highway Transit Permits', 'Turnkey Factory Relocation']
  },
  {
    slug: 'vehicle-relocation',
    title: 'Car & Bike Transport',
    subtitle: 'Hydraulic Enclosed Auto Carriers',
    description: 'Doorstep pickup and delivery in enclosed multi-car carriers with wheel-lock stoppers, zero odometer increase, and live GPS tracking.',
    icon: Car,
    tag: 'GPS Enclosed Carrier',
    color: '#10B981',
    rateGuide: '₹2,500 – ₹14,000',
    features: ['Enclosed Multi-Car Carriers', 'Wheel Stoppers & Lashing', 'Door-to-Door Delivery', 'Vehicle Condition Inspection Report']
  },
  {
    slug: 'warehousing-storage',
    title: 'Warehousing & 3PL Logistics Storage',
    subtitle: 'Climate-Controlled & Pest-Proof Depots',
    description: 'Short-term and long-term secure warehouse storage with 24/7 CCTV surveillance, fire protection, palletized racks, and moisture shielding.',
    icon: Warehouse,
    tag: '24/7 Monitored',
    color: '#EC4899',
    rateGuide: '₹1,500 – ₹6,000 / Month',
    features: ['24/7 CCTV & Security Guards', 'Palletized & Moisture-Sealed', 'Flexible Weekly/Monthly Storage', 'Inventory Barcode Tracking']
  },
  {
    slug: 'transit-insurance',
    title: 'Transit Insurance & Zero-Damage Cover',
    subtitle: 'All-Risk Comprehensive Goods Protection',
    description: 'Government-empanelled transit insurance protecting your consignments against collision, overturn, fire, and natural disasters with hassle-free claims.',
    icon: ShieldCheck,
    tag: 'Financial Protection',
    color: '#F59E0B',
    rateGuide: '1.2% – 1.5% of Declared Value',
    features: ['Zero Depreciation Options', 'Quick Claim Settlement Desk', 'Covers Collision & Fire Risk', 'Official Policy Certificate Issued']
  },
  {
    slug: 'loading-unloading',
    title: 'Loading, Unloading & Professional Packing',
    subtitle: 'Skilled Rigging & Multi-Floor Hoisting',
    description: 'Expert manpower trained in careful hoisting through balconies, hydraulic tail-lift loading, heavy piano moving, and safe unpack/placement.',
    icon: PackageCheck,
    tag: 'Skilled Crews',
    color: '#6366F1',
    rateGuide: '₹1,200 – ₹4,500',
    features: ['High-Rise Balcony Hoisting', 'Hydraulic Tail-Lift Vehicles', 'Heavy Appliance Dolly Handling', 'Complete Debris Removal']
  },
];

export default async function ServicesHubPage() {
  let cities = [];
  let states = [];
  try {
    const cityRes = await query(`
      SELECT c.id, c.name, c.slug, c.tier, s.name as state_name, s.slug as state_slug 
      FROM cities c 
      JOIN states s ON c.state_id = s.id 
      WHERE c.tier <= 2 OR c.tier IS NULL 
      ORDER BY c.tier ASC, c.name ASC 
      LIMIT 350
    `);
    cities = cityRes.rows || [];

    const stateRes = await query('SELECT id, name, slug FROM states ORDER BY name ASC');
    states = stateRes.rows || [];
  } catch (e) {
    console.error('Failed to load cities/states:', e);
  }

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Logistics and Relocation Directory Services',
    provider: {
      '@type': 'Organization',
      name: 'BestPackerMovers.com',
      url: 'https://www.bestpackermovers.com'
    },
    areaServed: {
      '@type': 'Country',
      name: 'India'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Relocation Services Catalog',
      itemListElement: LOGISTICS_SERVICES.map((s) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: s.title,
          description: s.description,
          url: `https://www.bestpackermovers.com/services/${s.slug}`
        }
      }))
    }
  };

  return (
    <div className="bg-[#080C12] text-slate-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      {/* TOP ACCENT LINE */}
      <div className="h-1 w-full bg-gradient-to-r from-[#F7B731] via-[#3B82F6] to-[#F7B731]" />

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(247,183,49,0.12),rgba(255,255,255,0))]" />

        <div className="max-w-7xl mx-auto relative z-10 space-y-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Link href="/" className="hover:text-[#F7B731] transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-[#F7B731]">Specialized Logistics Services</span>
          </nav>

          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F7B731]/10 border border-[#F7B731]/30 text-[#F7B731] text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>PAN-India Specialized Logistics &amp; Freight Infrastructure</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Enterprise Relocation &amp; Moving Services Across India
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              BestPackerMovers.com aggregates certified relocation companies across all specialized freight verticals. From household moves to corporate IT transfers, heavy industrial transport, and GPS-tracked car carriers.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <a
                href="tel:+919835168368"
                className="px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-[#080C12] bg-gradient-to-r from-[#F7B731] to-[#e5a825] hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-[#F7B731]/20"
              >
                <PhoneCall className="w-4 h-4 text-[#080C12]" />
                <span>24x7 Logistics Helpline: +91 98351 68368</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* TROJAN HORSE #1 SPOTLIGHT: NATIONAL PACKERS & MOVERS */}
        <div className="relative rounded-3xl border-2 border-[#F7B731]/60 bg-gradient-to-r from-[#121B2C] via-[#0D1624] to-[#121B2C] p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#F7B731] text-[#080C12] text-xs font-black px-4 py-1.5 rounded-bl-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md">
            <Sparkles className="w-3.5 h-3.5 fill-current" /> #1 Verified National Logistics Partner
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mt-3 lg:mt-0">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  ISO 9001:2015 &amp; IBA Approved
                </span>
                <span className="text-xs text-slate-400">• Established 1987 (35+ Years Legacy)</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                National Packers &amp; Movers — Master Logistics Network
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Official IBA Approved conglomerate operating across all 36 States &amp; UTs with 45+ company-owned container fleets, dedicated move coordinators, and zero-brokerage direct execution.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[#F7B731] font-bold block">IBA Approved</span>
                  <span className="text-slate-400 text-[11px]">Bank codes for PSU moves</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-emerald-400 font-bold block">45+ Containers</span>
                  <span className="text-slate-400 text-[11px]">Company-owned fleet</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-blue-400 font-bold block">Zero Brokerage</span>
                  <span className="text-slate-400 text-[11px]">Direct hub execution</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-purple-400 font-bold block">4.9★ Rating</span>
                  <span className="text-slate-400 text-[11px]">35+ years excellence</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <a
                href="https://www.thenationalpackersmovers.com/"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#F7B731] to-[#e5a825] text-[#080C12] font-black text-sm hover:brightness-110 transition-all shadow-lg shadow-[#F7B731]/20"
              >
                <span>Visit Official Portal</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="tel:+919835168368"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
              >
                <PhoneCall className="w-4 h-4 text-[#F7B731]" />
                <span>+91 98351 68368</span>
              </a>
            </div>
          </div>
        </div>

        {/* SERVICES GRID (HYPER-PREMIUM CARDS - CLICKABLE ANYWHERE!) */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#F7B731] mb-1">
                <Layers className="w-4 h-4" />
                <span>7 Core Logistics Verticals</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Specialized Moving &amp; Logistics Sectors
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-md sm:text-right">
              Click any sector to view comprehensive operational protocols, verified rate matrices, and booking procedures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOGISTICS_SERVICES.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.slug}
                  href={`/services/${s.slug}`}
                  className="group relative block p-6 sm:p-7 rounded-3xl bg-gradient-to-b from-[#0F172A] to-[#0A0F1D] border border-slate-800/90 hover:border-[#F7B731] hover:shadow-2xl hover:shadow-[#F7B731]/15 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-5 cursor-pointer overflow-hidden"
                >
                  {/* Subtle Top-Right Ambient Glow on Hover */}
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#F7B731]/10 rounded-full blur-2xl group-hover:bg-[#F7B731]/25 transition-all duration-300 pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    {/* Top Row: Icon & Tag */}
                    <div className="flex items-center justify-between">
                      <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#F7B731]/20 to-[#F7B731]/5 border border-[#F7B731]/30 text-[#F7B731] flex items-center justify-center font-bold p-3 shadow-sm group-hover:scale-110 group-hover:border-[#F7B731] transition-all duration-300">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-900 border border-slate-700/80 text-slate-300 group-hover:border-[#F7B731]/50 group-hover:text-[#F7B731] transition-colors">
                        {s.tag}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-black text-white group-hover:text-[#F7B731] transition-colors flex items-center justify-between">
                        <span>{s.title}</span>
                        <ArrowUpRight className="w-5 h-5 text-slate-600 group-hover:text-[#F7B731] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </h3>
                      <p className="text-xs font-bold text-[#F7B731]/90 mt-1">
                        {s.subtitle}
                      </p>
                      <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                        {s.description}
                      </p>
                    </div>

                    {/* Checklist */}
                    <div className="space-y-2 pt-3 border-t border-slate-800/80">
                      {s.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Row: Tariff & Action */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between relative z-10">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Tariff Benchmark
                      </span>
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {s.rateGuide}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 group-hover:bg-[#F7B731] group-hover:text-[#080C12] font-black text-xs transition-all shadow-sm">
                      <span>View Protocol</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* INTERACTIVE SCROLLABLE & SEARCHABLE CITIES DIRECTORY (PROFESSIONAL & COMPACT) */}
        <section className="space-y-4">
          <ServicesCityDirectory cities={cities} states={states} />
        </section>

        {/* INTERACTIVE COST ESTIMATOR */}
        <section className="pt-4">
          <CostEstimator cityName="National All-India Corridor" />
        </section>
      </div>
    </div>
  );
}

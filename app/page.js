import Link from 'next/link';
import { query } from '@/lib/db';
import SearchBar from '@/components/SearchBar';
import CostEstimator from '@/components/CostEstimator';
import { 
  ShieldCheck, Award, Truck, Star, PhoneCall, 
  MapPin, CheckCircle2, Clock, BadgePercent, Building2, ChevronRight, HelpCircle
} from 'lucide-react';

export default async function HomePage() {
  // Query top states and cities for server-rendered links
  let cities = [];
  let states = [];
  try {
    const cityRes = await query(`
      SELECT c.id, c.name, c.slug, c.tier, s.name as state_name 
      FROM cities c 
      JOIN states s ON c.state_id = s.id 
      ORDER BY c.tier ASC, c.name ASC
    `);
    cities = cityRes.rows || [];

    const stateRes = await query(`
      SELECT s.name, s.slug, s.region, COUNT(c.id) as city_count
      FROM states s
      LEFT JOIN cities c ON s.id = c.state_id
      GROUP BY s.id, s.name, s.slug, s.region
      ORDER BY city_count DESC, s.name ASC
    `);
    states = stateRes.rows || [];
  } catch (err) {
    console.error('Failed to load homepage data:', err.message);
  }

  // Top Metros
  const topMetros = cities.filter(c => c.tier === 1).slice(0, 12);

  // JSON-LD Structured Data for Homepage
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BestPackerMovers.com',
    url: 'https://www.bestpackermovers.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.bestpackermovers.com/packers-and-movers-{search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I choose the best packers and movers in India?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Look for companies with official IBA approval, valid GST registration, verified physical transport hubs, positive verified customer ratings, transparent rate cards, and comprehensive transit insurance with zero hidden fees.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are the approximate moving charges for 1 BHK, 2 BHK, and 3 BHK?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Local shifting charges typically range from ₹3,500 to ₹6,500 for a 1 BHK, ₹5,500 to ₹9,500 for a 2 BHK, and ₹8,500 to ₹14,500 for a 3 BHK. Intercity relocation varies based on total distance and packing materials.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why should I hire an IBA-approved moving company?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IBA (Indian Banks\' Association) approved movers follow strict fleet safety protocols, offer standardized transparent billing, provide valid GST transit insurance, and are officially accepted for employer and bank transfer bill reimbursements.',
        },
      },
    ],
  };

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero Section */}
      {/* Hero Section - Powered by clamp() */}
      <section className="relative bg-gradient-to-b from-amber-500/10 via-slate-50 to-slate-50 py-[clamp(1.5rem,4vw,4rem)] overflow-hidden border-b border-slate-200/60">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60"></div>
        <div className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] relative text-center space-y-[clamp(1rem,2.5vw,1.5rem)]">
          {/* Trust Badge Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-amber-100/90 border border-amber-300/80 text-amber-900 text-[clamp(0.6875rem,1vw,0.875rem)] font-bold shadow-sm">
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-700" />
            <span>India&apos;s Most Trusted Logistics & Movers Aggregator</span>
          </div>

          {/* Main H1 - Liquid Responsive with clamp() */}
          <h1 className="text-[clamp(1.5rem,4.5vw+0.4rem,3.75rem)] font-extrabold text-slate-950 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Compare & Book <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Verified Packers and Movers</span> Across India
          </h1>

          <p className="text-[clamp(0.85rem,1.2vw+0.4rem,1.15rem)] text-slate-600 max-w-2xl mx-auto font-medium">
            Over 10,000+ background-checked moving companies, transparent rate cards, IBA certified fleets, and real customer reviews across 700+ Indian cities.
          </p>

          {/* Interactive Dual-Input Autocomplete Search */}
          <div className="pt-2 sm:pt-4">
            <SearchBar cities={cities} />
          </div>

          {/* Quick Metrics Strip - Liquid Responsive with clamp() */}
          <div className="pt-4 sm:pt-8 grid grid-cols-2 md:grid-cols-4 gap-[clamp(0.5rem,1.5vw,1rem)] max-w-4xl mx-auto text-center">
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-[clamp(1.15rem,3vw,1.875rem)] font-extrabold text-slate-950">28 States</div>
              <div className="text-[clamp(0.65rem,0.9vw,0.75rem)] text-slate-500 font-medium mt-0.5">8 Union Territories</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-[clamp(1.15rem,3vw,1.875rem)] font-extrabold text-amber-600">700+ Hubs</div>
              <div className="text-[clamp(0.65rem,0.9vw,0.75rem)] text-slate-500 font-medium mt-0.5">Metros & Towns</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-[clamp(1.15rem,3vw,1.875rem)] font-extrabold text-emerald-600">100% Verified</div>
              <div className="text-[clamp(0.65rem,0.9vw,0.75rem)] text-slate-500 font-medium mt-0.5">IBA Approved Fleets</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              <div className="text-[clamp(1.15rem,3vw,1.875rem)] font-extrabold text-slate-950">4.9 / 5.0</div>
              <div className="text-[clamp(0.65rem,0.9vw,0.75rem)] text-slate-500 font-medium mt-0.5">Customer Trust</div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Rated Mover Spotlight: National Packers & Movers - Fluid clamp() */}
      <section className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)]">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 rounded-2xl sm:rounded-3xl p-[clamp(1rem,3vw,2.5rem)] text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-[clamp(1.25rem,2.5vw,2rem)] relative">
            <div className="space-y-[clamp(0.75rem,1.5vw,1rem)] max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[clamp(0.6875rem,0.9vw,0.75rem)] font-bold border border-amber-500/30">
                <Award className="w-3.5 h-3.5" />
                <span>#1 Top Rated Relocation Carrier (4.9★ Verified)</span>
              </div>
              <h2 className="text-[clamp(1.35rem,3vw+0.3rem,2.25rem)] font-extrabold tracking-tight text-white">
                National Packers & Movers
              </h2>
              <p className="text-[clamp(0.8125rem,0.9vw+0.5rem,1rem)] text-slate-300 leading-relaxed">
                Consistently ranked #1 in verified customer satisfaction, safety compliance, and on-time transit across India since 1987. Specializing in zero-damage household relocation, corporate transit, car carrying, and bank transfer bill certification across all 28 States and 8 Union Territories.
              </p>
              
              <div className="flex flex-wrap gap-2 sm:gap-3 text-[clamp(0.6875rem,0.85vw,0.75rem)] font-semibold text-slate-300 pt-1">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> IBA Approved Fleets
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <Truck className="w-3.5 h-3.5 text-amber-400" /> 45+ GPS Containerized Trucks
                </span>
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/10">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.9 Star Rating (1,540+ Reviews)
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 w-full lg:w-72 flex-shrink-0">
              <a
                href="tel:+919835168368"
                className="py-[clamp(0.75rem,1.8vw,1rem)] px-5 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 text-[clamp(0.85rem,1.2vw,1rem)]"
              >
                <PhoneCall className="w-4 h-4 text-slate-950" />
                <span>+91 98351 68368</span>
              </a>
              <Link
                href="/mover/national-packers-and-movers-dhanbad"
                className="py-[clamp(0.6rem,1.5vw,0.75rem)] px-5 rounded-xl font-bold text-white bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center text-[clamp(0.75rem,1vw,0.875rem)]"
              >
                View Verified Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Top Metro Cities Grid (Direct Crawlable Links for Googlebot) */}
      <section className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] space-y-[clamp(1rem,2vw,1.5rem)]">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="text-[clamp(0.6875rem,0.9vw,0.75rem)] font-bold uppercase tracking-wider text-amber-600 mb-1">
              High Demand Moving Corridors
            </div>
            <h2 className="text-[clamp(1.25rem,2.5vw+0.35rem,2rem)] font-extrabold text-slate-950">
              Popular City Relocation Directories
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Click on your city to browse background-checked movers, localized shifting rates, and customer reviews.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {topMetros.map((city) => (
            <Link
              key={city.slug}
              href={`/packers-and-movers-${city.slug}`}
              className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-md transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors text-sm sm:text-base">
                  {city.name}
                </div>
                <div className="text-xs text-slate-400 font-medium mt-0.5">
                  {city.state_name}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-amber-600 font-semibold pt-2 border-t border-slate-100">
                <span>View Movers</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Shifting Cost Estimator Calculator Tool */}
      <section className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)]">
        <CostEstimator cityName="PAN-India" />
      </section>

      {/* States & Union Territories Exploration (Full Crawl Authority) */}
      <section className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] space-y-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            Nationwide Logistics Network
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Explore All 28 States & 8 Union Territories
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {states.map((st) => (
            <Link
              key={st.slug}
              href={`/${st.slug}`}
              className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-between group"
            >
              <div>
                <div className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                  {st.name}
                </div>
                <div className="text-xs text-slate-400">
                  {st.region} India • {st.city_count || 1} Cities Covered
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose BestPackerMovers Standards */}
      <section className="bg-slate-100/70 py-16 sm:py-20 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-950">
              Why 250,000+ Families Trust BestPackerMovers.com
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              We eliminate moving scams, fake rate cards, and transit damages through our strict 5-point verification framework.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">100% Background-Checked Fleets</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Every listed moving company is manually audited for valid GST certification, physical warehouse addresses, commercial vehicle fitness, and IBA accreditation.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <BadgePercent className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Zero Hidden Transit Charges</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Compare itemized starting rate cards across 1 BHK, 2 BHK, and vehicle carriers before you book. No surprise toll or staircase extortion on moving day.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-950">Rapid 15-Minute Dispatch</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get up to 3 verified quotes from top-rated movers in your city within 15 minutes. Save up to 25% by comparing certified quotes directly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEO FAQ Accordions */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4 text-sm">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              How do I choose the best packers and movers in India?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              Always verify IBA approval, physical office presence, commercial GST invoice capability, transparent written quotes with transit insurance, and authentic multi-year customer feedback. Our directory verifies each listing so you can book with confidence.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              What are the approximate moving charges for 1 BHK, 2 BHK, and 3 BHK?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              For local shifting within a city, rates typically start at ₹3,500 - ₹6,500 for a 1 BHK, ₹5,500 - ₹9,500 for a 2 BHK, and ₹8,500 - ₹14,500 for a 3 BHK. For long-distance interstate moves, charges depend on the exact distance in kilometers and packing requirements.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
            <h3 className="font-bold text-slate-900 text-base">
              Why should I hire an IBA-approved moving company?
            </h3>
            <p className="text-slate-600 leading-relaxed">
              IBA-approved logistics companies follow stringent standards set by the Indian Banks&apos; Association. They offer standardized pricing, background-checked staff, containerized waterproof vehicles, and official GST bills required for PSU, bank, and corporate employee transfer reimbursements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

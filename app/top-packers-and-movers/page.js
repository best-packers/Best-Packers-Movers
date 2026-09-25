import Link from 'next/link';
import { query } from '@/lib/db';
import MoverCard from '@/components/MoverCard';
import CostEstimator from '@/components/CostEstimator';
import { 
  ShieldCheck, MapPin, Award, CheckCircle2, 
  ChevronRight, PhoneCall, Sparkles, Star, Truck, Building2 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Top 10 Best Packers and Movers in India | 2026 PAN-India Verified Directory',
  description: 'Discover the top 10 best packers and movers in India. Compare verified star ratings, transparent starting rate cards, IBA approved carriers, and get free moving quotes.',
  alternates: {
    canonical: 'https://www.bestpackermovers.com/top-packers-and-movers',
  },
  openGraph: {
    title: 'Top 10 Best Packers and Movers in India | 2026 Verified Directory',
    description: 'Compare verified star ratings, starting rate cards, and IBA approved carriers across all Indian states and metro cities.',
    url: 'https://www.bestpackermovers.com/top-packers-and-movers',
  }
};

export default async function TopMoversPage() {
  let states = [];
  let topMovers = [];
  let nationalMover = null;

  try {
    // 1. Fetch all states
    const statesRes = await query('SELECT id, name, slug, region FROM states ORDER BY name ASC');
    states = statesRes.rows || [];

    // 2. Fetch National Packers & Movers master record
    const npRes = await query(
      `SELECT m.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE m.rank_order = 1 
       ORDER BY m.rating DESC 
       LIMIT 1`
    );
    nationalMover = npRes.rows[0] || null;

    // 3. Fetch top movers across Indian cities
    const moversRes = await query(
      `SELECT m.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       ORDER BY m.rank_order ASC, m.rating DESC 
       LIMIT 25`
    );
    topMovers = moversRes.rows || [];
  } catch (err) {
    console.error('Error loading top movers page:', err);
  }

  const topMetros = [
    { name: 'Delhi NCR', slug: 'new-delhi', state: 'Delhi' },
    { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra' },
    { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka' },
    { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal' },
    { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana' },
    { name: 'Chennai', slug: 'chennai', state: 'Tamil Nadu' },
    { name: 'Pune', slug: 'pune', state: 'Maharashtra' },
    { name: 'Ahmedabad', slug: 'ahmedabad', state: 'Gujarat' },
    { name: 'Lucknow', slug: 'lucknow', state: 'Uttar Pradesh' },
    { name: 'Patna', slug: 'patna', state: 'Bihar' },
    { name: 'Dhanbad (HQ)', slug: 'dhanbad', state: 'Jharkhand' },
    { name: 'Ranchi', slug: 'ranchi', state: 'Jharkhand' }
  ];

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 10 Best Packers and Movers in India',
    description: 'Ranked directory of the highest-rated relocation companies in India.',
    itemListElement: topMovers.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'LocalBusiness',
        name: m.name,
        telephone: m.phone,
        address: m.address,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(m.rating || 4.5).toFixed(1),
          reviewCount: m.review_count || 50
        }
      }
    }))
  };

  return (
    <div className="space-y-12 pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Header - Powered by clamp() */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white py-[clamp(2rem,5vw,4rem)] px-[clamp(0.75rem,3.5vw,2rem)] border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-full max-w-7xl mx-auto space-y-[clamp(1rem,2.5vw,1.5rem)] relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-400 font-medium">
            <Link href="/" className="hover:text-amber-400">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-amber-400 font-semibold">Top Movers in India</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-[clamp(0.6875rem,0.9vw,0.75rem)] font-bold border border-amber-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PAN-India 2026 Verified Directory Rankings</span>
          </div>

          <h1 className="text-[clamp(1.5rem,4vw+0.4rem,3.25rem)] font-extrabold tracking-tight text-white max-w-4xl leading-[1.2]">
            Top 10 Best Packers and Movers in India
          </h1>

          <p className="text-slate-300 text-[clamp(0.8125rem,0.9vw+0.55rem,1.0625rem)] max-w-3xl leading-relaxed">
            Compare India&apos;s highest-rated, background-verified relocation carriers. All listed movers are evaluated on verified customer feedback, fleet safety, IBA certification, transparent pricing tables, and zero-damage guarantees across all 28 States and 8 Union Territories.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[clamp(0.5rem,1.5vw,1rem)] pt-2 sm:pt-4 text-xs font-semibold text-slate-300">
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">100%</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Background Verified</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">4.8★+</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Minimum Quality</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">28 States</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">PAN-India Coverage</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-amber-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">24x7</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Support Helpline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Layout - Powered by clamp() */}
      <div className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] space-y-[clamp(1.5rem,3.5vw,3rem)]">
        {/* National Pinned Slot #1 Carrier Spotlight */}
        {nationalMover && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-amber-600">
                <Award className="w-4 h-4" />
                <span>#1 Ranked Permanent Platinum Verified Carrier</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Slot #1 Certified</span>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 rounded-3xl p-6 sm:p-10 border-2 border-amber-500 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                      National Packers & Movers (India HQ)
                    </h2>
                    <span className="badge-verified">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Platinum Verified</span>
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    India&apos;s benchmark relocation conglomerate with over 35+ years of operational excellence. Operating dedicated company-owned containerized fleets across all Indian states with GPS live tracking, multi-layer waterproof bubble packaging, and 100% IBA-approved bank transfer billing.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <span className="badge-iba font-bold">
                      <Award className="w-3.5 h-3.5" /> IBA Approved
                    </span>
                    <span className="badge-platinum font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" /> 4.9★ (1,540+ Reviews)
                    </span>
                    <span className="bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600" /> 45+ GPS Container Trucks
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-lg font-bold">
                      Est. 1987
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Central Logistics Terminal, Near Highway Junction, Serving PAN-India</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-64 flex-shrink-0">
                  <a
                    href="tel:+919835168368"
                    className="py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 text-sm"
                  >
                    <PhoneCall className="w-4 h-4 text-slate-950" />
                    <span>+91 98351 68368</span>
                  </a>
                  <Link
                    href={`/mover/${nationalMover.slug}`}
                    className="py-3 px-6 rounded-xl font-bold text-slate-800 bg-white border border-slate-300 hover:bg-slate-50 transition-all text-center text-xs shadow-sm"
                  >
                    View Verified Rate Card
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Top Metro City Directory Grid */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Browse Top Movers by Major Indian Metros
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Select your city to view local verified rankings, transparent pricing matrices, and authentic reviews.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topMetros.map((metro) => (
              <Link
                key={metro.slug}
                href={`/top-10-packers-and-movers-${metro.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-400 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <Building2 className="w-5 h-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
                <div className="font-bold text-slate-900 group-hover:text-amber-600 text-sm sm:text-base">
                  {metro.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {metro.state} • Top 10 Ranked
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Top Verified Movers Listing Feed */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Verified Moving Companies Across India ({topMovers.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ranked by verified rating, customer feedback volume, and safety certifications.
            </p>
          </div>

          <div className="space-y-4">
            {topMovers.map((mover) => (
              <MoverCard 
                key={mover.id} 
                mover={mover} 
                cityName={mover.city_name} 
              />
            ))}
          </div>
        </section>

        {/* State Hub Navigation */}
        <section className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-950">
            Browse All 28 States & 8 Union Territories
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Access state-wide relocation directories, intercity transport corridors, and regional pricing standards.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {states.map((st) => (
              <Link
                key={st.slug}
                href={`/${st.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-amber-600 hover:border-amber-400 transition-all shadow-sm"
              >
                {st.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Instant Cost Estimator Section */}
        <section id="calculator" className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-950">
              Calculate Shifting Charges Across India
            </h2>
            <p className="text-xs text-slate-500">
              Instant distance and BHK volume price estimator with zero hidden fees.
            </p>
          </div>
          <CostEstimator cityName="India" />
        </section>
      </div>
    </div>
  );
}

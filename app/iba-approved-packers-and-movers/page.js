import Link from 'next/link';
import { query } from '@/lib/db';
import MoverCard from '@/components/MoverCard';
import CostEstimator from '@/components/CostEstimator';
import { 
  ShieldCheck, MapPin, Award, CheckCircle2, 
  ChevronRight, PhoneCall, Sparkles, Star, Truck, Building2, HelpCircle 
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'IBA Approved Packers and Movers in India | Bank & PSU Transfer Certified',
  description: 'Official directory of IBA approved packers and movers in India. 100% verified for bank employee, PSU, and government transfer bill reimbursement with GST invoices.',
  alternates: {
    canonical: 'https://www.bestpackermovers.com/iba-approved-packers-and-movers',
  },
  openGraph: {
    title: 'IBA Approved Packers and Movers in India | Bank Transfer Certified',
    description: 'Hire certified IBA approved movers accepted by SBI, PNB, Bank of Baroda, and PSUs for complete relocation bill reimbursement.',
    url: 'https://www.bestpackermovers.com/iba-approved-packers-and-movers',
  }
};

export default async function IbaApprovedPage() {
  let states = [];
  let ibaMovers = [];
  let nationalMover = null;

  try {
    // 1. Fetch states
    const statesRes = await query('SELECT id, name, slug, region FROM states ORDER BY name ASC');
    states = statesRes.rows || [];

    // 2. Fetch National Packers master record (Permanent #1 IBA Approved Carrier)
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

    // 3. Fetch movers with IBA Approved badges or top rankings
    const ibaRes = await query(
      `SELECT m.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug 
       FROM movers m 
       JOIN cities c ON m.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE m.badges LIKE '%IBA%' OR m.rank_order = 1 
       ORDER BY m.rank_order ASC, m.rating DESC 
       LIMIT 25`
    );
    ibaMovers = ibaRes.rows || [];
  } catch (err) {
    console.error('Error loading IBA approved page:', err);
  }

  const topIbaCities = [
    { name: 'Kolkata', slug: 'kolkata', state: 'West Bengal' },
    { name: 'Dhanbad (HQ)', slug: 'dhanbad', state: 'Jharkhand' },
    { name: 'Ranchi', slug: 'ranchi', state: 'Jharkhand' },
    { name: 'Patna', slug: 'patna', state: 'Bihar' },
    { name: 'Lucknow', slug: 'lucknow', state: 'Uttar Pradesh' },
    { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra' },
    { name: 'Delhi NCR', slug: 'new-delhi', state: 'Delhi' },
    { name: 'Bengaluru', slug: 'bengaluru', state: 'Karnataka' },
    { name: 'Hyderabad', slug: 'hyderabad', state: 'Telangana' },
    { name: 'Bhubaneswar', slug: 'bhubaneswar', state: 'Odisha' },
    { name: 'Singrauli', slug: 'singrauli-mp-hq', state: 'Madhya Pradesh' },
    { name: 'Kanpur', slug: 'kanpur', state: 'Uttar Pradesh' }
  ];

  // Schema.org Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'IBA Approved Packers and Movers in India',
    description: 'Directory of IBA approved relocation carriers certified for bank and government transfers.',
    itemListElement: ibaMovers.map((m, idx) => ({
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
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-full max-w-7xl mx-auto space-y-[clamp(1rem,2.5vw,1.5rem)] relative">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-400 font-medium">
            <Link href="/" className="hover:text-amber-400">Home</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-emerald-400 font-semibold">IBA Approved Movers India</span>
          </nav>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[clamp(0.6875rem,0.9vw,0.75rem)] font-bold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Indian Banks&apos; Association (IBA) Certified Directory</span>
          </div>

          <h1 className="text-[clamp(1.5rem,4vw+0.4rem,3.25rem)] font-extrabold tracking-tight text-white max-w-4xl leading-[1.2]">
            IBA Approved Packers and Movers in India
          </h1>

          <p className="text-slate-300 text-[clamp(0.8125rem,0.9vw+0.55rem,1.0625rem)] max-w-3xl leading-relaxed">
            Hiring an IBA-approved carrier is mandatory for bank, public sector undertaking (PSU), and central government employees to claim 100% shifting bill reimbursement. All listed companies provide official GST invoices, consignment notes (LR/Bilty), and comprehensive transit insurance accepted by all major nationalized banks.
          </p>

          {/* Core Transfer Benefits */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-[clamp(0.5rem,1.5vw,1rem)] pt-2 sm:pt-4 text-xs font-semibold text-slate-300">
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-emerald-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">100%</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Bill Claim Clearance</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-emerald-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">All Banks</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">SBI, PNB, BoB & PSUs</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-emerald-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">GST Valid</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Compliant Invoices & LR</div>
            </div>
            <div className="p-[clamp(0.65rem,2vw,1rem)] rounded-xl sm:rounded-2xl bg-white/5 border border-white/10">
              <div className="text-emerald-400 text-[clamp(1rem,2.5vw,1.5rem)] font-extrabold font-mono">Full Cover</div>
              <div className="text-slate-400 text-[clamp(0.65rem,0.8vw,0.75rem)] mt-0.5">Transit Insurance Included</div>
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
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>#1 Premier IBA Approved Relocation Carrier</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Bank & PSU Certified</span>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 via-white to-amber-500/5 rounded-3xl p-6 sm:p-10 border-2 border-emerald-600 shadow-xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                <div className="space-y-4 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-950">
                      National Packers & Movers
                    </h2>
                    <span className="badge-iba">
                      <Award className="w-4 h-4" />
                      <span>Official IBA Approved</span>
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed">
                    India&apos;s most trusted IBA-approved moving conglomerate with over 35+ years of unblemished service. Fully authorized for employee transfer relocations across the State Bank of India (SBI), Bank of Baroda, Punjab National Bank, Indian Oil, NTPC, BHEL, and Armed Forces personnel nationwide.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs">
                    <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" /> 100% Guaranteed Reimbursement Docs
                    </span>
                    <span className="bg-slate-100 text-slate-800 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-amber-600" /> 45+ GPS Container Fleet
                    </span>
                    <span className="bg-amber-100 text-amber-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-current text-amber-600" /> 4.9★ Rating (1,540+ Reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>Serving All Indian Revenue Districts, Industrial Hubs & Defense Cantts</span>
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
                    View Official Rates
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* IBA Reimbursement Guidelines & Educational Module */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <span>Guidelines for Bank & PSU Employee Shifting Reimbursement</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Ensure your employee transfer relocation bill is processed and reimbursed without audit deductions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">IBA Approval Code & Certificate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                National and regional banks require the moving operator to furnish a valid IBA recommendation code matching the official IBA member registry.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Valid GST Invoice & Consignment Copy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                You must submit a computerized GST tax invoice along with the original Consignment Note (Lorry Receipt / Bilty) stamped by the loading branch.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Transit Insurance Policy</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive 100% goods in transit insurance documentation issued by a recognized general insurance provider is mandatory for claim approval.
              </p>
            </div>
          </div>
        </section>

        {/* City-by-City IBA Hubs */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Browse IBA Approved Movers by Major Hubs
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Access localized IBA approved relocation directories with verified branch contacts.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {topIbaCities.map((city) => (
              <Link
                key={city.slug}
                href={`/iba-approved-packers-and-movers-${city.slug}`}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    IBA Certified
                  </span>
                </div>
                <div className="font-bold text-slate-900 group-hover:text-emerald-700 text-sm sm:text-base">
                  {city.name}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {city.state} • Bank Certified
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* IBA Movers Listing Feed */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
              Verified IBA Approved Movers Across India ({ibaMovers.length})
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pre-vetted for government, bank, and defense relocation bill reimbursement.
            </p>
          </div>

          <div className="space-y-4">
            {ibaMovers.map((mover) => (
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
            IBA Approved Carriers by State
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Select your state to locate certified relocation networks authorized for bank transfers.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {states.map((st) => (
              <Link
                key={st.slug}
                href={`/${st.slug}`}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:border-emerald-400 transition-all shadow-sm"
              >
                {st.name}
              </Link>
            ))}
          </div>
        </section>

        {/* Cost Estimator */}
        <section id="calculator" className="space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-950">
              Calculate Official Shifting Charges
            </h2>
            <p className="text-xs text-slate-500">
              Get an instant baseline relocation estimate for official invoice and reimbursement planning.
            </p>
          </div>
          <CostEstimator cityName="India" />
        </section>
      </div>
    </div>
  );
}

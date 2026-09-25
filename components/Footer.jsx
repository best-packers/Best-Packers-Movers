import Link from 'next/link';
import { Truck, ShieldCheck, PhoneCall, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { query } from '@/lib/db';

export default async function Footer() {
  let states = [];
  try {
    const res = await query('SELECT name, slug, region FROM states ORDER BY name ASC');
    states = res.rows || [];
  } catch (err) {
    console.error('Failed to load states for footer:', err.message);
  }

  // Top Metro and Hub Cities
  const topCityLinks = [
    { name: 'Kolkata', slug: 'packers-and-movers-kolkata' },
    { name: 'Dhanbad (HQ)', slug: 'packers-and-movers-dhanbad' },
    { name: 'Ranchi', slug: 'packers-and-movers-ranchi' },
    { name: 'Patna', slug: 'packers-and-movers-patna' },
    { name: 'Lucknow', slug: 'packers-and-movers-lucknow' },
    { name: 'Kanpur', slug: 'packers-and-movers-kanpur' },
    { name: 'Bhubaneswar', slug: 'packers-and-movers-bhubaneswar' },
    { name: 'Jamshedpur', slug: 'packers-and-movers-jamshedpur' },
    { name: 'Delhi NCR', slug: 'packers-and-movers-new-delhi' },
    { name: 'Mumbai', slug: 'packers-and-movers-mumbai' },
    { name: 'Bengaluru', slug: 'packers-and-movers-bengaluru' },
    { name: 'Hyderabad', slug: 'packers-and-movers-hyderabad' },
    { name: 'Indore', slug: 'packers-and-movers-indore' },
    { name: 'Bhopal', slug: 'packers-and-movers-bhopal' },
    { name: 'Singrauli', slug: 'packers-and-movers-singrauli-mp-hq' }
  ];

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-[clamp(2.5rem,6vw,4rem)] pb-[clamp(2rem,4vw,3rem)]">
      <div className="max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)]">
        {/* Top Grid: Brand & National Packers Dispatch */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800/80">
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Best<span className="text-amber-500">Packer</span>Movers
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              India&apos;s authoritative PAN-India directory and aggregator for verified, licensed, and IBA-approved moving companies. Compare authentic customer reviews, transparent rate cards, and get instant verified quotes.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>100% Background-Checked Relocation Fleets</span>
            </div>
          </div>

          {/* Central Directory Support Desk */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              Central Verification Desk
            </h4>
            <p className="text-xs text-slate-400">
              BestPackerMovers.com PAN-India Support Hub — dedicated assistance connecting relocators with verified carriers across all 28 States and 8 Union Territories.
            </p>
            <div className="space-y-2 text-sm">
              <a href="tel:+919835168368" className="flex items-center gap-2.5 text-white hover:text-amber-400 transition-colors font-medium">
                <PhoneCall className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>+91 98351 68368 (24x7 Helpline)</span>
              </a>
              <a href="mailto:support@bestpackermovers.com" className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span>support@bestpackermovers.com</span>
              </a>
              <div className="flex items-start gap-2.5 text-xs text-slate-400">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Central Operations: Bank More, Dhanbad, Jharkhand 826001</span>
              </div>
            </div>
          </div>

          {/* Top Moving Hubs */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Key Operational Hubs</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {topCityLinks.slice(0, 10).map((city) => (
                <Link
                  key={city.slug}
                  href={`/${city.slug}`}
                  className="text-slate-400 hover:text-amber-400 transition-colors py-0.5 truncate"
                >
                  {city.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="space-y-4">
            <h4 className="text-white font-bold text-base">Directory Trust Standards</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>IBA Approved Bill Verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero Hidden Transit Charges</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>GPS Live Vehicle Tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>All-India Transit Insurance</span>
              </li>
            </ul>
          </div>
        </div>

        {/* States & Union Territories Full Links Matrix (Crawl Depth Engine) */}
        <div className="py-10 border-b border-slate-800/80">
          <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider text-slate-300">
            PAN-India Coverage: All 28 States & 8 Union Territories
          </h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            {states.map((st) => (
              <Link
                key={st.slug}
                href={`/${st.slug}`}
                className="text-slate-400 hover:text-amber-400 transition-colors"
              >
                Packers and Movers {st.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BestPackerMovers.com. All Rights Reserved. National Logistics & Relocation Directory Platform.</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/sitemap.xml" className="hover:text-white transition-colors">XML Sitemap</Link>
            <Link href="/admin" className="hover:text-amber-400 transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

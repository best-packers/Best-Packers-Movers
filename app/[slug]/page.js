import { notFound } from 'next/navigation';
import Link from 'next/link';
import { query } from '@/lib/db';
import MoverCard from '@/components/MoverCard';
import CostEstimator from '@/components/CostEstimator';
import { 
  ShieldCheck, MapPin, Award, CheckCircle2, 
  HelpCircle, ChevronRight, PhoneCall, Sparkles, Filter,
  Truck, Clock, Info, AlertCircle
} from 'lucide-react';

// DYNAMIC METADATA GENERATOR (FOR GOOGLEBOT)
export async function generateMetadata({ params }) {
  let { slug } = params;
  if (slug && slug.startsWith('packers-and-movers-in-')) {
    slug = slug.replace('packers-and-movers-in-', 'packers-and-movers-');
  }

  try {
    // 1. Check intent_routes
    const intentRes = await query(
      `SELECT r.*, c.name as city_name, s.name as state_name 
       FROM intent_routes r 
       JOIN cities c ON r.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE r.slug_pattern = $1`,
      [slug]
    );

    if (intentRes.rows.length > 0) {
      const route = intentRes.rows[0];
      return {
        title: route.meta_title,
        description: route.meta_description,
        alternates: {
          canonical: `https://www.bestpackermovers.com/${slug}`,
        },
        openGraph: {
          title: route.meta_title,
          description: route.meta_description,
          url: `https://www.bestpackermovers.com/${slug}`,
        },
      };
    }

    // 2. Check cities
    const cityRes = await query(
      `SELECT c.*, s.name as state_name 
       FROM cities c 
       JOIN states s ON c.state_id = s.id 
       WHERE c.slug = $1`,
      [slug]
    );

    if (cityRes.rows.length > 0) {
      const city = cityRes.rows[0];
      const title = `Packers and Movers in ${city.name} | Verified Moving Directory`;
      const desc = `Compare top verified packers and movers in ${city.name}, ${city.state_name}. View authentic reviews, starting rate cards, and get instant free quotes.`;
      return {
        title,
        description: desc,
        alternates: {
          canonical: `https://www.bestpackermovers.com/${slug}`,
        },
      };
    }

    // 3. Check states
    const stateRes = await query('SELECT * FROM states WHERE slug = $1', [slug]);
    if (stateRes.rows.length > 0) {
      const state = stateRes.rows[0];
      const title = `Packers and Movers in ${state.name} | All-India Relocation Directory`;
      const desc = `Find certified packers and movers across all major cities and districts in ${state.name}. Compare ratings, rates, and book IBA approved movers.`;
      return {
        title,
        description: desc,
        alternates: {
          canonical: `https://www.bestpackermovers.com/${slug}`,
        },
      };
    }
  } catch (err) {
    console.error('Metadata lookup error:', err);
  }

  return {
    title: 'Packers and Movers Directory | BestPackerMovers.com',
    description: 'Find verified packers and movers across India.',
  };
}

// HELPER FUNCTIONS FOR LOCALIZED LOGISTICS INTELLIGENCE & FAQS (ANTI-PROGRAMMATIC ENGINE)
function getLocalLogisticsAdvisory(city, state, intentType) {
  const isMetro = city.tier === 1;
  const isHilly = ['Himachal Pradesh', 'Uttarakhand', 'Jammu and Kashmir', 'Ladakh', 'Sikkim', 'Arunachal Pradesh', 'Meghalaya', 'Mizoram', 'Nagaland', 'Manipur'].includes(state.name);
  const isCoastal = ['Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Odisha', 'Gujarat', 'Maharashtra', 'West Bengal'].includes(state.name);

  let timingRule = '';
  let vehicleRule = '';
  let permitRule = '';

  if (isMetro) {
    timingRule = `Peak-hour commercial vehicle restrictions apply in ${city.name} between 08:00 AM – 11:30 AM and 05:00 PM – 09:30 PM. Moving trucks operate efficiently during non-peak afternoon windows (11:30 AM – 04:30 PM) or early morning arrivals.`;
    vehicleRule = `Dedicated closed container vehicles (14ft to 22ft) with tail-lift mechanisms are deployed for multi-storey high-rises across ${city.popular_localities?.slice(0, 3)?.join(', ') || city.name}.`;
    permitRule = `Prior society management NOC, lift booking, and service-lane truck parking permissions should be arranged 24 hours prior to loading.`;
  } else if (isHilly) {
    timingRule = `Mountain transit windows are scheduled between sunrise and early afternoon to navigate elevation passes and avoid evening fog or weather disruptions.`;
    vehicleRule = `Movers deploy specialized high-torque, closed mountain-grade container trucks with reinforced shock absorbers and heavy-duty tie-down lashings.`;
    permitRule = `Transit through state border checkposts and mountain toll corridors requires valid e-Way bills and vehicle transit clearance slips.`;
  } else if (isCoastal) {
    timingRule = `Regular daytime freight hours apply with uninterrupted corridor movement along coastal national expressways.`;
    vehicleRule = `All consignments feature anti-humidity stretch film and silica desiccant bags to protect electronics and polished wooden furniture against marine air.`;
    permitRule = `Standard interstate logistics consignment notes (Bilty) and GST e-Way bills are fully coordinated by our verified moving companies.`;
  } else {
    timingRule = `Standard daytime transit hours apply across ${city.name}, offering rapid turnaround between local municipal wards and regional bypass junctions.`;
    vehicleRule = `Fleet includes versatile Tata 407s, 14ft container trucks, and Mahindra Bolero pick-ups for narrow residential lanes and wide highway corridors.`;
    permitRule = `Complete door-to-door documentation, inventory item lists, and insurance declarations are provided before loading.`;
  }

  return { timingRule, vehicleRule, permitRule, isMetro, isHilly, isCoastal };
}

function getLocalFaqs(city, state, intentType) {
  return [
    {
      question: `What are the average packers and movers charges in ${city.name}?`,
      answer: `In ${city.name}, local shifting charges range between ₹3,500 – ₹6,500 for a 1 BHK, ₹5,500 – ₹9,500 for a 2 BHK, and ₹8,500 – ₹14,500 for a 3 BHK. Long-distance intercity moves up to 500 km typically range between ₹8,500 – ₹24,000 depending on volume, packing quality, and transit distance.`
    },
    {
      question: `Are there specific moving truck entry restrictions or timing regulations in ${city.name}?`,
      answer: city.tier === 1 
        ? `Yes. Heavy commercial vehicles face no-entry hours in ${city.name} during morning (08:00 AM – 11:30 AM) and evening peak hours (05:00 PM – 09:30 PM). Our verified movers schedule loading and transit during designated non-peak windows or obtain municipal entry permits.`
        : `Moving trucks generally have unhindered access throughout the day across ${city.name}. For narrow residential lanes, our movers utilize agile 14ft closed container trucks or dedicated mini-pickups to ensure direct doorstep delivery.`
    },
    {
      question: `How can I identify genuine and IBA approved packers and movers in ${city.name}?`,
      answer: `Genuine IBA-approved moving companies possess a valid recommendation code issued by the Indian Banks' Association, an active GST registration, and issue official consignment notes (Bilty). On BestPackerMovers.com, National Packers & Movers holds Slot #1 with Platinum Verification, 4.9★ rating, and verified IBA compliance for all bank, PSU, and corporate relocations.`
    },
    {
      question: `What packing safety measures and insurance are provided for moves originating from ${city.name}?`,
      answer: `Verified movers in ${city.name} use a 4-layer packaging standard including heavy-duty bubble wrap, corrugated sheets, foam edge guards, and waterproof stretch film. Transit insurance covering risk against accidental damage or loss is provided with written policy documentation before dispatch.`
    }
  ];
}

// 100% SERVER COMPONENT ROUTE HANDLER
export default async function DirectoryRoutePage({ params }) {
  let { slug } = params;
  if (slug && slug.startsWith('packers-and-movers-in-')) {
    slug = slug.replace('packers-and-movers-in-', 'packers-and-movers-');
  }

  let pageType = null; // 'intent', 'city', 'state'
  let currentCity = null;
  let currentState = null;
  let currentIntent = null;
  let movers = [];
  let relatedCities = [];
  let siblingRoutes = [];

  try {
    // 1. Check if slug is an Intent Route
    const intentRes = await query(
      `SELECT r.*, c.id as city_id, c.name as city_name, c.slug as city_slug, 
              c.popular_localities, s.id as state_id, s.name as state_name, s.slug as state_slug
       FROM intent_routes r 
       JOIN cities c ON r.city_id = c.id 
       JOIN states s ON c.state_id = s.id 
       WHERE r.slug_pattern = $1`,
      [slug]
    );

    if (intentRes.rows.length > 0) {
      pageType = 'intent';
      currentIntent = intentRes.rows[0];
      currentCity = {
        id: currentIntent.city_id,
        name: currentIntent.city_name,
        slug: currentIntent.city_slug,
        popular_localities: typeof currentIntent.popular_localities === 'string' 
          ? JSON.parse(currentIntent.popular_localities) 
          : (currentIntent.popular_localities || [])
      };
      currentState = {
        id: currentIntent.state_id,
        name: currentIntent.state_name,
        slug: currentIntent.state_slug
      };

      // Fetch movers for this city (National Packers always #1)
      const moversRes = await query(
        `SELECT * FROM movers WHERE city_id = $1 ORDER BY rank_order ASC, rating DESC`,
        [currentCity.id]
      );
      movers = moversRes.rows || [];

      // Fetch other sibling intent routes for navigation
      const siblingRes = await query(
        `SELECT intent_type, slug_pattern, h1_heading FROM intent_routes WHERE city_id = $1`,
        [currentCity.id]
      );
      siblingRoutes = siblingRes.rows || [];
    }

    // 2. Check if slug is a City
    if (!pageType) {
      const cityRes = await query(
        `SELECT c.*, s.id as state_id, s.name as state_name, s.slug as state_slug 
         FROM cities c 
         JOIN states s ON c.state_id = s.id 
         WHERE c.slug = $1`,
        [slug]
      );

      if (cityRes.rows.length > 0) {
        pageType = 'city';
        currentCity = cityRes.rows[0];
        currentCity.popular_localities = typeof currentCity.popular_localities === 'string'
          ? JSON.parse(currentCity.popular_localities)
          : (currentCity.popular_localities || []);

        currentState = {
          id: currentCity.state_id,
          name: currentCity.state_name,
          slug: currentCity.state_slug
        };

        const moversRes = await query(
          `SELECT * FROM movers WHERE city_id = $1 ORDER BY rank_order ASC, rating DESC`,
          [currentCity.id]
        );
        movers = moversRes.rows || [];

        const siblingRes = await query(
          `SELECT intent_type, slug_pattern, h1_heading FROM intent_routes WHERE city_id = $1`,
          [currentCity.id]
        );
        siblingRoutes = siblingRes.rows || [];
      }
    }

    // 3. Check if slug is a State
    if (!pageType) {
      const stateRes = await query('SELECT * FROM states WHERE slug = $1', [slug]);
      if (stateRes.rows.length > 0) {
        pageType = 'state';
        currentState = stateRes.rows[0];

        // Fetch cities in this state
        const citiesRes = await query(
          'SELECT * FROM cities WHERE state_id = $1 ORDER BY tier ASC, name ASC',
          [currentState.id]
        );
        relatedCities = citiesRes.rows || [];

        // Fetch top featured movers in this state
        if (relatedCities.length > 0) {
          const firstCityId = relatedCities[0].id;
          const moversRes = await query(
            `SELECT * FROM movers WHERE city_id = $1 ORDER BY rank_order ASC LIMIT 5`,
            [firstCityId]
          );
          movers = moversRes.rows || [];

          // Map National Packers website_url to dedicated State Branch URL if it exists on thenationalpackersmovers.com
          const stateBranchSlugs = ['jharkhand', 'west-bengal', 'bihar', 'madhya-pradesh', 'odisha', 'uttar-pradesh'];
          if (movers.length > 0 && (movers[0].rank_order === 1 || movers[0].name.toLowerCase().includes('national'))) {
            if (stateBranchSlugs.includes(currentState.slug)) {
              movers[0].website_url = `https://www.thenationalpackersmovers.com/branches/${currentState.slug}`;
            } else {
              movers[0].website_url = 'https://www.thenationalpackersmovers.com/';
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Directory page query error:', err);
  }

  if (!pageType) {
    notFound();
  }

  // Generate Structured Data (JSON-LD) for Search Engines
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: currentIntent ? currentIntent.h1_heading : `Packers and Movers in ${currentCity ? currentCity.name : currentState.name}`,
    itemListElement: movers.map((m, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'MovingCompany',
        name: m.name,
        url: `https://www.bestpackermovers.com/mover/${m.slug}`,
        telephone: m.phone,
        address: m.address,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: m.rating || 4.5,
          reviewCount: m.review_count || 45,
        },
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://www.bestpackermovers.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: currentState.name,
        item: `https://www.bestpackermovers.com/${currentState.slug}`,
      },
      ...(currentCity ? [{
        '@type': 'ListItem',
        position: 3,
        name: currentCity.name,
        item: `https://www.bestpackermovers.com/${currentCity.slug}`,
      }] : []),
    ],
  };

  // State Level Page View
  if (pageType === 'state') {
    return (
      <div className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] py-[clamp(1rem,3vw,2.5rem)] space-y-[clamp(1.5rem,3.5vw,3rem)]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-500 font-medium">
          <Link href="/" className="hover:text-amber-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-semibold">{currentState.name}</span>
        </nav>

        {/* Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[clamp(0.6875rem,0.8vw,0.75rem)] font-bold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{currentState.region} India Relocation Zone</span>
          </div>
          <h1 className="text-[clamp(1.4rem,4vw+0.4rem,3rem)] font-extrabold text-slate-950 tracking-tight leading-[1.2]">
            Packers and Movers in {currentState.name}
          </h1>
          <p className="text-[clamp(0.8125rem,0.9vw+0.55rem,1.0625rem)] text-slate-600 max-w-3xl leading-relaxed">
            Select your city or district in {currentState.name} to view licensed moving companies, verified customer ratings, and transparent shifting rate cards.
          </p>
        </div>

        {/* State Featured Top Mover: National Packers & Movers */}
        {movers.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-[clamp(1.15rem,2.5vw+0.35rem,1.75rem)] font-bold text-slate-950">
              State-Wide Featured Mover in {currentState.name}
            </h2>
            <MoverCard mover={movers[0]} cityName={currentState.name} />
          </div>
        )}

        {/* Cities Grid in this State */}
        <div className="space-y-[clamp(1rem,2vw,1.5rem)]">
          <h2 className="text-[clamp(1.15rem,2.5vw+0.35rem,1.75rem)] font-bold text-slate-950">
            Cities & Operational Districts in {currentState.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[clamp(0.65rem,1.8vw,1rem)]">
            {relatedCities.map((city) => (
              <Link
                key={city.slug}
                href={`/packers-and-movers-${city.slug}`}
                className="p-[clamp(0.75rem,2vw,1rem)] rounded-xl bg-white border border-slate-200/80 hover:border-amber-500 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-amber-600 text-[clamp(0.875rem,1.2vw,1rem)]">
                    {city.name}
                  </div>
                  <div className="text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-400 mt-1">
                    {city.tier === 1 ? 'Metro Hub' : 'District Hub'}
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs text-amber-600 font-semibold pt-2 border-t border-slate-100">
                  <span>View Movers</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Cost Estimator */}
        <CostEstimator cityName={currentState.name} />
      </div>
    );
  }

  // City or Intent Route View
  const h1Heading = currentIntent ? currentIntent.h1_heading : `Packers and Movers in ${currentCity.name}`;
  const introText = currentIntent?.intro_text || `Looking for genuine, verified packers and movers in ${currentCity.name}? BestPackerMovers.com aggregates verified relocation companies, transparent pricing tables, and real customer reviews across ${currentCity.popular_localities.join(', ')}.`;

  const localFaqs = currentCity ? getLocalFaqs(currentCity, currentState, currentIntent?.intent_type) : [];
  const localAdvisory = currentCity ? getLocalLogisticsAdvisory(currentCity, currentState, currentIntent?.intent_type) : null;
  const faqSchema = localFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="w-full max-w-7xl mx-auto px-[clamp(0.75rem,3.5vw,2rem)] py-[clamp(1rem,3vw,2.5rem)] space-y-[clamp(1.5rem,3.5vw,3rem)]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-[clamp(0.6875rem,0.8vw,0.75rem)] text-slate-500 font-medium">
        <Link href="/" className="hover:text-amber-600">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${currentState.slug}`} className="hover:text-amber-600">{currentState.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">{currentCity.name}</span>
      </nav>

      {/* Page Title & Intro */}
      <div className="space-y-[clamp(0.75rem,1.8vw,1rem)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge-verified text-[clamp(0.6875rem,0.8vw,0.75rem)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>100% Background Verified</span>
          </span>
          <span className="text-xs text-slate-400">•</span>
          <span className="text-[clamp(0.6875rem,0.8vw,0.75rem)] font-semibold text-slate-500">
            Updated {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        <h1 className="text-[clamp(1.4rem,4vw+0.4rem,3rem)] font-extrabold text-slate-950 tracking-tight leading-[1.2]">
          {h1Heading}
        </h1>

        <p className="text-[clamp(0.8125rem,0.9vw+0.55rem,1.0625rem)] text-slate-600 max-w-3xl leading-relaxed">
          {introText}
        </p>

        {/* Multi-Intent Filter Chips */}
        {siblingRoutes.length > 0 && (
          <div className="pt-2 flex flex-wrap gap-[clamp(0.35rem,1vw,0.5rem)]">
            <span className="text-[clamp(0.6875rem,0.9vw,0.75rem)] font-bold text-slate-400 self-center mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter Intent:
            </span>
            {siblingRoutes.map((rt) => {
              const isCurrent = rt.slug_pattern === slug;
              return (
                <Link
                  key={rt.slug_pattern}
                  href={`/${rt.slug_pattern}`}
                  className={`px-[clamp(0.6rem,1.5vw,0.875rem)] py-[clamp(0.3rem,1vw,0.45rem)] rounded-full text-[clamp(0.6875rem,1vw,0.8rem)] font-bold transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-700 hover:border-amber-400'
                  }`}
                >
                  {rt.intent_type === 'general' ? 'All Movers' : 
                   rt.intent_type === 'best' ? 'Top Rated' :
                   rt.intent_type === 'top_10' ? 'Top 10' :
                   rt.intent_type === 'cheap' ? 'Affordable / Cheap' :
                   rt.intent_type === 'iba_approved' ? 'IBA Approved' : rt.intent_type}
                </Link>
              );
            })}
          </div>
        )}

        {/* Localities Tags */}
        {currentCity.popular_localities.length > 0 && (
          <div className="flex flex-wrap items-center gap-[clamp(0.35rem,0.8vw,0.5rem)] pt-2 text-[clamp(0.6875rem,0.8vw,0.75rem)]">
            <span className="font-semibold text-slate-400">Serving Localities:</span>
            {currentCity.popular_localities.map((loc, idx) => (
              <span key={idx} className="bg-slate-100 text-slate-600 px-[clamp(0.4rem,1vw,0.65rem)] py-0.5 rounded-md font-medium">
                {loc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Verified Movers Listing Cards (National Packers always #1) */}
      <section className="space-y-[clamp(1rem,2vw,1.5rem)]">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <h2 className="text-[clamp(1.15rem,2.5vw+0.35rem,1.75rem)] font-bold text-slate-950 flex items-center gap-2">
            <span>Verified Relocation Companies in {currentCity.name}</span>
            <span className="text-[clamp(0.6875rem,0.8vw,0.75rem)] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              {movers.length} Verified
            </span>
          </h2>
        </div>

        <div className="space-y-[clamp(1rem,2vw,1.5rem)]">
          {movers.map((mover) => (
            <MoverCard
              key={mover.id}
              mover={mover}
              cityName={currentCity.name}
            />
          ))}
        </div>
      </section>

      {/* Shifting Cost Guide Matrix for this City */}
      <section className="bg-white rounded-2xl sm:rounded-3xl p-[clamp(0.875rem,2.5vw,2rem)] border border-slate-200 shadow-sm space-y-[clamp(1rem,2vw,1.5rem)] w-full max-w-full overflow-hidden min-w-0">
        <div className="space-y-1">
          <h3 className="text-[clamp(1.15rem,2.5vw+0.35rem,1.5rem)] font-bold text-slate-950">
            Approximate Packers and Movers Charges in {currentCity.name}
          </h3>
          <p className="text-xs text-slate-500">
            Estimated market rate benchmarks based on verified local relocations.
          </p>
        </div>

        <div className="overflow-x-auto w-full max-w-full pb-2">
          <table className="min-w-[540px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Move Size</th>
                <th className="py-3 px-4">Local Shifting (Within {currentCity.name})</th>
                <th className="py-3 px-4">Domestic / Intercity (Up to 500 KM)</th>
                <th className="py-3 px-4">Packing & Material Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">1 BHK House Shift</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">₹3,500 - ₹6,500</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">₹8,500 - ₹15,000</td>
                <td className="py-3.5 px-4 text-slate-600">Standard Corrugated + Foam</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">2 BHK House Shift</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">₹5,500 - ₹9,500</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">₹14,000 - ₹24,000</td>
                <td className="py-3.5 px-4 text-slate-600">Multi-Layer Bubble Wrap</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">3 BHK House Shift</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">₹8,500 - ₹14,500</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">₹19,000 - ₹32,000</td>
                <td className="py-3.5 px-4 text-slate-600">Heavy Duty Wooden Crating + Bubble</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-bold text-slate-900">Car / Bike Transport</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">₹2,500 - ₹5,000</td>
                <td className="py-3.5 px-4 font-mono text-slate-700">₹6,000 - ₹14,000</td>
                <td className="py-3.5 px-4 text-slate-600">Closed Car Carrier with GPS</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* City-Specific Logistics Advisory (Anti-Programmatic Local Intelligence) */}
      {localAdvisory && (
        <section className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 text-white rounded-2xl sm:rounded-3xl p-[clamp(1rem,2.5vw,2rem)] shadow-lg space-y-[clamp(1rem,2vw,1.5rem)] border border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-[clamp(1.05rem,2vw,1.35rem)] font-bold text-white">
                  Local Shifting & Transit Guidelines for {currentCity.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Essential moving rules, vehicle restrictions & society permissions in {currentCity.name}, {currentState.name}
                </p>
              </div>
            </div>
            <span className="text-[clamp(0.6875rem,0.8vw,0.75rem)] font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
              {localAdvisory.isMetro ? 'Metro Transit Protocol' : localAdvisory.isHilly ? 'Himalayan Pass Protocol' : localAdvisory.isCoastal ? 'Coastal Corridor' : 'State Highway Corridor'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-400">
                <Clock className="w-4 h-4" />
                <span>Commercial Vehicle Timings</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {localAdvisory.timingRule}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Fleet & Container Standards</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {localAdvisory.vehicleRule}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-sky-400">
                <Info className="w-4 h-4" />
                <span>Society NOC & Permits</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {localAdvisory.permitRule}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Interactive Cost Estimator Tool */}
      <CostEstimator cityName={currentCity.name} />

      {/* Local Relocation FAQs (with Schema.org Structured Data) */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            <span>Frequently Asked Questions About Shifting in {currentCity.name}</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real relocation answers based on municipal transport regulations, IBA standards, and local market charges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {localFaqs.map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-2">
              <h4 className="font-bold text-slate-900 flex items-start gap-2">
                <span className="text-amber-600 font-extrabold text-xs mt-0.5">Q{idx + 1}.</span>
                <span>{faq.question}</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed pl-5">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

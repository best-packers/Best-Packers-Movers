const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Import JSON datasets directly (100% bundled by Next.js / Webpack, zero serverless disk dependency)
const statesData = require('../data/states.json');
const citiesData = require('../data/cities.json');
const intentRoutesData = require('../data/intent_routes.json');
const moversData = require('../data/movers.json');

// In-memory runtime collections for mutable tables
let mutableMovers = [...moversData];
let mutableIntentRoutes = [...intentRoutesData];
let mutableLeads = [];
let mutableReviews = [];

// Hash indexes for O(1) high-speed lookups
const citiesBySlug = new Map(citiesData.map(c => [c.slug, c]));
const citiesById = new Map(citiesData.map(c => [c.id, c]));
const statesBySlug = new Map(statesData.map(s => [s.slug, s]));
const statesById = new Map(statesData.map(s => [s.id, s]));
const intentRoutesBySlug = new Map(mutableIntentRoutes.map(r => [r.slug_pattern, r]));

let nationalBranches = [];
try {
  nationalBranches = require('../scripts/national_branches.json');
} catch (e) {
  nationalBranches = [];
}

// Centralized Master National Packers Profile (Global Singleton)
let masterNationalProfile = {};
try {
  masterNationalProfile = require('../data/master_national_profile.json');
} catch (e) {
  masterNationalProfile = {
    id: 'np-master',
    name: 'National Packers & Movers',
    name_template: 'National Packers & Movers ({cityName})',
    phone: '+91 98351 68368',
    email: 'dispatch@thenationalpackersmovers.com',
    website_url: 'https://www.thenationalpackersmovers.com/',
    address_template: 'Central Logistics Hub & Container Terminal, Near Highway Corridor, {cityName}, {stateName}',
    rating: 4.9,
    review_count: 1540,
    established_year: '1987',
    fleet_size: '45+ Container Trucks',
    badges: ["#1 Top Rated", "Platinum Verified", "IBA Approved", "ISO Certified", "100% Damage Protection", "GPS Tracked Fleets"],
    services_offered: ["Household Relocation", "Car & Bike Transport", "Corporate Office Shifting", "Warehouse Storage", "Transit Insurance", "Industrial Heavy Transport"],
    about_template: "National Packers & Movers is India's leading IBA-approved relocation conglomerate with over 35+ years of excellence. Operating dedicated company-owned containerized fleets across {cityName}, {stateName} and PAN-India with GPS tracking, multi-layer waterproof bubble packaging, and zero-damage guarantee.",
    pricing_table: { "1bhk": "₹3,500 - ₹6,500", "2bhk": "₹5,500 - ₹9,500", "3bhk": "₹8,500 - ₹14,500", "4bhk_villa": "₹12,500 - ₹22,000", "vehicle": "₹4,500 - ₹9,000", "office": "Custom Inspection Quote" },
    logo_url: "/favicon.ico",
    banner_url: null,
    gallery_images: []
  };
}

function getMasterNationalProfile() {
  return { ...masterNationalProfile };
}

function updateMasterNationalProfile(updatedData) {
  masterNationalProfile = {
    ...masterNationalProfile,
    ...updatedData,
    id: 'np-master'
  };

  // Synchronize across all National Packers entries in mutableMovers as well
  mutableMovers.forEach(m => {
    if (m.id === 'np-master' || (m.id && typeof m.id === 'string' && m.id.startsWith('np-')) || (m.name && m.name.toLowerCase().includes('national'))) {
      if (updatedData.phone) m.phone = updatedData.phone;
      if (updatedData.email) m.email = updatedData.email;
      if (updatedData.website_url) m.website_url = updatedData.website_url;
      if (updatedData.address_template) {
        const city = citiesById.get(m.city_id);
        const state = city ? statesById.get(city.state_id) : null;
        m.address = updatedData.address_template
          .replace(/{cityName}/g, city?.name || 'Local')
          .replace(/{stateName}/g, state?.name || '');
      }
      if (updatedData.about_template) {
        const city = citiesById.get(m.city_id);
        const state = city ? statesById.get(city.state_id) : null;
        m.about_text = updatedData.about_template
          .replace(/{cityName}/g, city?.name || 'Local')
          .replace(/{stateName}/g, state?.name || '');
      }
      if (updatedData.logo_url !== undefined) m.logo_url = updatedData.logo_url;
      if (updatedData.banner_url !== undefined) m.banner_url = updatedData.banner_url;
      if (updatedData.gallery_images !== undefined) {
        m.gallery_images = typeof updatedData.gallery_images === 'string' 
          ? updatedData.gallery_images 
          : JSON.stringify(updatedData.gallery_images);
      }
      if (updatedData.badges !== undefined) {
        m.badges = typeof updatedData.badges === 'string'
          ? updatedData.badges
          : JSON.stringify(updatedData.badges);
      }
      if (updatedData.services_offered !== undefined) {
        m.services_offered = typeof updatedData.services_offered === 'string'
          ? updatedData.services_offered
          : JSON.stringify(updatedData.services_offered);
      }
      if (updatedData.pricing_table !== undefined) {
        m.pricing_table = typeof updatedData.pricing_table === 'string'
          ? updatedData.pricing_table
          : JSON.stringify(updatedData.pricing_table);
      }
      if (updatedData.fleet_size) m.fleet_size = updatedData.fleet_size;
      if (updatedData.established_year) m.established_year = updatedData.established_year;
    }
  });

  try {
    const targetFile = path.join(process.cwd(), 'data', 'master_national_profile.json');
    fs.writeFileSync(targetFile, JSON.stringify(masterNationalProfile, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save master_national_profile.json:', err);
  }
  return masterNationalProfile;
}

function getNationalPackersMoverForCity(city, state) {
  const branchMatch = nationalBranches.find(b => b.includes(`/${state?.slug}/${city?.slug}`));
  const stateMatch = nationalBranches.find(b => b.endsWith(`/${state?.slug}`));
  const websiteUrl = branchMatch || stateMatch || masterNationalProfile.website_url || 'https://www.thenationalpackersmovers.com/';

  const cityName = city?.name || 'Your City';
  const stateName = state?.name || '';

  const name = (masterNationalProfile.name_template || 'National Packers & Movers ({cityName})').replace(/{cityName}/g, cityName);
  const address = (masterNationalProfile.address_template || 'Central Hub & Logistics Terminal, Near Highway Junction, {cityName}, {stateName}')
    .replace(/{cityName}/g, cityName)
    .replace(/{stateName}/g, stateName);
  const about_text = (masterNationalProfile.about_template || "National Packers & Movers is India's leading IBA-approved relocation conglomerate with over 35+ years of excellence. Operating dedicated company-owned containerized fleets across {cityName}, {stateName} and PAN-India with GPS tracking, multi-layer waterproof bubble packaging, and zero-damage guarantee.")
    .replace(/{cityName}/g, cityName)
    .replace(/{stateName}/g, stateName);

  return {
    id: `np-${city.id}`,
    city_id: city.id,
    name,
    slug: `national-packers-and-movers-${city.slug}`,
    logo_url: masterNationalProfile.logo_url || '/favicon.ico',
    banner_url: masterNationalProfile.banner_url || null,
    phone: masterNationalProfile.phone || '+91 98351 68368',
    email: masterNationalProfile.email || 'dispatch@thenationalpackersmovers.com',
    website_url: websiteUrl,
    address,
    rating: Number(masterNationalProfile.rating || 4.9),
    review_count: Number(masterNationalProfile.review_count || 1540),
    rank_order: 1,
    is_verified: 1,
    is_featured: 1,
    badges: typeof masterNationalProfile.badges === 'string' ? masterNationalProfile.badges : JSON.stringify(masterNationalProfile.badges || ["#1 Top Rated","Platinum Verified","IBA Approved","ISO Certified"]),
    services_offered: typeof masterNationalProfile.services_offered === 'string' ? masterNationalProfile.services_offered : JSON.stringify(masterNationalProfile.services_offered || ["Household Relocation","Car & Bike Transport","Corporate Office Shifting","Warehouse Storage","Transit Insurance"]),
    about_text,
    fleet_size: masterNationalProfile.fleet_size || '45+ Container Trucks',
    established_year: masterNationalProfile.established_year || '1987',
    pricing_table: typeof masterNationalProfile.pricing_table === 'string' ? masterNationalProfile.pricing_table : JSON.stringify(masterNationalProfile.pricing_table || {"1bhk":"₹3,500 - ₹6,500","2bhk":"₹5,500 - ₹9,500","3bhk":"₹8,500 - ₹14,500","4bhk_villa":"₹12,500 - ₹22,000","vehicle":"₹4,500 - ₹9,000","office":"Custom Inspection Quote"}),
    gallery_images: typeof masterNationalProfile.gallery_images === 'string' ? masterNationalProfile.gallery_images : JSON.stringify(masterNationalProfile.gallery_images || []),
    source: 'system_pan_india',
    is_paid: 1,
    created_at: '2026-09-24 00:00:00'
  };
}

function generateMoversForCity(city, state) {
  const np = getNationalPackersMoverForCity(city, state);
  const stateName = state?.name || '';
  
  const regionalMovers = [
    np,
    {
      id: `rc1-${city.id}`,
      city_id: city.id,
      name: `Apex Express Logistics (${city.name})`,
      slug: `apex-express-logistics-${city.slug}`,
      logo_url: null,
      banner_url: null,
      phone: '+91 98210 44521',
      email: `support@apexlogistics-${city.slug}.in`,
      website_url: null,
      address: `Industrial Area & Logistics Park, ${city.name}, ${stateName}`,
      rating: 4.8,
      review_count: 320,
      rank_order: 2,
      is_verified: 1,
      is_featured: 0,
      badges: '["Verified Mover","Express Transit"]',
      services_offered: '["Home Relocation","Office Shifting","Vehicle Transport"]',
      about_text: `Apex Express Logistics provides specialized residential packing, commercial shifting, and intercity container transit across ${city.name} and surrounding districts.`,
      fleet_size: '18 Closed Trucks',
      established_year: '2012',
      pricing_table: '{"1bhk":"₹3,200 - ₹6,000","2bhk":"₹5,200 - ₹9,000","3bhk":"₹8,000 - ₹13,500","vehicle":"₹4,000 - ₹8,500"}',
      gallery_images: '[]',
      source: 'system_pan_india',
      created_at: '2026-09-24 00:00:00'
    },
    {
      id: `rc2-${city.id}`,
      city_id: city.id,
      name: `TransIndia Reliable Movers (${city.name})`,
      slug: `transindia-reliable-movers-${city.slug}`,
      logo_url: null,
      banner_url: null,
      phone: '+91 94311 88204',
      email: `booking@transindiamovers.in`,
      website_url: null,
      address: `Station Road, Near Freight Corridor, ${city.name}, ${stateName}`,
      rating: 4.7,
      review_count: 245,
      rank_order: 3,
      is_verified: 1,
      is_featured: 0,
      badges: '["Verified Mover","Careful Packing"]',
      services_offered: '["Household Moving","Bike Transport","Luggage Shifting"]',
      about_text: `TransIndia Reliable Movers offers punctual doorstep packing and safe transport for families and business relocations in ${city.name}.`,
      fleet_size: '14 Vehicles',
      established_year: '2015',
      pricing_table: '{"1bhk":"₹3,000 - ₹5,800","2bhk":"₹5,000 - ₹8,800","3bhk":"₹7,800 - ₹13,000","vehicle":"₹3,800 - ₹8,000"}',
      gallery_images: '[]',
      source: 'system_pan_india',
      created_at: '2026-09-24 00:00:00'
    },
    {
      id: `rc3-${city.id}`,
      city_id: city.id,
      name: `SafeRoute Cargo Relocations (${city.name})`,
      slug: `saferoute-cargo-relocations-${city.slug}`,
      logo_url: null,
      banner_url: null,
      phone: '+91 97714 62190',
      email: `care@saferoutemovers.in`,
      website_url: null,
      address: `Main Highway Bypass Junction, ${city.name}, ${stateName}`,
      rating: 4.6,
      review_count: 180,
      rank_order: 4,
      is_verified: 1,
      is_featured: 0,
      badges: '["Verified Mover","Budget Friendly"]',
      services_offered: '["Local Shifting","Domestic Moving","Warehousing"]',
      about_text: `SafeRoute Cargo Relocations delivers affordable local shifting with multi-layer bubble wrap protection across ${city.name}.`,
      fleet_size: '10 Closed Containers',
      established_year: '2018',
      pricing_table: '{"1bhk":"₹2,800 - ₹5,500","2bhk":"₹4,800 - ₹8,500","3bhk":"₹7,500 - ₹12,500","vehicle":"₹3,500 - ₹7,500"}',
      gallery_images: '[]',
      source: 'system_pan_india',
      created_at: '2026-09-24 00:00:00'
    }
  ];

  return regionalMovers;
}

let pgPool = null;
let isUsingSqlite = false;
let connectionAttempted = false;

async function testPostgresConnection() {
  if (connectionAttempted) return !isUsingSqlite;
  connectionAttempted = true;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || connectionString.includes('[YOUR-PASSWORD]') || connectionString.includes('gtbqvigqoggwlvpthsoe')) {
    console.log('⚡ Using high-performance in-memory data engine (zero external cloud dependencies).');
    isUsingSqlite = true;
    return false;
  }

  try {
    pgPool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000,
    });
    const client = await pgPool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Connected to remote PostgreSQL successfully!');
    isUsingSqlite = false;
    return true;
  } catch (err) {
    console.warn(`⚡ Remote DB unreachable (${err.message}), falling back seamlessly to in-memory data engine.`);
    isUsingSqlite = true;
    if (pgPool) {
      try { await pgPool.end(); } catch (_) {}
      pgPool = null;
    }
    return false;
  }
}

/**
 * High-performance in-memory SQL query engine (Zero C++, Zero Wasm, Zero GLIBC, 100% Serverless Reliable)
 */
function executeInMemoryQuery(text, params = []) {
  const norm = text.replace(/\s+/g, ' ').trim();
  const lower = norm.toLowerCase();

  // 1. Intent Route by slug_pattern (with City and State JOIN)
  if (lower.includes('from intent_routes') && lower.includes('slug_pattern =')) {
    const slug = params[0];
    let route = intentRoutesBySlug.get(slug) || mutableIntentRoutes.find(r => r.slug_pattern === slug);

    if (!route) {
      // Normalize any '-in-' variations seamlessly (e.g. packers-and-movers-in-dhanbad -> packers-and-movers-dhanbad)
      let cleanSlug = slug;
      if (cleanSlug.includes('-packers-and-movers-in-')) {
        cleanSlug = cleanSlug.replace('-packers-and-movers-in-', '-packers-and-movers-');
      } else if (cleanSlug.startsWith('packers-and-movers-in-')) {
        cleanSlug = cleanSlug.replace('packers-and-movers-in-', 'packers-and-movers-');
      }

      // Deterministic dynamic multi-intent resolution for all 7,606+ cities and 36 states/UTs across India
      const intentPatterns = [
        // IBA Approved variations
        { type: 'iba_approved', prefix: 'iba-approved-packers-and-movers-' },
        { type: 'iba_approved', prefix: 'iba-packers-and-movers-' },
        { type: 'iba_approved', prefix: 'iba-approved-movers-' },
        // Cheap & Affordable variations
        { type: 'cheap', prefix: 'cheap-and-affordable-packers-and-movers-' },
        { type: 'cheap', prefix: 'cheap-affordable-packers-and-movers-' },
        { type: 'cheap', prefix: 'affordable-packers-and-movers-' },
        { type: 'cheap', prefix: 'cheap-packers-and-movers-' },
        // Top Rates / Pricing variations
        { type: 'top_rates', prefix: 'top-rates-packers-and-movers-' },
        { type: 'top_rates', prefix: 'packers-and-movers-rates-' },
        // Top Rated / Best / Top 10 variations
        { type: 'top_rated', prefix: 'top-rated-packers-and-movers-' },
        { type: 'best', prefix: 'best-packers-and-movers-' },
        { type: 'top_10', prefix: 'top-10-packers-and-movers-' },
        // General Base
        { type: 'general', prefix: 'packers-and-movers-' }
      ];

      for (const p of intentPatterns) {
        if (cleanSlug.startsWith(p.prefix)) {
          let entitySlug = cleanSlug.slice(p.prefix.length);

          // Support explicit '-state' or '-city' suffixes if passed
          const isExplicitState = entitySlug.endsWith('-state');
          const isExplicitCity = entitySlug.endsWith('-city');
          if (isExplicitState) entitySlug = entitySlug.replace(/-state$/, '');
          if (isExplicitCity) entitySlug = entitySlug.replace(/-city$/, '');

          // Check if entity is a State (if explicit state or not explicit city)
          if (!isExplicitCity) {
            const state = statesBySlug.get(entitySlug);
            if (state) {
              const stateMetaTitles = {
                general: `Packers and Movers in ${state.name} | All-India Relocation Directory`,
                best: `Best Packers and Movers in ${state.name} | Top Rated Relocation Networks`,
                top_10: `Top 10 Packers and Movers in ${state.name} | Verified Directory`,
                top_rated: `Top Rated Packers and Movers in ${state.name} | 5-Star Moving Companies`,
                top_rates: `Top Rates & Moving Charges in ${state.name} | Verified Tariff Guide`,
                cheap: `Affordable & Cheap Packers and Movers in ${state.name} | Budget Shifting`,
                iba_approved: `IBA Approved Packers and Movers in ${state.name} | Bank Transfer Certified`
              };

              const stateH1Headings = {
                general: `Packers and Movers in ${state.name}`,
                best: `Best Packers and Movers in ${state.name}`,
                top_10: `Top 10 Packers and Movers in ${state.name}`,
                top_rated: `Top Rated Packers and Movers in ${state.name}`,
                top_rates: `Top Rates & Shifting Charges in ${state.name}`,
                cheap: `Affordable & Cheap Packers and Movers in ${state.name}`,
                iba_approved: `IBA Approved Packers and Movers in ${state.name}`
              };

              const stateMetaDescs = {
                general: `Find certified packers and movers across all major cities and districts in ${state.name}. Compare ratings, rates, and book IBA approved movers.`,
                best: `Discover the top rated packers and movers across ${state.name}. Compare authentic ratings, customer feedback, and instant price estimates.`,
                top_10: `Explore the top 10 verified moving networks in ${state.name}. Fully insured, background-checked relocation teams.`,
                top_rated: `Hire 5-star top rated moving companies across ${state.name}. Zero damage track record and GPS-tracked container transport.`,
                top_rates: `Transparent price charts and shifting charges across ${state.name}. Instant estimates for 1/2/3 BHK and vehicle relocations.`,
                cheap: `Budget-friendly and affordable moving companies in ${state.name}. Zero hidden fees and professional door-to-door transit.`,
                iba_approved: `Official IBA approved moving companies operating across ${state.name}. Valid bank recommendation codes and GST relocation bills.`
              };

              route = {
                id: `dyn-state-${p.type}-${state.id}`,
                state_id: state.id,
                is_state_intent: true,
                intent_type: p.type,
                slug_pattern: slug,
                meta_title: stateMetaTitles[p.type] || stateMetaTitles.general,
                meta_description: stateMetaDescs[p.type] || stateMetaDescs.general,
                h1_heading: stateH1Headings[p.type] || stateH1Headings.general,
                intro_text: `Explore certified relocation companies across ${state.name}. National Packers & Movers leads as the premier #1 verified state partner with IBA compliance, dedicated fleets, and zero advance booking fee.`,
                filter_criteria: '{}',
                is_active: 1
              };
              break;
            }
          }

          // Check if entity is a City
          const city = citiesBySlug.get(entitySlug);
          if (city) {
            const state = statesById.get(city.state_id);
            const stateName = state?.name || 'India';

            const cityMetaTitles = {
              general: `Packers and Movers in ${city.name} | Verified Moving Directory`,
              best: `Best Packers and Movers in ${city.name} (Top Rated & Verified)`,
              top_10: `Top 10 Packers and Movers in ${city.name} | Ranked & Reviewed`,
              top_rated: `Top Rated Packers and Movers in ${city.name} | 5-Star Customer Reviews`,
              top_rates: `Top Rates & Moving Charges in ${city.name} | Verified Tariff Guide`,
              cheap: `Affordable & Cheap Packers and Movers in ${city.name} (Budget Rates)`,
              iba_approved: `IBA Approved Packers and Movers in ${city.name} | Bank Transfer Certified`
            };

            const cityH1Headings = {
              general: `Best Packers and Movers in ${city.name}`,
              best: `Best Packers and Movers in ${city.name} (Top Rated)`,
              top_10: `Top 10 Packers and Movers in ${city.name}`,
              top_rated: `Top Rated Packers and Movers in ${city.name}`,
              top_rates: `Top Rates & Shifting Charges in ${city.name}`,
              cheap: `Affordable & Cheap Packers and Movers in ${city.name}`,
              iba_approved: `IBA Approved Packers and Movers in ${city.name}`
            };

            const cityMetaDescs = {
              general: `Find top verified packers and movers in ${city.name}, ${stateName}. Compare authentic reviews, starting rate cards, and book IBA approved movers with free quotes.`,
              best: `Discover the top rated packers and movers in ${city.name}. Compare ratings, customer feedback, and instant price estimates for household & vehicle shifting.`,
              top_10: `Browse the top 10 verified relocation companies in ${city.name}. Background checked, insured, and verified for safe household shifting.`,
              top_rated: `Connect with 5-star rated movers in ${city.name}. Professional packaging crews, guaranteed delivery timelines, and transit insurance.`,
              top_rates: `Check verified price charts and moving rates in ${city.name}. Transparent 1/2/3 BHK estimates with zero hidden charges.`,
              cheap: `Find low cost and budget-friendly packers and movers in ${city.name}. Transparent rates, zero hidden charges, and reliable shifting services.`,
              iba_approved: `Official list of IBA approved packers and movers in ${city.name}, ${stateName}. Verified recommendation codes, GST compliance, and bank employee shifting bills.`
            };

            route = {
              id: `dyn-${p.type}-${city.id}`,
              city_id: city.id,
              intent_type: p.type,
              slug_pattern: slug,
              meta_title: cityMetaTitles[p.type] || cityMetaTitles.general,
              meta_description: cityMetaDescs[p.type] || cityMetaDescs.general,
              h1_heading: cityH1Headings[p.type] || cityH1Headings.general,
              intro_text: `Looking for ${p.type === 'iba_approved' ? 'IBA approved' : p.type === 'cheap' ? 'affordable' : p.type === 'top_rates' ? 'low moving rates for' : 'reliable'} packers and movers in ${city.name}? BestPackerMovers.com aggregates verified relocation companies, transparent pricing tables, and real customer reviews across ${city.name} and surrounding regions.`,
              filter_criteria: '{}',
              is_active: 1
            };
            break;
          }
        }
      }
    }

    if (!route) return { rows: [] };

    if (route.is_state_intent) {
      const state = statesById.get(route.state_id);
      return {
        rows: [{
          ...route,
          state_id: state?.id || route.state_id,
          state_name: state?.name || '',
          state_slug: state?.slug || ''
        }]
      };
    }

    const city = citiesById.get(route.city_id);
    const state = city ? statesById.get(city.state_id) : null;
    return {
      rows: [{
        ...route,
        city_id: city?.id || route.city_id,
        city_name: city?.name || '',
        city_slug: city?.slug || '',
        popular_localities: city?.popular_localities || '[]',
        state_id: state?.id || '',
        state_name: state?.name || '',
        state_slug: state?.slug || ''
      }]
    };
  }

  // 2. City by slug (with State JOIN)
  if (lower.includes('from cities') && (lower.includes('c.slug =') || lower.includes('slug ='))) {
    const slug = params[0];
    const city = citiesBySlug.get(slug);
    if (!city) return { rows: [] };
    const state = statesById.get(city.state_id);
    return {
      rows: [{
        ...city,
        state_id: state?.id || '',
        state_name: state?.name || '',
        state_slug: state?.slug || ''
      }]
    };
  }

  // 2b. City by ID (for Admin Crawler & Profile lookups)
  if (lower.includes('from cities') && (lower.includes('where id =') || lower.includes('where c.id =') || lower.includes('c.id = $1') || lower.includes('id = $1'))) {
    const id = params[0];
    const city = citiesById.get(id);
    if (!city) return { rows: [] };
    const state = statesById.get(city.state_id);
    return {
      rows: [{
        ...city,
        state_id: state?.id || city.state_id,
        state_name: state?.name || '',
        state_slug: state?.slug || ''
      }]
    };
  }
  if (lower.includes('from states') && lower.includes('slug =')) {
    const slug = params[0];
    const state = statesBySlug.get(slug);
    return { rows: state ? [{ ...state }] : [] };
  }

  // 4. Mover by slug (with City and State JOIN)
  if (lower.includes('from movers') && (lower.includes('where m.slug =') || lower.includes('where slug =') || lower.includes('m.slug = $1') || lower.includes('m.slug = ?'))) {
    const slug = params[0];
    let mover = mutableMovers.find(m => m.slug === slug);
    if (slug.startsWith('national-packers-and-movers-') || (mover && (mover.rank_order === 1 || (mover.name && mover.name.toLowerCase().includes('national'))))) {
      const citySlug = slug.replace('national-packers-and-movers-', '');
      const city = (mover && citiesById.get(mover.city_id)) || citiesBySlug.get(citySlug);
      if (city) {
        const state = statesById.get(city.state_id);
        const npMaster = getNationalPackersMoverForCity(city, state);
        mover = {
          ...(mover || {}),
          ...npMaster,
          id: mover?.id || npMaster.id
        };
      }
    }
    if (!mover) return { rows: [] };
    const city = citiesById.get(mover.city_id) || citiesBySlug.get(slug.replace('national-packers-and-movers-', ''));
    const state = city ? statesById.get(city.state_id) : null;
    return {
      rows: [{
        ...mover,
        city_name: city?.name || '',
        city_slug: city?.slug || '',
        popular_localities: city?.popular_localities || '[]',
        state_name: state?.name || '',
        state_slug: state?.slug || ''
      }]
    };
  }

  // 5. Movers by city_id
  if (lower.includes('from movers') && (lower.includes('where city_id =') || lower.includes('where m.city_id =') || lower.includes('city_id = $1') || lower.includes('city_id = ?')) && !lower.includes('where m.id =') && !lower.includes('where id =') && !lower.includes('m.id = $1')) {
    let cityId = params[0];
    const matchedCity = citiesBySlug.get(cityId);
    if (matchedCity) {
      cityId = matchedCity.id;
    }
    let filtered = mutableMovers.filter(m => m.city_id === cityId);
    if (filtered.length === 0) {
      const city = citiesById.get(cityId);
      if (city) {
        const state = statesById.get(city.state_id);
        filtered = generateMoversForCity(city, state);
        // Materialize into mutableMovers so subsequent updates and direct ID lookups succeed
        filtered.forEach(item => {
          if (!mutableMovers.some(existing => existing.id === item.id)) {
            mutableMovers.push({ ...item });
          }
        });
      }
    }

    // Always ensure National Packers dynamically inherits current masterNationalProfile
    filtered = filtered.map(m => {
      if (m.rank_order === 1 || (m.name && m.name.toLowerCase().includes('national'))) {
        const city = citiesById.get(m.city_id) || citiesBySlug.get(cityId);
        const state = city ? statesById.get(city.state_id) : null;
        if (city) {
          const npMaster = getNationalPackersMoverForCity(city, state);
          return {
            ...m,
            ...npMaster,
            id: m.id
          };
        }
      }
      return m;
    });

    filtered.sort((a, b) => (a.rank_order || 99) - (b.rank_order || 99) || (b.rating || 0) - (a.rating || 0));
    if (lower.includes('limit 5')) {
      filtered = filtered.slice(0, 5);
    }
    return { rows: filtered.map(m => ({ ...m })) };
  }

  // 6. Mover by id (handles WHERE m.id = $1 or WHERE id = $1, with or without LEFT JOIN cities)
  if (lower.includes('from movers') && (lower.includes('where m.id =') || lower.includes('where id =') || lower.includes('where m.id=$') || lower.includes('where id=$') || lower.includes('m.id = $1') || lower.includes('id = $1') || lower.includes('m.id = ?') || lower.includes('id = ?'))) {
    const id = params[0];
    if (id === 'np-master' || (typeof id === 'string' && id.startsWith('np-'))) {
      const cityId = id === 'np-master' ? null : id.replace('np-', '');
      const city = cityId ? (citiesById.get(cityId) || citiesBySlug.get(cityId)) : null;
      const state = city ? statesById.get(city.state_id) : null;
      return {
        rows: [{
          id: 'np-master',
          name: masterNationalProfile.name || 'National Packers & Movers',
          slug: 'national-packers-and-movers-master',
          logo_url: masterNationalProfile.logo_url || '/favicon.ico',
          banner_url: masterNationalProfile.banner_url || null,
          phone: masterNationalProfile.phone || '+91 98351 68368',
          email: masterNationalProfile.email || 'dispatch@thenationalpackersmovers.com',
          website_url: masterNationalProfile.website_url || 'https://www.thenationalpackersmovers.com/',
          address: masterNationalProfile.address_template || 'Central Logistics Hub & Container Terminal, Near Highway Corridor, {cityName}, {stateName}',
          rating: Number(masterNationalProfile.rating || 4.9),
          review_count: Number(masterNationalProfile.review_count || 1540),
          rank_order: 1,
          is_verified: 1,
          is_featured: 1,
          badges: typeof masterNationalProfile.badges === 'string' ? masterNationalProfile.badges : JSON.stringify(masterNationalProfile.badges || []),
          services_offered: typeof masterNationalProfile.services_offered === 'string' ? masterNationalProfile.services_offered : JSON.stringify(masterNationalProfile.services_offered || []),
          pricing_table: typeof masterNationalProfile.pricing_table === 'string' ? masterNationalProfile.pricing_table : JSON.stringify(masterNationalProfile.pricing_table || {}),
          about_text: masterNationalProfile.about_template || '',
          gallery_images: typeof masterNationalProfile.gallery_images === 'string' ? masterNationalProfile.gallery_images : JSON.stringify(masterNationalProfile.gallery_images || []),
          fleet_size: masterNationalProfile.fleet_size || '45+ Container Trucks',
          established_year: masterNationalProfile.established_year || '1987',
          is_paid: 1,
          city_name: city?.name || 'All 7,000+ Indian Cities (Central Master)',
          city_slug: city?.slug || 'all-cities',
          state_name: state?.name || 'All States & UTs',
          state_slug: state?.slug || 'pan-india'
        }]
      };
    }

    let mover = mutableMovers.find(m => m.id === id);
    if (!mover) {
      // Dynamic fallback for regional movers generated on demand (e.g., rc1-cityId, rc2-cityId)
      const rcMatch = typeof id === 'string' && id.match(/^rc\d+-(.+)$/);
      if (rcMatch) {
        const cityKey = rcMatch[1];
        const city = citiesById.get(cityKey) || citiesBySlug.get(cityKey);
        if (city) {
          const state = statesById.get(city.state_id);
          const generated = generateMoversForCity(city, state);
          const found = generated.find(g => g.id === id);
          if (found) {
            mover = { ...found };
            mutableMovers.push(mover);
          }
        }
      }
    }

    if (!mover) return { rows: [] };
    const city = citiesById.get(mover.city_id) || citiesBySlug.get(mover.city_id);
    const state = city ? statesById.get(city.state_id) : null;
    return {
      rows: [{
        ...mover,
        city_name: city?.name || '',
        city_slug: city?.slug || '',
        state_name: state?.name || '',
        state_slug: state?.slug || ''
      }]
    };
  }

  // 7. Sibling intent routes by city_id
  if (lower.includes('from intent_routes') && lower.includes('city_id =')) {
    const cityId = params[0];
    const city = citiesById.get(cityId);
    if (city) {
      return {
        rows: [
          { intent_type: 'general', slug_pattern: `packers-and-movers-${city.slug}`, h1_heading: `Best Packers and Movers in ${city.name}` },
          { intent_type: 'top_rates', slug_pattern: `top-rates-packers-and-movers-${city.slug}`, h1_heading: `Top Rates & Moving Charges in ${city.name}` },
          { intent_type: 'top_rated', slug_pattern: `top-rated-packers-and-movers-${city.slug}`, h1_heading: `Top Rated Packers and Movers in ${city.name}` },
          { intent_type: 'top_10', slug_pattern: `top-10-packers-and-movers-${city.slug}`, h1_heading: `Top 10 Packers and Movers in ${city.name}` },
          { intent_type: 'cheap', slug_pattern: `cheap-and-affordable-packers-and-movers-${city.slug}`, h1_heading: `Affordable & Cheap Packers and Movers in ${city.name}` },
          { intent_type: 'iba_approved', slug_pattern: `iba-approved-packers-and-movers-${city.slug}`, h1_heading: `IBA Approved Packers and Movers in ${city.name}` }
        ]
      };
    }
    const siblings = mutableIntentRoutes.filter(r => r.city_id === cityId);
    return { rows: siblings.map(r => ({ intent_type: r.intent_type, slug_pattern: r.slug_pattern, h1_heading: r.h1_heading })) };
  }

  // 8a. All cities with State JOIN (for Homepage, Search autocomplete & Services Directory)
  if (lower.includes('from cities') && lower.includes('join states')) {
    let list = [...citiesData];
    if (lower.includes('c.tier = 1') || lower.includes('tier = 1')) {
      list = list.filter(c => c.tier === 1);
    } else if (lower.includes('tier <= 2') || lower.includes('tier < 3')) {
      list = list.filter(c => c.tier === 1 || c.tier === 2);
    }
    list.sort((a, b) => (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name));
    
    // Parse limit if any
    const limitMatch = lower.match(/limit\s+(\d+)/);
    if (limitMatch) {
      const lim = parseInt(limitMatch[1], 10);
      list = list.slice(0, lim);
    }

    return {
      rows: list.map(c => {
        const state = statesById.get(c.state_id);
        return { 
          id: c.id, 
          name: c.name, 
          slug: c.slug, 
          tier: c.tier, 
          state_id: c.state_id, 
          state_name: state?.name || '', 
          state_slug: state?.slug || '' 
        };
      })
    };
  }

  // 8. Cities in state (by state_id)
  if (lower.includes('from cities') && (lower.includes('where state_id =') || lower.includes('where c.state_id =') || lower.includes('state_id = $1') || lower.includes('state_id = ?'))) {
    const stateId = params[0];
    let stateCities = citiesData.filter(c => c.state_id === stateId);
    stateCities.sort((a, b) => (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name));
    return { rows: stateCities.map(c => ({ ...c })) };
  }

  // 8b. All cities sorted by name
  if (lower.includes('from cities') && lower.includes('order by') && lower.includes('name asc')) {
    let sorted = [...citiesData].sort((a, b) => a.name.localeCompare(b.name));
    const limitMatch = lower.match(/limit\s+(\d+)/);
    if (limitMatch) {
      const lim = parseInt(limitMatch[1], 10);
      sorted = sorted.slice(0, lim);
    }
    return { 
      rows: sorted.map(c => {
        const state = statesById.get(c.state_id);
        return { 
          id: c.id, 
          state_id: c.state_id, 
          name: c.name, 
          slug: c.slug, 
          tier: c.tier, 
          state_name: state?.name || '', 
          state_slug: state?.slug || '' 
        };
      }) 
    };
  }

  // 9. All states (for nav and hub pages)
  if (lower.includes('from states') && lower.includes('order by name asc')) {
    const sorted = [...statesData].sort((a, b) => a.name.localeCompare(b.name));
    return { rows: sorted.map(s => ({ ...s })) };
  }

  // 10. Top movers nationwide (Slot #1 National Packers)
  if (lower.includes('from movers m') && lower.includes('m.rank_order = 1') && lower.includes('limit 1')) {
    const np = mutableMovers.find(m => m.rank_order === 1 && m.name.toLowerCase().includes('national'));
    if (np) {
      const city = citiesById.get(np.city_id);
      const state = city ? statesById.get(city.state_id) : null;
      return { rows: [{ ...np, city_name: city?.name || '', city_slug: city?.slug || '', state_name: state?.name || '', state_slug: state?.slug || '' }] };
    }
  }

  // 11. Top movers nationwide (List)
  if (lower.includes('from movers m') && (lower.includes('order by m.rank_order asc') || lower.includes("badges like '%iba%'"))) {
    let list = mutableMovers.filter(m => {
      if (lower.includes("badges like '%iba%'")) {
        return (m.badges && m.badges.includes('IBA')) || m.rank_order === 1;
      }
      return true;
    });
    list.sort((a, b) => (a.rank_order || 99) - (b.rank_order || 99) || (b.rating || 0) - (a.rating || 0));
    list = list.slice(0, 25);
    return {
      rows: list.map(m => {
        const city = citiesById.get(m.city_id);
        const state = city ? statesById.get(city.state_id) : null;
        return {
          ...m,
          city_name: city?.name || '',
          city_slug: city?.slug || '',
          state_name: state?.name || '',
          state_slug: state?.slug || ''
        };
      })
    };
  }

  // 12. Homepage Popular Cities (JOIN states)
  if (lower.includes('from cities c') && lower.includes('order by c.tier asc, c.name asc')) {
    let list = [...citiesData].sort((a, b) => (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name));
    return {
      rows: list.map(c => {
        const state = statesById.get(c.state_id);
        return { ...c, state_name: state?.name || '' };
      })
    };
  }

  // 13. Homepage States with City Count
  if (lower.includes('count(c.id) as city_count') && lower.includes('from states s')) {
    const list = statesData.map(s => {
      const count = citiesData.filter(c => c.state_id === s.id).length;
      return { id: s.id, name: s.name, slug: s.slug, region: s.region, city_count: count };
    });
    list.sort((a, b) => b.city_count - a.city_count || a.name.localeCompare(b.name));
    return { rows: list };
  }

  // 14. Sitemap queries
  if (lower.includes('select slug from states')) {
    return { rows: statesData.map(s => ({ slug: s.slug })) };
  }
  if (lower.includes('select slug from cities')) {
    return { rows: citiesData.map(c => ({ slug: c.slug })) };
  }
  if (lower.includes('select slug_pattern from intent_routes')) {
    return { rows: mutableIntentRoutes.filter(r => r.is_active).map(r => ({ slug_pattern: r.slug_pattern })) };
  }
  if (lower.includes('select slug from movers')) {
    return { rows: mutableMovers.filter(m => m.is_verified).map(m => ({ slug: m.slug })) };
  }

  // 15. Reviews for mover
  if (lower.includes('from mover_reviews') && lower.includes('mover_id =')) {
    const moverId = params[0];
    const revs = mutableReviews.filter(r => r.mover_id === moverId && r.status === 'approved');
    return { rows: revs.slice(0, 20) };
  }

  // 16. Leads count / stats for Admin & Scripts
  if (lower.includes('count(id) as count from directory_leads')) {
    return { rows: [{ count: mutableLeads.length }] };
  }
  if (lower.includes('count(id) as count from cities') || lower.includes('count(*) as total from cities')) {
    return { rows: [{ count: citiesData.length, total: citiesData.length }] };
  }
  if (lower.includes('count(*) as total from states') || lower.includes('count(id) as count from states')) {
    return { rows: [{ count: statesData.length, total: statesData.length }] };
  }
  if (lower.includes('count(id) as count from movers') || lower.includes('count(*) as total from movers')) {
    return { rows: [{ count: mutableMovers.length, total: mutableMovers.length }] };
  }
  if (lower.includes('count(id) as count from intent_routes') || lower.includes('count(*) as total from intent_routes')) {
    return { rows: [{ count: mutableIntentRoutes.length, total: mutableIntentRoutes.length }] };
  }
  if (lower.includes('from states s') && lower.includes('left join cities c') && lower.includes('group by s.id')) {
    const breakdown = statesData.map(s => {
      const count = citiesData.filter(c => c.state_id === s.id).length;
      return { state: s.name, city_count: count };
    });
    breakdown.sort((a, b) => b.city_count - a.city_count || a.state.localeCompare(b.state));
    return { rows: breakdown };
  }

  // 17. Leads list for Admin
  if (lower.includes('from directory_leads l')) {
    const list = mutableLeads.map(l => {
      const mover = mutableMovers.find(m => m.id === l.mover_id);
      return { ...l, mover_name: mover?.name || 'General Inquiry' };
    });
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limit = lower.includes('limit 6') ? 6 : 200;
    return { rows: list.slice(0, limit) };
  }

  // 18. Insert Lead
  if (lower.includes('insert into directory_leads')) {
    const lead = {
      id: params[0] || crypto.randomUUID(),
      mover_id: params[1],
      customer_name: params[2],
      customer_phone: params[3],
      from_city: params[4],
      to_city: params[5],
      move_date: params[6],
      move_size: params[7],
      source_page: params[8],
      status: 'New',
      created_at: new Date().toISOString()
    };
    mutableLeads.unshift(lead);
    return { rows: [lead] };
  }

  // 19. Insert Review
  if (lower.includes('insert into mover_reviews')) {
    const rev = {
      id: params[0] || crypto.randomUUID(),
      mover_id: params[1],
      user_name: params[2],
      user_phone: params[3],
      rating: Number(params[4]),
      review_text: params[5],
      status: 'approved',
      created_at: new Date().toISOString()
    };
    mutableReviews.unshift(rev);
    return { rows: [rev] };
  }

  // 20. Update Lead Status
  if (lower.includes('update directory_leads set status =')) {
    const status = params[0];
    const id = params[1];
    const lead = mutableLeads.find(l => l.id === id);
    if (lead) lead.status = status;
    return { rows: [] };
  }

  // 21. Update Mover
  if (lower.includes('update movers set')) {
    const id = params[params.length - 1];

    if (id === 'np-master' || id === 'np' || (typeof id === 'string' && id.startsWith('np-')) || (params[0] && typeof params[0] === 'string' && params[0].toLowerCase().includes('national'))) {
      const updated = {
        name: params[0] || masterNationalProfile.name,
        phone: params[1] || masterNationalProfile.phone,
        email: params[2] || masterNationalProfile.email,
        website_url: params[3] || masterNationalProfile.website_url,
        address_template: params[4] || masterNationalProfile.address_template,
        rating: params[5] !== undefined ? Number(params[5]) : masterNationalProfile.rating,
        review_count: params[6] !== undefined ? Number(params[6]) : masterNationalProfile.review_count,
        established_year: params[10] || masterNationalProfile.established_year,
        fleet_size: params[11] || masterNationalProfile.fleet_size,
        badges: params[12] ? (typeof params[12] === 'string' ? JSON.parse(params[12]) : params[12]) : masterNationalProfile.badges,
        services_offered: params[13] ? (typeof params[13] === 'string' ? JSON.parse(params[13]) : params[13]) : masterNationalProfile.services_offered,
        pricing_table: params[14] ? (typeof params[14] === 'string' ? JSON.parse(params[14]) : params[14]) : masterNationalProfile.pricing_table,
        about_template: params[15] || masterNationalProfile.about_template,
        gallery_images: params[16] ? (typeof params[16] === 'string' ? JSON.parse(params[16]) : params[16]) : masterNationalProfile.gallery_images,
        logo_url: params[17] || masterNationalProfile.logo_url,
        banner_url: params[18] || masterNationalProfile.banner_url
      };
      const resProfile = updateMasterNationalProfile(updated);
      return { rows: [{ ...resProfile, id: 'np-master' }] };
    }

    const mover = mutableMovers.find(m => m.id === id);
    if (mover) {
      if (params[0] !== undefined && params[0] !== null) mover.name = params[0];
      if (params[1] !== undefined && params[1] !== null) mover.phone = params[1];
      if (params[2] !== undefined && params[2] !== null) mover.email = params[2];
      if (params[3] !== undefined && params[3] !== null) mover.website_url = params[3];
      if (params[4] !== undefined && params[4] !== null) mover.address = params[4];
      if (params[5] !== undefined && params[5] !== null) mover.rating = Number(params[5]);
      if (params[6] !== undefined && params[6] !== null) mover.review_count = Number(params[6]);
      if (params[7] !== undefined && params[7] !== null) mover.rank_order = Number(params[7]);
      if (params[8] !== undefined && params[8] !== null) mover.is_verified = params[8] ? 1 : 0;
      if (params[9] !== undefined && params[9] !== null) mover.is_featured = params[9] ? 1 : 0;
      if (params[10] !== undefined && params[10] !== null) mover.established_year = params[10];
      if (params[11] !== undefined && params[11] !== null) mover.fleet_size = params[11];
      if (params[12] !== undefined && params[12] !== null) mover.badges = typeof params[12] === 'string' ? params[12] : JSON.stringify(params[12]);
      if (params[13] !== undefined && params[13] !== null) mover.services_offered = typeof params[13] === 'string' ? params[13] : JSON.stringify(params[13]);
      if (params[14] !== undefined && params[14] !== null) mover.pricing_table = typeof params[14] === 'string' ? params[14] : JSON.stringify(params[14]);
      if (params[15] !== undefined && params[15] !== null) mover.about_text = params[15];
      if (params[16] !== undefined && params[16] !== null) mover.gallery_images = typeof params[16] === 'string' ? params[16] : JSON.stringify(params[16]);
      if (params[17] !== undefined && params[17] !== null) mover.logo_url = params[17];
      if (params[18] !== undefined && params[18] !== null) mover.banner_url = params[18];
      if (params[19] !== undefined && params[19] !== null) mover.is_paid = params[19] ? 1 : 0;
    }
    return { rows: mover ? [{ ...mover }] : [] };
  }

  // 21b. Max rank order query for movers in city
  if (lower.includes('max(rank_order)') && lower.includes('from movers')) {
    const cityId = params[0];
    const cityMovers = mutableMovers.filter(m => m.city_id === cityId);
    let maxRank = 1;
    cityMovers.forEach(m => {
      if (m.rank_order && Number(m.rank_order) > maxRank) maxRank = Number(m.rank_order);
    });
    return { rows: [{ max_rank: maxRank }] };
  }

  // 21c. Insert Mover (from Live Google Crawler or Admin)
  if (lower.includes('insert into movers')) {
    const newMover = {
      id: params[0] || generateId(),
      city_id: params[1],
      name: params[2],
      slug: params[3],
      phone: params[4],
      address: params[5],
      rating: Number(params[6]) || 4.5,
      review_count: Number(params[7]) || 45,
      rank_order: Number(params[8]) || (mutableMovers.length + 1),
      is_verified: 1,
      is_featured: 0,
      badges: typeof params[9] === 'string' ? params[9] : JSON.stringify(params[9] || []),
      services_offered: typeof params[10] === 'string' ? params[10] : JSON.stringify(params[10] || []),
      pricing_table: typeof params[11] === 'string' ? params[11] : JSON.stringify(params[11] || {}),
      established_year: params[12] || '2015',
      fleet_size: params[13] || '12 Vehicles',
      about_text: params[14] || '',
      source: params[15] || 'google_crawler',
      is_paid: 0,
      created_at: new Date().toISOString()
    };
    mutableMovers.push(newMover);
    return { rows: [newMover] };
  }

  // 22. Delete Mover
  if (lower.includes('delete from movers where id =')) {
    const id = params[0];
    mutableMovers = mutableMovers.filter(m => m.id !== id);
    return { rows: [] };
  }

  // 23. Generic fallback
  console.warn('Unhandled query in memory:', norm);
  return { rows: [] };
}

function generateId() {
  try {
    return crypto.randomUUID();
  } catch (_) {
    return `id-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

async function query(text, params = []) {
  if (!connectionAttempted) {
    await testPostgresConnection();
  }

  if (!isUsingSqlite && pgPool) {
    try {
      const res = await pgPool.query(text, params);
      return res;
    } catch (err) {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
        console.warn(`Postgres connection lost (${err.message}), falling back to in-memory engine.`);
        isUsingSqlite = true;
      } else {
        throw err;
      }
    }
  }

  // Execute directly against in-memory indexed JavaScript engine
  return executeInMemoryQuery(text, params);
}

module.exports = {
  query,
  generateId,
  getMasterNationalProfile,
  updateMasterNationalProfile,
};

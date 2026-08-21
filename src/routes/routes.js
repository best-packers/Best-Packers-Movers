const express = require('express');
const router = express.Router();
const { db } = require('../../config/db');

// ─── Helper: Slugify text ─────────────────────────────────────────────────────
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ─── Helper: Get Absolute Canonical Base URL ─────────────────────────────────
function getBaseUrl(req) {
  const host = (req && req.get && req.get('host')) || 'www.bestpackermovers.com';
  // On production or custom domain, enforce https
  if (host.includes('bestpackermovers.com') || host.includes('vercel.app')) {
    return `https://${host}`;
  }
  const proto = (req && req.headers && req.headers['x-forwarded-proto']) || (req && req.protocol) || 'http';
  return `${proto}://${host}`;
}

// ─── National Packers & Movers Config (Single Source of Truth) ────────────────
const NATIONAL_MOVER = {
  id: 0,
  name: "National Packers & Movers",
  slug: "national-packers-movers",
  phone: "+91 98351 68368",
  rating: 4.9,
  reviews_count: 1540,
  status: 'verified',
  website: 'https://www.thenationalpackersmovers.com/',
  is_national: true,
  is_dofollow: true,
  year_founded: 1987,
  logo_url: null,
  banner_url: null,
  about_text: "National Packers & Movers is a premium all-India relocation network operating since 1987. Headquartered in Dhanbad, Jharkhand with regional hubs in Kolkata, Patna, Ranchi, Lucknow, and Singrauli. Fully GST-registered, IBA-approved, and insured. Offering end-to-end household, corporate, industrial, and vehicle relocation services across 600+ cities in India.",
  services: "Household Shifting, Office & Corporate Relocation, Industrial Shifting, Car & Bike Transport, Warehousing & Storage, Transit Insurance, Loading & Unloading, Packing & Unpacking"
};

// ─── SEO Keyword Types (for long-tail pages) ──────────────────────────────────
const KEYWORD_CONFIGS = [
  {
    suffix: 'shifting-services',
    titleFn: (city) => `Shifting Services in ${city.name} | Best Packers & Movers 2026`,
    descFn: (city) => `Looking for reliable shifting services in ${city.name}? Compare verified relocation specialists, get instant quotes, and book doorstep shifting services in ${city.name} starting from Rs.3,500.`,
    h1Fn: (city) => `Shifting Services in ${city.name}`,
  },
  {
    suffix: 'top-packers-and-movers',
    titleFn: (city) => `Top Packers and Movers in ${city.name} 2026 — Verified & Rated`,
    descFn: (city) => `Top-rated packers and movers in ${city.name} for 2026. Read real customer reviews, compare verified companies, and get free shifting quotes from the best movers in ${city.name}.`,
    h1Fn: (city) => `Top Packers and Movers in ${city.name}`,
  },
  {
    suffix: 'house-shifting',
    titleFn: (city) => `House Shifting in ${city.name} — Trusted Household Movers`,
    descFn: (city) => `Book trusted house shifting services in ${city.name}. Our verified household movers in ${city.name} offer safe packing, transit insurance, and doorstep delivery at affordable rates.`,
    h1Fn: (city) => `House Shifting in ${city.name}`,
  },
  {
    suffix: 'cheap-packers-and-movers',
    titleFn: (city) => `Cheap Packers and Movers in ${city.name} — Affordable Shifting`,
    descFn: (city) => `Find affordable and cheap packers and movers in ${city.name}. Compare prices, read reviews, and get the best shifting rate for your budget. Verified movers starting from Rs.3,000.`,
    h1Fn: (city) => `Cheap Packers and Movers in ${city.name}`,
  },
  {
    suffix: 'local-packers-and-movers',
    titleFn: (city) => `Local Packers and Movers in ${city.name} | Same-Day Shifting`,
    descFn: (city) => `Find local packers and movers in ${city.name} for same-day and next-day shifting. Verified local carriers offering fast, affordable household and office relocation in ${city.name}.`,
    h1Fn: (city) => `Local Packers and Movers in ${city.name}`,
  },
];

const KW_SUFFIXES = KEYWORD_CONFIGS.map(k => k.suffix);

// ─── Search Index Data API ────────────────────────────────────────────────────
router.get('/api/search-data', async (req, res) => {
  try {
    const cities = await db('cities').select('name', 'slug');
    const vendors = await db('vendors').where({ is_national: false }).select('name', 'slug', 'city_id');
    const dbCities = await db('cities').select('id', 'slug');
    const cityMap = {};
    dbCities.forEach(c => { cityMap[c.id] = c.slug; });
    const mappedVendors = vendors.map(v => ({
      name: v.name, slug: v.slug, city_slug: cityMap[v.city_id] || ''
    }));
    res.json({ cities, vendors: mappedVendors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Robots.txt ───────────────────────────────────────────────────────────────
router.get('/robots.txt', (req, res) => {
  const base = 'https://www.bestpackermovers.com';
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${base}/sitemap.xml\n`);
});

// ─── Dynamic XML Sitemap ──────────────────────────────────────────────────────
router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const base = 'https://www.bestpackermovers.com';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${base}/blog</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;

    const states = await db('states').select('slug');
    states.forEach(s => {
      xml += `  <url><loc>${base}/state/${s.slug}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>\n`;
    });

    const cities = await db('cities').select('id', 'slug');
    const citySlugMap = {};
    cities.forEach(c => { citySlugMap[c.id] = c.slug; });

    cities.forEach(c => {
      xml += `  <url><loc>${base}/${c.slug}</loc><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
      xml += `  <url><loc>${base}/${c.slug}/national-packers-movers</loc><changefreq>weekly</changefreq><priority>0.85</priority></url>\n`;
      KEYWORD_CONFIGS.forEach(kw => {
        xml += `  <url><loc>${base}/${c.slug}/${kw.suffix}</loc><changefreq>weekly</changefreq><priority>0.75</priority></url>\n`;
      });
    });

    const vendors = await db('vendors').where({ is_national: false }).select('slug', 'city_id');
    vendors.forEach(v => {
      const cs = citySlugMap[v.city_id];
      if (cs) xml += `  <url><loc>${base}/${cs}/${v.slug}</loc><changefreq>weekly</changefreq><priority>0.6</priority></url>\n`;
    });

    try {
      const blogs = await db('blog_posts').where({ is_published: true }).select('slug');
      blogs.forEach(b => {
        xml += `  <url><loc>${base}/blog/${b.slug}</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>\n`;
      });
    } catch(e) { /* blog table not yet created */ }

    xml += `</urlset>`;
    res.header('Content-Type', 'application/xml');
    return res.status(200).send(xml);
  } catch (error) { next(error); }
});

// ─── 1. Landing Homepage ──────────────────────────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const states = await db('states').select('*');
    const cities = await db('cities')
      .join('states', 'cities.state_id', '=', 'states.id')
      .select('cities.*', 'states.name as state_name', 'states.slug as state_slug');

    let latestBlogs = [];
    try {
      latestBlogs = await db('blog_posts')
        .where({ is_published: true })
        .orderBy('created_at', 'desc')
        .limit(3)
        .select('title', 'slug', 'excerpt', 'category', 'cover_image_url', 'read_time_mins', 'created_at');
    } catch(e) { /* blog table may not exist yet */ }

    const base = getBaseUrl(req);
    res.render('index', {
      metaTitle: "Best Packers and Movers in India — Compare Top Relocation Providers",
      metaDescription: "Find verified local and national shifting services in India. Get instant quotes, check customer ratings, and book top-rated movers. Trusted directory for 2026.",
      metaKeywords: "packers and movers, best packers and movers, shifting services india, relocation services, movers directory india",
      canonicalUrl: `${base}/`,
      ogImage: `${base}/images/og-home.jpg`,
      states, cities, latestBlogs,
      currentYear: new Date().getFullYear()
    });
  } catch (error) { next(error); }
});

// ─── 2. State Pages ───────────────────────────────────────────────────────────
router.get('/state/:state_slug', async (req, res, next) => {
  const { state_slug } = req.params;
  try {
    const state = await db('states').where({ slug: state_slug }).first();
    if (!state) return res.status(404).render('404', { message: "State not found" });
    const cities = await db('cities').where({ state_id: state.id }).select('*');
    const base = getBaseUrl(req);

    const schemaMarkup = `<script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "${base}"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "${state.name} Packers",
          "item": "${base}/state/${state.slug}"
        }
      ]
    }
    </script>`;

    res.render('state', {
      metaTitle: `Best Packers and Movers in ${state.name} | Verified Relocation Providers 2026`,
      metaDescription: `Directory of top-rated packers and movers in ${state.name}. Compare ${cities.length} verified shifting companies across ${state.name}. Get free quotes today.`,
      metaKeywords: `packers and movers ${state.name}, shifting services ${state.name}, movers ${state.name}`,
      canonicalUrl: `${base}/state/${state.slug}`,
      ogImage: `${base}/images/og-home.jpg`,
      schemaMarkup,
      state, cities, currentYear: new Date().getFullYear()
    });
  } catch (error) { next(error); }
});

// ─── 3. Quote Lead API ────────────────────────────────────────────────────────
router.post('/api/quote', async (req, res) => {
  const { vendor_id, moving_from, moving_to, moving_date, phone } = req.body;
  if (!moving_from || !moving_to || !phone) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  try {
    const cleanVendorId = vendor_id && vendor_id !== '0' ? parseInt(vendor_id, 10) : null;
    await db('leads').insert({
      vendor_id: cleanVendorId,
      moving_from: moving_from.trim(),
      moving_to: moving_to.trim(),
      moving_date: moving_date || null,
      phone: phone.trim()
    });
    return res.json({ success: true, message: 'Your quote request has been received! Our representative will contact you shortly.' });
  } catch (error) {
    console.error('Error saving lead:', error);
    return res.status(500).json({ success: false, message: 'An internal error occurred. Please try again.' });
  }
});

// ─── 4. OTP Auth APIs (v2.2) ──────────────────────────────────────────────────
router.post('/api/otp/send', async (req, res) => {
  const { phone } = req.body;
  if (!phone || !/^\d{10}$/.test(phone)) {
    return res.status(400).json({ success: false, message: 'Invalid 10-digit phone number.' });
  }
  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otpCode = code;
    req.session.otpPhone = phone;

    // TODO: Replace this with a real SMS provider (MSG91, Fast2SMS, Twilio)
    // For development, the OTP is logged to server console only - never sent in API response
    console.log(`\n========================================`);
    console.log(`[SMS OTP SANDBOX] Code for ${phone}: ${code}`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: 'A verification code has been sent to your phone number.'
      // NOTE: otpSandboxValue intentionally removed for security
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/api/otp/verify', async (req, res) => {
  const { phone, code, gps_locality } = req.body;
  if (!phone || !code) {
    return res.status(400).json({ success: false, message: 'Phone and verification code are required.' });
  }
  
  if (req.session.otpPhone !== phone || req.session.otpCode !== code) {
    return res.status(400).json({ success: false, message: 'Incorrect verification code. Please try again.' });
  }

  try {
    const ip = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
    const ua = req.headers['user-agent'] || '';
    const deviceType = ua.toLowerCase().includes('mobi') || ua.toLowerCase().includes('android') || ua.toLowerCase().includes('iphone') ? 'Mobile' : 'Desktop';
    
    let city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : 'Unknown';
    let state = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : 'Unknown';
    
    if (city === 'Unknown') {
      if (ip === '::1' || ip === '127.0.0.1') {
        city = 'Localhost';
        state = 'Development';
      } else {
        try {
          const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
          const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
          const geoData = await geoRes.json();
          if (geoData && geoData.status === 'success') {
            city = geoData.city || city;
            state = geoData.regionName || state;
          }
        } catch(e) {}
      }
    }

    const locality = gps_locality ? gps_locality.trim() : null;

    const [sessionIdObj] = await db('user_sessions').insert({
      phone: phone.trim(),
      ip_address: ip,
      device_type: deviceType,
      state,
      city,
      locality
    }).returning('id');
    const sessionId = typeof sessionIdObj === 'object' ? sessionIdObj.id : sessionIdObj;

    req.session.userId = sessionId;
    req.session.userPhone = phone.trim();
    req.session.locality = locality;
    req.session.city = city;
    req.session.state = state;

    delete req.session.otpCode;
    delete req.session.otpPhone;

    return res.json({ success: true, message: 'Verified successfully!', phone });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({ success: false, message: 'Verification error.' });
  }
});

router.post('/api/log-action', async (req, res) => {
  const { action_type, vendor_id, target_url } = req.body;
  if (!action_type || !req.session.userPhone) {
    return res.status(400).json({ success: false, message: 'Login session required.' });
  }
  try {
    await db('user_actions').insert({
      session_id: req.session.userId || null,
      phone: req.session.userPhone,
      action_type: action_type,
      vendor_id: vendor_id ? parseInt(vendor_id, 10) : null,
      target_url: target_url || null
    });
    return res.json({ success: true });
  } catch (error) {
    console.error('Action log error:', error);
    return res.status(500).json({ success: false });
  }
});

// ─── 4B. Review API ───────────────────────────────────────────────────────────
router.post('/api/review', async (req, res) => {
  const { vendor_id, city_id, customer_name, rating, review_text } = req.body;
  if (!req.session.userPhone) {
    return res.status(401).json({ success: false, message: 'Verification required to submit reviews.' });
  }
  if (!vendor_id || !customer_name || !rating) {
    return res.status(400).json({ success: false, message: 'Please fill in all required fields.' });
  }
  const parsedRating = parseInt(rating, 10);
  if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }
  try {
    const vId = parseInt(vendor_id, 10);
    const cId = city_id ? parseInt(city_id, 10) : null;
    const uId = req.session.userId || null;

    let vendorName = 'National Packers & Movers';
    if (vId !== 0) {
      const vendor = await db('vendors').where({ id: vId }).first();
      if (!vendor) return res.status(404).json({ success: false, message: 'Business listing not found.' });
      vendorName = vendor.name;
    }

    // Check if logged-in user already posted a review for this vendor
    let existingReview = null;
    if (uId) {
      existingReview = await db('reviews').where({ vendor_id: vId, user_id: uId }).first();
    }

    if (existingReview) {
      // UPDATE existing customer review
      await db('reviews').where({ id: existingReview.id }).update({
        customer_name: customer_name.trim(),
        rating: parsedRating,
        review_text: (review_text || '').trim()
      });
    } else {
      // INSERT new review
      await db('reviews').insert({
        vendor_id: vId,
        city_id: cId,
        customer_name: customer_name.trim(),
        rating: parsedRating,
        review_text: (review_text || '').trim(),
        user_id: uId
      });
    }

    await db('user_actions').insert({
      session_id: uId,
      phone: req.session.userPhone,
      action_type: existingReview ? 'edit_review' : 'review',
      vendor_id: vId,
      target_url: `/vendor/profile/${vId}`
    });

    if (vId !== 0) {
      const stats = await db('reviews').where({ vendor_id: vId }).avg('rating as avg_rating').count('id as count');
      const newAvgRating = parseFloat(parseFloat(stats[0].avg_rating || 0).toFixed(1));
      const newCount = parseInt(stats[0].count || 0, 10);
      await db('vendors').where({ id: vId }).update({ rating: newAvgRating, reviews_count: newCount });
      return res.json({ success: true, message: existingReview ? 'Your review has been updated!' : 'Review published successfully!', new_rating: newAvgRating, new_count: newCount });
    }

    return res.json({ success: true, message: existingReview ? 'Your review has been updated!' : 'Review published successfully!' });
  } catch (error) {
    console.error('Error saving review:', error);
    return res.status(500).json({ success: false, message: 'Error processing review.' });
  }
});

// ─── 5. Blog Listing Page ─────────────────────────────────────────────────────
router.get('/blog', async (req, res, next) => {
  const base = getBaseUrl(req);
  try {
    const category = req.query.category || 'all';
    let query = db('blog_posts').where({ is_published: true }).orderBy('created_at', 'desc');
    if (category !== 'all') query = query.where({ category });
    const blogs = await query.select('*');
    const categories = await db('blog_posts').where({ is_published: true }).distinct('category').pluck('category');
    res.render('blog', {
      metaTitle: "Shifting Tips & Relocation Guides | BestPackersMovers Blog",
      metaDescription: "Expert advice on household shifting, office relocation, packing tips, and moving guides from India's most trusted packers and movers directory.",
      metaKeywords: "packers movers blog, shifting tips, relocation guide, moving advice india",
      canonicalUrl: `${base}/blog`,
      ogImage: `${base}/images/og-home.jpg`,
      blogs, categories, selectedCategory: category,
      currentYear: new Date().getFullYear()
    });
  } catch (error) {
    res.render('blog', {
      metaTitle: "Shifting Tips & Relocation Guides | BestPackersMovers Blog",
      metaDescription: "Expert shifting tips and relocation guides for India.",
      metaKeywords: "packers movers blog, shifting tips",
      canonicalUrl: `${base}/blog`,
      ogImage: `${base}/images/og-home.jpg`,
      blogs: [], categories: [], selectedCategory: 'all',
      currentYear: new Date().getFullYear()
    });
  }
});

// ─── 6. Individual Blog Post ──────────────────────────────────────────────────
router.get('/blog/:slug', async (req, res, next) => {
  const base = getBaseUrl(req);
  try {
    const { slug } = req.params;
    const blog = await db('blog_posts').where({ slug, is_published: true }).first();
    if (!blog) return res.status(404).render('404', { message: "Blog post not found" });
    const related = await db('blog_posts')
      .where({ is_published: true, category: blog.category })
      .whereNot({ id: blog.id })
      .limit(3)
      .select('title', 'slug', 'excerpt', 'cover_image_url', 'created_at');
    res.render('blog-post', {
      metaTitle: `${blog.title} | BestPackersMovers Blog`,
      metaDescription: blog.excerpt,
      metaKeywords: blog.meta_keywords || 'packers movers guide, relocation tips india',
      canonicalUrl: `${base}/blog/${blog.slug}`,
      ogImage: blog.cover_image_url || `${base}/images/og-home.jpg`,
      blog, related, currentYear: new Date().getFullYear()
    });
  } catch (error) { next(error); }
});

// ─── Dynamic Pricing & FAQ Generators (v2.9) ──────────────────────────────────
function generateCityPricing(cityName) {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const factor = Math.abs(hash % 10);

  const local = [
    { type: '1 BHK Shifting', d5: `₹${(3000 + factor * 100).toLocaleString('en-IN')} - ₹${(5000 + factor * 150).toLocaleString('en-IN')}`, d10: `₹${(5000 + factor * 100).toLocaleString('en-IN')} - ₹${(8000 + factor * 200).toLocaleString('en-IN')}`, d30: `₹${(6000 + factor * 150).toLocaleString('en-IN')} - ₹${(10000 + factor * 250).toLocaleString('en-IN')}`, d50: `₹${(8000 + factor * 200).toLocaleString('en-IN')} - ₹${(12000 + factor * 300).toLocaleString('en-IN')}` },
    { type: '2 BHK Shifting', d5: `₹${(4000 + factor * 120).toLocaleString('en-IN')} - ₹${(8000 + factor * 200).toLocaleString('en-IN')}`, d10: `₹${(6000 + factor * 150).toLocaleString('en-IN')} - ₹${(10000 + factor * 250).toLocaleString('en-IN')}`, d30: `₹${(8000 + factor * 200).toLocaleString('en-IN')} - ₹${(13000 + factor * 300).toLocaleString('en-IN')}`, d50: `₹${(11000 + factor * 250).toLocaleString('en-IN')} - ₹${(16000 + factor * 400).toLocaleString('en-IN')}` },
    { type: '3 BHK Shifting', d5: `₹${(5000 + factor * 150).toLocaleString('en-IN')} - ₹${(10000 + factor * 300).toLocaleString('en-IN')}`, d10: `₹${(7000 + factor * 200).toLocaleString('en-IN')} - ₹${(12000 + factor * 350).toLocaleString('en-IN')}`, d30: `₹${(10000 + factor * 250).toLocaleString('en-IN')} - ₹${(16000 + factor * 400).toLocaleString('en-IN')}`, d50: `₹${(14000 + factor * 300).toLocaleString('en-IN')} - ₹${(22000 + factor * 500).toLocaleString('en-IN')}` },
    { type: '4 BHK Shifting', d5: `₹${(7000 + factor * 200).toLocaleString('en-IN')} - ₹${(12000 + factor * 400).toLocaleString('en-IN')}`, d10: `₹${(9000 + factor * 250).toLocaleString('en-IN')} - ₹${(15000 + factor * 450).toLocaleString('en-IN')}`, d30: `₹${(13000 + factor * 300).toLocaleString('en-IN')} - ₹${(20000 + factor * 500).toLocaleString('en-IN')}`, d50: `₹${(18000 + factor * 400).toLocaleString('en-IN')} - ₹${(28000 + factor * 700).toLocaleString('en-IN')}` }
  ];

  const domestic = [
    { dist: 'Up to 400 KM', cost1BHK: `₹${(4000 + factor * 100).toLocaleString('en-IN')} - ₹${(12000 + factor * 300).toLocaleString('en-IN')}`, cost2BHK: `₹${(6000 + factor * 150).toLocaleString('en-IN')} - ₹${(18000 + factor * 400).toLocaleString('en-IN')}`, cost3BHK: `₹${(8000 + factor * 200).toLocaleString('en-IN')} - ₹${(24000 + factor * 500).toLocaleString('en-IN')}`, cost4BHK: `₹${(12000 + factor * 300).toLocaleString('en-IN')} - ₹${(32000 + factor * 700).toLocaleString('en-IN')}` },
    { dist: '400 - 800 KM', cost1BHK: `₹${(6000 + factor * 150).toLocaleString('en-IN')} - ₹${(18000 + factor * 400).toLocaleString('en-IN')}`, cost2BHK: `₹${(9000 + factor * 200).toLocaleString('en-IN')} - ₹${(25000 + factor * 500).toLocaleString('en-IN')}`, cost3BHK: `₹${(12000 + factor * 250).toLocaleString('en-IN')} - ₹${(32000 + factor * 600).toLocaleString('en-IN')}`, cost4BHK: `₹${(16000 + factor * 400).toLocaleString('en-IN')} - ₹${(42000 + factor * 900).toLocaleString('en-IN')}` },
    { dist: '800 - 1300 KM', cost1BHK: `₹${(8000 + factor * 200).toLocaleString('en-IN')} - ₹${(22000 + factor * 500).toLocaleString('en-IN')}`, cost2BHK: `₹${(11000 + factor * 250).toLocaleString('en-IN')} - ₹${(30000 + factor * 600).toLocaleString('en-IN')}`, cost3BHK: `₹${(15000 + factor * 300).toLocaleString('en-IN')} - ₹${(38000 + factor * 800).toLocaleString('en-IN')}`, cost4BHK: `₹${(20000 + factor * 500).toLocaleString('en-IN')} - ₹${(50000 + factor * 1100).toLocaleString('en-IN')}` },
    { dist: '1300 - 1500 KM', cost1BHK: `₹${(10000 + factor * 250).toLocaleString('en-IN')} - ₹${(26000 + factor * 600).toLocaleString('en-IN')}`, cost2BHK: `₹${(13000 + factor * 300).toLocaleString('en-IN')} - ₹${(35000 + factor * 700).toLocaleString('en-IN')}`, cost3BHK: `₹${(18000 + factor * 400).toLocaleString('en-IN')} - ₹${(45000 + factor * 900).toLocaleString('en-IN')}`, cost4BHK: `₹${(24000 + factor * 600).toLocaleString('en-IN')} - ₹${(60000 + factor * 1300).toLocaleString('en-IN')}` }
  ];

  return { local, domestic };
}

function generateCityFAQs(cityName, stateName, pricing) {
  let hash = 0;
  for (let i = 0; i < cityName.length; i++) {
    hash = cityName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % 3;

  const pool1 = [
    {
      q: `What is the estimated cost of hiring packers and movers in ${cityName}?`,
      a: `Local packing and shifting in ${cityName} typically starts from ₹3,000 for a standard 1 BHK up to 5 KM, and can go up to ₹28,000 for a large 4 BHK shifting up to 50 KM. Domestic shifting costs start from ₹4,000 for shorter runs under 400 KM and can scale up to ₹60,000 for longer transit lines up to 1500 KM, depending on load volume and carrier options chosen.`
    },
    {
      q: `How much do packing and moving services cost in ${cityName}?`,
      a: `For relocations within ${cityName}, standard charges range between ₹3,000 and ₹12,000 for local 1-2 BHK apartments. Shifting a larger 3 BHK or 4 BHK home across ${stateName} or interstate lines will average between ₹8,000 and ₹60,000 depending on transport mileage and packaging quality.`
    },
    {
      q: `What are the average rates for home shifting in ${cityName}?`,
      a: `Relocation rates in ${cityName} vary by size: a 1 BHK shifting ranges from ₹3,000 to ₹10,000 locally; a 2 BHK costs between ₹4,000 and ₹16,000; and larger household goods relocation routes can reach ₹28,000 for local or up to ₹60,000 for long-distance transport.`
    }
  ];

  const pool2 = [
    {
      q: `How can I verify the credibility of relocation companies in ${cityName}?`,
      a: `To verify a shifting carrier in ${cityName}, always ask for their physical office address, official government registrations (GST number, PAN card, Trade License), and compare active reviews on neutral platforms. BestPackers simplifies this by indexing verified service reviews and displaying a digital badge for certified providers.`
    },
    {
      q: `What is the best way to choose verified movers in ${cityName}?`,
      a: `Ensure safety by checking the provider's physical location in the ${cityName} municipal area. Request copies of their active GST details and business registration certificates. Checking customer references and booking through verified directory platforms like BestPackers protects your goods against transit scams.`
    },
    {
      q: `How do I avoid fraud packers and movers in ${cityName}?`,
      a: `Avoid hidden traps by rejecting low-ball estimations that look suspicious. Inspect the company's local warehouse infrastructure in ${cityName} and check customer review feedback. Booking certified partners on BestPackers ensures transparent contracts and verified vehicle drivers.`
    }
  ];

  const pool3 = [
    {
      q: `Are there hidden charges associated with packing and moving services?`,
      a: `No reputable packer will hide charges. Standard quotes include packing materials, labor, loading, transport tolls, and unloading. However, additional charges may apply for toll gates, heavy structural items (e.g., pianos, heavy safes), climbing floors without elevators, or transit cargo insurance (usually 2% of the declared value). Always get a written quotation before shifting.`
    },
    {
      q: `What extra costs might apply during a home shift in ${cityName}?`,
      a: `Relocation quotes generally cover packing, labor, and fuel. However, check if you will be billed extra for cargo transit insurance (standard 2% fee), high-rise access fees if elevator access is denied, municipal parking entry charges, or specialized packaging for premium furniture items.`
    },
    {
      q: `Should I expect any unexpected surcharges during relocation?`,
      a: `To prevent unexpected fees, confirm that the shifting quotation explicitly states it is all-inclusive. Extra fees only arise under special circumstances, such as carrying loads over long distances by hand if truck access is blocked, toll tax increases, or opting for premium bubble-wrap layers.`
    }
  ];

  const pool4 = [
    {
      q: `How can I minimize my total relocation expenses in ${cityName}?`,
      a: `You can reduce expenses by decluttering unwanted items before getting a quote, scheduling your shifting on weekdays or mid-month when carrier rates are lowest, packing smaller household items yourself, and comparing at least 3 verified shifting quotes on BestPackers.`
    },
    {
      q: `What is the cheapest way to shift houses in ${cityName}?`,
      a: `Save on relocation costs by sorting through old items and discarding what you don't need, booking your moving dates during low-demand mid-week cycles, and sourcing quotes from local verified carriers on BestPackers to avoid middleman margins.`
    },
    {
      q: `How can I get the best rates for packers and movers?`,
      a: `Get lower rates by comparing multiple detailed quotes. Inform the shifting companies that you are reviewing competitive bids. Booking your move at least 10 days in advance and handling simple packing tasks (like clothes and books) yourself will significantly drop the service cost.`
    }
  ];

  // Select templates deterministically based on hash index to guarantee diversity
  return [
    pool1[idx],
    pool2[(idx + 1) % 3],
    pool3[(idx + 2) % 3],
    pool4[idx]
  ];
}

function generateVendorFAQs(vendor, city, state, pricing) {
  let hash = 0;
  const nameToHash = vendor.name + city.name;
  for (let i = 0; i < nameToHash.length; i++) {
    hash = nameToHash.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % 3;
  const ratingText = vendor.rating ? `rated ${vendor.rating}/5 stars based on customer ratings` : 'highly rated by local customers';

  const pool1 = [
    {
      q: `Does ${vendor.name} provide local shifting services within ${city.name}?`,
      a: `Yes, ${vendor.name} offers comprehensive local relocation services within ${city.name} and surrounding areas. Their services include safe packaging, loading, vehicle transport, and unloading. Their local operations cover transit routes through major regional expressways and checkpoints.`
    },
    {
      q: `What shifting services does ${vendor.name} specialize in at ${city.name}?`,
      a: `In the ${city.name} district, ${vendor.name} specializes in household shifting, office relocations, loading transport, and unpacking. Their fleet handles both small local moves and long-haul interstate transit safely.`
    },
    {
      q: `Can I hire ${vendor.name} for office and corporate relocation in ${city.name}?`,
      a: `Absolutely. ${vendor.name} provides commercial office packing, IT setup shifting, and industrial machinery moves in ${city.name}. They handle loading tasks outside business hours to minimize corporate downtime.`
    }
  ];

  const pool2 = [
    {
      q: `What is the verified address of ${vendor.name} in ${city.name}?`,
      a: `${vendor.name} is headquartered at: ${vendor.address || `Serving clients locally in ${city.name}, ${state ? state.name : ''}`}. They maintain direct logistics hubs and verified operations units to handle premium domestic household cargo movements.`
    },
    {
      q: `Where is ${vendor.name}'s local office located?`,
      a: `Their verified local branch operates at: ${vendor.address || `Serving ${city.name} and nearby districts`}. You can visit their branch office to inspect packing materials or verify transit insurance documents.`
    },
    {
      q: `How do I locate the physical warehouse of ${vendor.name} in ${city.name}?`,
      a: `Their registered hub is situated at: ${vendor.address}. This location acts as their central dispatch yard, housing their transport fleets and secure storage warehouse units.`
    }
  ];

  const pool3 = [
    {
      q: `Why should I book ${vendor.name} for my next relocation on BestPackers?`,
      a: `${vendor.name} is ${ratingText} in ${city.name}. They are vetted by our platform for credentials and service history. By requesting quotes through BestPackers, you bypass untrusted middlemen, lock in authentic carrier pricing, and benefit from structured transit tracking.`
    },
    {
      q: `Is ${vendor.name} a verified and trusted shifting partner?`,
      a: `Yes. BestPackers has validated their business registration details and customer reviews. Under rating logs, they hold an average rating of ${vendor.rating || 4.5}/5, ensuring reliable moving support for local residents.`
    },
    {
      q: `What makes ${vendor.name} different from other movers in ${city.name}?`,
      a: `${vendor.name} stands out for their high service score of ${vendor.rating || 4.5}/5. Their packing crews are trained for high-rise elevator relocations, narrow lane cargo packing, and delicate glass transport safety.`
    }
  ];

  const pool4 = [
    {
      q: `How do I contact ${vendor.name} for pricing and bookings?`,
      a: `You can easily reach out to ${vendor.name} by clicking their verified contact number: ${vendor.phone || '+91 98351 68368'} on their profile page, or by submitting your requirements in the free Instant Quote estimation form inside their listing sidebar.`
    },
    {
      q: `What is the telephone support line of ${vendor.name}?`,
      a: `You can call their logistics desk at ${vendor.phone || '+91 98351 68368'}. They offer free consultations, transit quote calculations, and scheduling services over the phone.`
    },
    {
      q: `Can I request a callback from ${vendor.name} online?`,
      a: `Yes, you can request a callback by entering your pickup and delivery parameters in their profile listing page quote forms. Verified managers will contact you within 15 minutes.`
    }
  ];

  return [
    pool1[idx],
    pool2[(idx + 1) % 3],
    pool3[(idx + 2) % 3],
    pool4[idx]
  ];
}

// ─── 7. City Page Renderer (shared logic) ─────────────────────────────────────
async function renderCityPage(req, res, next, city, state, overrides = {}) {
  const base = getBaseUrl(req);
  const page = parseInt(req.query.page, 10) || 1;
  const limit = 15;
  const offset = (page - 1) * limit;

  const countResult = await db('vendors').where({ city_id: city.id, is_national: false }).count('* as count').first();
  const count = parseInt(countResult.count, 10);
  const totalPages = Math.ceil(count / limit) || 1;

  const competitors = await db('vendors')
    .where({ city_id: city.id, is_national: false })
    .orderBy('google_rank', 'asc').orderBy('id', 'asc')
    .limit(limit).offset(offset).select('*');

  const globalMover = await db('vendors').where({ id: 0 }).first() || await db('vendors').where({ is_national: true }).first();
  const dbMover = await db('vendors').where({ slug: 'national-packers-movers', city_id: city.id }).first();

  const nationalMover = {
    ...NATIONAL_MOVER,
    name: (globalMover && globalMover.name) ? globalMover.name : NATIONAL_MOVER.name,
    phone: (globalMover && globalMover.phone) ? globalMover.phone : NATIONAL_MOVER.phone,
    website: (globalMover && globalMover.website) ? globalMover.website : NATIONAL_MOVER.website,
    address: (globalMover && globalMover.address) ? globalMover.address : (dbMover && dbMover.address ? dbMover.address : `Pan-India Relocation Hub — Serving ${city.name} & Surrounding Districts`),
    logo_url: (globalMover && globalMover.logo_url) ? globalMover.logo_url : (dbMover && dbMover.logo_url ? dbMover.logo_url : NATIONAL_MOVER.logo_url),
    banner_url: (globalMover && globalMover.banner_url) ? globalMover.banner_url : (dbMover && dbMover.banner_url ? dbMover.banner_url : NATIONAL_MOVER.banner_url),
    about_text: (globalMover && globalMover.about_text) ? globalMover.about_text : (dbMover && dbMover.about_text ? dbMover.about_text : NATIONAL_MOVER.about_text),
    services: (globalMover && globalMover.services) ? globalMover.services : (dbMover && dbMover.services ? dbMover.services : NATIONAL_MOVER.services),
    timings: (globalMover && globalMover.timings) ? globalMover.timings : (dbMover && dbMover.timings ? dbMover.timings : '9:00 AM - 8:00 PM'),
    year_founded: (globalMover && globalMover.year_founded) ? globalMover.year_founded : (dbMover && dbMover.year_founded ? dbMover.year_founded : 1987),
    is_dofollow: globalMover ? !!globalMover.is_dofollow : true,
    id: dbMover ? dbMover.id : 0
  };

  const displayVendors = page === 1 ? [nationalMover, ...competitors] : competitors;

  let cityGallery = [];
  try { cityGallery = await db('gallery_images').where({ city_id: city.id }).orderBy('sort_order', 'asc').limit(6); } catch(e) {}

  let sidebarBlogs = [];
  try { sidebarBlogs = await db('blog_posts').where({ is_published: true }).orderBy('created_at', 'desc').limit(2).select('title', 'slug', 'excerpt', 'cover_image_url'); } catch(e) {}

  // Generate Breadcrumb and ItemList JSON-LD Schemas for City Directory Page
  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": base
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `${state.name} Packers`,
        "item": `${base}/state/${state.slug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": `${city.name} Shifting`,
        "item": `${base}/${city.slug}`
      }
    ]
  };

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `Packers and Movers in ${city.name}`,
    "description": `List of top-rated verified relocation providers in ${city.name}, ${state.name}.`,
    "numberOfItems": displayVendors.length,
    "itemListElement": displayVendors.map((vendor, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "LocalBusiness",
        "name": vendor.name,
        "image": vendor.logo_url || `${base}/images/og-home.jpg`,
        "telephone": vendor.phone || "+91 98351 68368",
        "url": `${base}/${city.slug}/${vendor.slug}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": vendor.address,
          "addressLocality": city.name,
          "addressRegion": state.name,
          "addressCountry": "IN"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": vendor.rating || 4.5,
          "reviewCount": vendor.reviews_count || 10
        }
      }
    }))
  };

  const pricing = generateCityPricing(city.name);
  const faqs = generateCityFAQs(city.name, state.name, pricing);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(item => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": item.a
      }
    }))
  };

  const schemaMarkup = `<script type="application/ld+json">
  ${JSON.stringify(breadcrumbList, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(itemList, null, 2)}
  </script>
  <script type="application/ld+json">
  ${JSON.stringify(faqSchema, null, 2)}
  </script>`;

  const canonical = overrides.canonical || (page > 1 ? `${base}/${city.slug}?page=${page}` : `${base}/${city.slug}`);

  res.render('city', {
    metaTitle: overrides.title || city.custom_meta_title || `Best Packers and Movers in ${city.name} for 2026 — Rated & Compared`,
    metaDescription: overrides.description || city.custom_meta_description || `Looking for top shifting services in ${city.name}? We reviewed over ${count + 1} vendors based on reviews, rates, and track records. Compare and get free quotes today.`,
    metaKeywords: overrides.keywords || city.custom_keywords || `packers and movers ${city.name}, shifting services ${city.name}, movers ${city.name}, relocation ${city.name}`,
    canonicalUrl: canonical,
    ogImage: `${base}/images/og-home.jpg`,
    pageH1: overrides.h1 || `Top-Rated Packers & Movers in ${city.name}`,
    pageDescription: overrides.description || city.custom_meta_description || `Finding reliable shifting services in ${city.name} can be stressful. We analyzed over ${count + 1} logistics providers based on customer reviews, fleet capacity, and track records to bring you the top-rated choices in ${city.name} for 2026.`,
    schemaMarkup,
    city, state, vendors: displayVendors, page, totalPages,
    totalCount: count + 1, limit, cityGallery, sidebarBlogs,
    pricing, faqs,
    currentYear: new Date().getFullYear()
  });
}

// ─── 8. City Directory Page ───────────────────────────────────────────────────
router.get('/:city_slug', async (req, res, next) => {
  const { city_slug } = req.params;
  if (city_slug.includes('.') || city_slug === 'favicon.ico' || city_slug === 'admin') return next();
  try {
    const city = await db('cities').where({ slug: city_slug }).first();
    if (!city) return next();
    const state = await db('states').where({ id: city.state_id }).first();
    await renderCityPage(req, res, next, city, state);
  } catch (error) { next(error); }
});

// ─── 9. Keyword Variant City Pages ───────────────────────────────────────────
KEYWORD_CONFIGS.forEach(kw => {
  router.get(`/:city_slug/${kw.suffix}`, async (req, res, next) => {
    const { city_slug } = req.params;
    try {
      const city = await db('cities').where({ slug: city_slug }).first();
      if (!city) return next();
      const state = await db('states').where({ id: city.state_id }).first();
      await renderCityPage(req, res, next, city, state, {
        title: kw.titleFn(city),
        description: kw.descFn(city),
        keywords: `${kw.suffix.replace(/-/g,' ')} ${city.name}, packers movers ${city.name}`,
        h1: kw.h1Fn(city),
        canonical: `${getBaseUrl(req)}/${city.slug}/${kw.suffix}`
      });
    } catch (error) { next(error); }
  });
});

// ─── 10. Vendor Profile Pages ─────────────────────────────────────────────────
router.get('/:city_slug/:vendor_slug', async (req, res, next) => {
  const { city_slug, vendor_slug } = req.params;
  if (KW_SUFFIXES.includes(vendor_slug)) return next();

  const base = getBaseUrl(req);
  try {
    const city = await db('cities').where({ slug: city_slug }).first();
    if (!city) return next();

    let vendor;
    let dbVendor = null;
    let globalVendor = null;

    if (vendor_slug === 'national-packers-movers') {
      globalVendor = await db('vendors').where({ id: 0 }).first() || await db('vendors').where({ is_national: true }).first();
      dbVendor = await db('vendors').where({ slug: 'national-packers-movers', city_id: city.id }).first();

      vendor = {
        ...NATIONAL_MOVER,
        name: (globalVendor && globalVendor.name) ? globalVendor.name : NATIONAL_MOVER.name,
        phone: (globalVendor && globalVendor.phone) ? globalVendor.phone : NATIONAL_MOVER.phone,
        website: (globalVendor && globalVendor.website) ? globalVendor.website : NATIONAL_MOVER.website,
        address: (globalVendor && globalVendor.address) ? globalVendor.address : (dbVendor && dbVendor.address ? dbVendor.address : `Pan-India Hub — Serving ${city.name}, ${city.name} District & Surrounding Areas`),
        logo_url: (globalVendor && globalVendor.logo_url) ? globalVendor.logo_url : (dbVendor && dbVendor.logo_url ? dbVendor.logo_url : NATIONAL_MOVER.logo_url),
        banner_url: (globalVendor && globalVendor.banner_url) ? globalVendor.banner_url : (dbVendor && dbVendor.banner_url ? dbVendor.banner_url : NATIONAL_MOVER.banner_url),
        about_text: (globalVendor && globalVendor.about_text) ? globalVendor.about_text : (dbVendor && dbVendor.about_text ? dbVendor.about_text : NATIONAL_MOVER.about_text),
        services: (globalVendor && globalVendor.services) ? globalVendor.services : (dbVendor && dbVendor.services ? dbVendor.services : NATIONAL_MOVER.services),
        timings: (globalVendor && globalVendor.timings) ? globalVendor.timings : (dbVendor && dbVendor.timings ? dbVendor.timings : '9:00 AM - 8:00 PM'),
        year_founded: (globalVendor && globalVendor.year_founded) ? globalVendor.year_founded : (dbVendor && dbVendor.year_founded ? dbVendor.year_founded : 1987),
        is_dofollow: globalVendor ? !!globalVendor.is_dofollow : true,
        id: dbVendor ? dbVendor.id : 0
      };
    } else {
      vendor = await db('vendors').where({ slug: vendor_slug, city_id: city.id }).first();
    }
    if (!vendor) return res.status(404).render('404', { message: "Vendor profile not found" });

    let reviews = [];
    if (vendor_slug === 'national-packers-movers') {
      reviews = await db('reviews').where({ vendor_id: 0, city_id: city.id }).orderBy('created_at', 'desc');
      
      // Calculate dynamic ratings count and average rating for National Packers in this city
      const stats = await db('reviews').where({ vendor_id: 0, city_id: city.id }).avg('rating as avg_rating').count('id as count').first();
      const dbCount = parseInt(stats ? stats.count : 0, 10);
      const dbAvg = parseFloat(stats ? (stats.avg_rating || 0) : 0);
      
      const baseCount = 1540;
      const baseRating = 4.9;
      
      vendor.reviews_count = baseCount + dbCount;
      vendor.rating = parseFloat((((baseRating * baseCount) + (dbAvg * dbCount)) / vendor.reviews_count).toFixed(1));
    } else {
      reviews = await db('reviews').where({ vendor_id: vendor.id }).orderBy('created_at', 'desc');
    }

    let vendorGallery = [];
    try {
      if (vendor_slug === 'national-packers-movers') {
        const localVendorId = dbVendor ? dbVendor.id : null;
        // Fetch gallery images matching global vendor (0/null) or local vendor ID
        // AND city-specific (city.id) or global (null) city scoping
        vendorGallery = await db('gallery_images')
          .where(function() {
            this.where({ vendor_id: 0 })
                .orWhereNull('vendor_id')
                .orWhere({ vendor_id: localVendorId });
          })
          .andWhere(function() {
            this.where({ city_id: city.id })
                .orWhereNull('city_id');
          })
          .orderBy('sort_order', 'asc');
      } else {
        vendorGallery = await db('gallery_images').where({ vendor_id: vendor.id }).orderBy('sort_order', 'asc');
      }
    } catch(e) {
      console.error('Error fetching gallery:', e);
    }
    
    if (!vendorGallery || vendorGallery.length === 0) {
      vendorGallery = [
        { image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&auto=format&fit=crop&q=80', caption: 'Premium Relocation Service', uploaded_by: 'owner' },
        { image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&auto=format&fit=crop&q=80', caption: 'Safe Box Packing Logistics', uploaded_by: 'owner' },
        { image_url: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=600&auto=format&fit=crop&q=80', caption: 'Household Relocation Logistics', uploaded_by: 'user' },
        { image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80', caption: 'Loading Moving Trucks', uploaded_by: 'user' },
        { image_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=600&auto=format&fit=crop&q=80', caption: 'Secure Transit Fleet Transport', uploaded_by: 'owner' }
      ];
    }

    let sidebarBlogs = [];
    try { sidebarBlogs = await db('blog_posts').where({ is_published: true }).orderBy('created_at', 'desc').limit(3).select('title', 'slug', 'cover_image_url', 'created_at', 'read_time_mins'); } catch(e) {}

    const state = await db('states').where({ id: city.state_id }).first();

    const aboutText = vendor.about_text ||
      `${vendor.name} is a registered packers and movers company based in ${city.name}, ${state ? state.name : ''}. They provide ${vendor.services || 'household shifting, office relocation, and packing services'} across ${city.name} and surrounding districts with competitive rates and professional handling.`;

    // Generate Breadcrumb and LocalBusiness JSON-LD Schemas for Vendor Profile Page
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": base
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": `${state ? state.name : ''} Packers`,
          "item": `${base}/state/${state ? state.slug : ''}`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": `${city.name} Shifting`,
          "item": `${base}/${city.slug}`
        },
        {
          "@type": "ListItem",
          "position": 4,
          "name": vendor.name,
          "item": `${base}/${city.slug}/${vendor.slug}`
        }
      ]
    };

    const localBusiness = {
      "@context": "https://schema.org",
      "@type": "MovingCompany",
      "name": vendor.name,
      "image": vendor.banner_url || vendor.logo_url || `${base}/images/og-home.jpg`,
      "logo": vendor.logo_url || `${base}/images/og-home.jpg`,
      "telephone": vendor.phone || "+91 98351 68368",
      "url": `${base}/${city.slug}/${vendor.slug}`,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": vendor.address,
        "addressLocality": city.name,
        "addressRegion": state ? state.name : '',
        "addressCountry": "IN"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": vendor.rating || 4.5,
        "reviewCount": vendor.reviews_count || 10
      },
      "description": aboutText
    };

    const pricing = generateCityPricing(city.name);
    const faqs = generateVendorFAQs(vendor, city, state, pricing);

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(item => ({
        "@type": "Question",
        "name": item.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.a
        }
      }))
    };

    const schemaMarkup = `<script type="application/ld+json">
    ${JSON.stringify(breadcrumbList, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(localBusiness, null, 2)}
    </script>
    <script type="application/ld+json">
    ${JSON.stringify(faqSchema, null, 2)}
    </script>`;

    let existingUserReview = null;
    if (req.session && req.session.userId) {
      const vId = vendor.id || 0;
      existingUserReview = await db('reviews').where({ vendor_id: vId, user_id: req.session.userId }).first();
    }

    res.render('vendor', {
      metaTitle: `${vendor.name} in ${city.name} — Reviews, Address & Shifting Quotes`,
      metaDescription: `Contact details, address, ratings, and customer reviews for ${vendor.name} in ${city.name}. Get instant shifting quotes and compare rates. Call: ${vendor.phone}`,
      metaKeywords: `${vendor.name}, packers movers ${city.name}, ${vendor.name} reviews, shifting ${city.name}`,
      canonicalUrl: `${base}/${city.slug}/${vendor.slug}`,
      ogImage: vendor.banner_url || vendor.logo_url || `${base}/images/og-home.jpg`,
      schemaMarkup,
      city, state, vendor, reviews, vendorGallery, sidebarBlogs, aboutText, faqs, existingUserReview,
      currentYear: new Date().getFullYear()
    });
  } catch (error) { next(error); }
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.userPhone = null;
    req.session.userId = null;
  }
  const backURL = req.header('Referer') || '/';
  res.redirect(backURL);
});

// NOTE: The primary /sitemap.xml route is defined at the top of this file (line ~95).
// That version includes proper <changefreq> and <priority> tags and is the canonical one.
// The secondary route below has been removed to prevent Express from silently shadowing it.

module.exports = router;

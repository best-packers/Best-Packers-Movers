const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db } = require('../../config/db');

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.adminAuthenticated) return next();
  res.redirect('/admin/login');
}

// ─── Login Page ───────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session && req.session.adminAuthenticated) return res.redirect('/admin');
  res.render('admin/login', { error: null, layout: false });
});

router.post('/login', async (req, res) => {
  const { password } = req.body;
  try {
    const adminUser = await db('users').where({ username: 'admin', role: 'admin' }).first();
    if (adminUser) {
      const match = await bcrypt.compare(password, adminUser.password);
      if (match) {
        req.session.adminAuthenticated = true;
        return res.redirect('/admin');
      }
    } else {
      // Fallback
      const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'bestpackers2026';
      if (password === ADMIN_PASSWORD) {
        req.session.adminAuthenticated = true;
        return res.redirect('/admin');
      }
    }
    res.render('admin/login', { error: 'Incorrect password. Try again.', layout: false });
  } catch (err) {
    console.error('Login error:', err);
    res.render('admin/login', { error: 'Server error. Please try again.', layout: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/admin/login');
});

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const [leadCount] = await db('leads').count('* as count');
    const [vendorCount] = await db('vendors').count('* as count');
    const [cityCount] = await db('cities').count('* as count');
    let blogCount = [{ count: 0 }];
    try { [blogCount] = await db('blog_posts').where({ is_published: true }).count('* as count'); } catch(e) {}
    
    const recentLeads = await db('leads')
      .orderBy('created_at', 'desc')
      .limit(5)
      .select('*');

    res.render('admin/dashboard', {
      layout: 'admin/layout',
      activePage: 'dashboard',
      stats: {
        leads: parseInt(leadCount.count),
        vendors: parseInt(vendorCount.count),
        cities: parseInt(cityCount.count),
        blogs: parseInt(blogCount.count || 0)
      },
      recentLeads
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Admin error: ' + err.message);
  }
});

// ─── Leads Panel ─────────────────────────────────────────────────────────────
router.get('/leads', requireAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    
    const [{ count }] = await db('leads').count('* as count');
    const totalPages = Math.ceil(parseInt(count) / limit) || 1;

    const leads = await db('leads')
      .leftJoin('vendors', 'leads.vendor_id', '=', 'vendors.id')
      .orderBy('leads.created_at', 'desc')
      .limit(limit).offset(offset)
      .select('leads.*', 'vendors.name as vendor_name', 'vendors.city_id');

    // Get city names for display
    const cities = await db('cities').select('id', 'name');
    const cityMap = {};
    cities.forEach(c => { cityMap[c.id] = c.name; });

    res.render('admin/leads', {
      layout: 'admin/layout', activePage: 'leads',
      leads, page, totalPages, cityMap
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// ─── Vendors Panel ────────────────────────────────────────────────────────────
router.get('/vendors', requireAuth, async (req, res) => {
  try {
    const search = req.query.search || '';
    const cityFilter = req.query.city || '';

    let query = db('vendors')
      .join('cities', 'vendors.city_id', '=', 'cities.id')
      .join('states', 'cities.state_id', '=', 'states.id')
      .select('vendors.*', 'cities.name as city_name', 'cities.slug as city_slug', 'states.name as state_name');

    if (search) query = query.whereILike('vendors.name', `%${search}%`);
    if (cityFilter) query = query.where('cities.slug', cityFilter);

    const vendors = await query.orderBy('vendors.id', 'asc');
    const cities = await db('cities').orderBy('name', 'asc').select('id', 'name', 'slug');

    res.render('admin/vendors', {
      layout: 'admin/layout', activePage: 'vendors',
      vendors, cities, search, cityFilter
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

// Update vendor (full customization + SEO link juice control + National Packers Global Sync)
router.post('/vendors/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, phone, website, address, google_rank, is_dofollow, logo_url, banner_url, about_text, year_founded, services, status, timings } = req.body;
  try {
    const updateData = {
      logo_url: logo_url || null,
      banner_url: banner_url || null,
      about_text: about_text || null,
      year_founded: year_founded ? parseInt(year_founded) : null,
      services: services || null,
      status: status || 'unclaimed',
      timings: timings || '9:00 AM - 8:00 PM'
    };
    if (name) updateData.name = name.trim();
    if (phone) updateData.phone = phone.trim();
    if (website !== undefined) updateData.website = website ? website.trim() : null;
    if (address !== undefined) updateData.address = address ? address.trim() : null;
    if (google_rank !== undefined) updateData.google_rank = parseInt(google_rank) || 0;
    if (is_dofollow !== undefined) updateData.is_dofollow = is_dofollow === 'true' || is_dofollow === true || is_dofollow === '1' || is_dofollow === 1;

    const targetVendor = await db('vendors').where({ id }).first();
    const isNationalPackers = parseInt(id) === 0 || (targetVendor && (targetVendor.is_national || targetVendor.slug === 'national-packers-movers'));

    if (isNationalPackers) {
      // 1. Ensure master row ID 0 is updated
      const masterExists = await db('vendors').where({ id: 0 }).first();
      if (masterExists) {
        await db('vendors').where({ id: 0 }).update({ ...updateData, is_national: true, slug: 'national-packers-movers' });
      }

      // 2. Cascade update to all per-city National Packers records
      await db('vendors')
        .where({ is_national: true })
        .orWhere({ slug: 'national-packers-movers' })
        .update(updateData);

      return res.json({ success: true, message: 'National Packers updated globally across ALL city and state pages!' });
    }

    await db('vendors').where({ id }).update(updateData);
    res.json({ success: true, message: 'Vendor profile updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Gallery Panel ────────────────────────────────────────────────────────────
router.get('/gallery', requireAuth, async (req, res) => {
  try {
    const stateFilter = req.query.state || '';
    const cityFilter = req.query.city || '';
    const vendorSearch = req.query.vendor || '';

    let query = db('gallery_images')
      .leftJoin('vendors', 'gallery_images.vendor_id', '=', 'vendors.id')
      .leftJoin('cities', 'gallery_images.city_id', '=', 'cities.id')
      .leftJoin('states', 'cities.state_id', '=', 'states.id')
      .orderBy('gallery_images.sort_order', 'asc')
      .orderBy('gallery_images.created_at', 'desc')
      .select(
        'gallery_images.*',
        'vendors.name as vendor_name',
        'vendors.slug as vendor_slug',
        'cities.name as city_name',
        'cities.slug as city_slug',
        'states.name as state_name'
      );

    if (stateFilter) query = query.where('states.slug', stateFilter);
    if (cityFilter) query = query.where('cities.slug', cityFilter);
    if (vendorSearch) query = query.whereILike('vendors.name', `%${vendorSearch}%`);

    const images = await query;
    const states = await db('states').orderBy('name').select('id', 'name', 'slug');
    const cities = await db('cities').orderBy('name').select('id', 'name', 'slug', 'state_id');
    const vendors = await db('vendors').orderBy('name').select('id', 'name', 'slug', 'city_id');

    res.render('admin/gallery', {
      layout: 'admin/layout', activePage: 'gallery',
      images, states, cities, vendors, stateFilter, cityFilter, vendorSearch
    });
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

router.post('/gallery/add', requireAuth, async (req, res) => {
  const { image_url, caption, sort_order, vendor_id, city_id } = req.body;
  if (!image_url) return res.json({ success: false, message: 'Image URL is required.' });
  try {
    await db('gallery_images').insert({
      image_url: image_url.trim(),
      caption: caption || null,
      sort_order: parseInt(sort_order) || 0,
      vendor_id: vendor_id ? parseInt(vendor_id) : null,
      city_id: city_id ? parseInt(city_id) : null
    });
    res.json({ success: true, message: 'Image added to gallery.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/gallery/delete/:id', requireAuth, async (req, res) => {
  try {
    await db('gallery_images').where({ id: req.params.id }).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Blog Panel ───────────────────────────────────────────────────────────────
function generateSlug(title) {
  return title.toLowerCase().trim()
    .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

router.get('/blogs', requireAuth, async (req, res) => {
  try {
    const blogs = await db('blog_posts').orderBy('created_at', 'desc').select('*');
    const BLOG_CATEGORIES = ['Shifting Tips', 'Moving Guides', 'Corporate Guides', 'Corporate & PSU', 'Relocation Allowance', 'Vehicle Transit', 'How To?', 'City Guides'];
    res.render('admin/blogs', { layout: 'admin/layout', activePage: 'blogs', blogs, BLOG_CATEGORIES, editBlog: undefined });
  } catch (err) { res.status(500).send('Error: ' + err.message); }
});

router.get('/blogs/edit/:id', requireAuth, async (req, res) => {
  try {
    const editBlog = req.params.id === 'new' ? null : await db('blog_posts').where({ id: req.params.id }).first();
    const blogs = await db('blog_posts').orderBy('created_at', 'desc').select('id', 'title', 'is_published', 'created_at', 'category', 'slug');
    const BLOG_CATEGORIES = ['Shifting Tips', 'Moving Guides', 'Corporate Guides', 'Corporate & PSU', 'Relocation Allowance', 'Vehicle Transit', 'How To?', 'City Guides'];
    res.render('admin/blogs', { layout: 'admin/layout', activePage: 'blogs', blogs, BLOG_CATEGORIES, editBlog });
  } catch (err) { res.status(500).send('Error: ' + err.message); }
});

router.post('/blogs/save', requireAuth, async (req, res) => {
  const { id, title, excerpt, body_html, faqs_json, category, cover_image_url, read_time_mins, meta_keywords, is_published } = req.body;
  if (!title) return res.json({ success: false, message: 'Title is required.' });
  
  const slug = generateSlug(title);
  const data = {
    title: title.trim(), slug,
    excerpt: excerpt || '',
    body_html: body_html || '',
    faqs_json: faqs_json || '[]',
    category: category || 'Shifting Tips',
    cover_image_url: cover_image_url || null,
    read_time_mins: parseInt(read_time_mins) || 3,
    meta_keywords: meta_keywords || null,
    is_published: is_published === 'true' || is_published === true || is_published === '1' || is_published === 1,
    updated_at: db.fn.now()
  };

  try {
    if (id && id !== 'new') {
      await db('blog_posts').where({ id }).update(data);
      return res.json({ success: true, message: 'Blog post updated.', slug });
    } else {
      data.created_at = db.fn.now();
      const [newId] = await db('blog_posts').insert(data).returning('id');
      return res.json({ success: true, message: 'Blog post created.', id: newId, slug });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/blogs/delete/:id', requireAuth, async (req, res) => {
  try {
    await db('blog_posts').where({ id: req.params.id }).delete();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Toggle publish
router.post('/blogs/toggle/:id', requireAuth, async (req, res) => {
  try {
    const blog = await db('blog_posts').where({ id: req.params.id }).first();
    await db('blog_posts').where({ id: req.params.id }).update({ is_published: !blog.is_published });
    res.json({ success: true, is_published: !blog.is_published });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── SEO Panel ────────────────────────────────────────────────────────────────
router.get('/seo', requireAuth, async (req, res) => {
  try {
    const cities = await db('cities')
      .join('states', 'cities.state_id', '=', 'states.id')
      .select('cities.*', 'states.name as state_name')
      .orderBy('cities.name');

    const vendors = await db('vendors')
      .join('cities', 'vendors.city_id', '=', 'cities.id')
      .select('vendors.id', 'vendors.name', 'vendors.slug', 'cities.name as city_name', 'cities.slug as city_slug', 'vendors.custom_meta_title', 'vendors.custom_meta_description', 'vendors.custom_keywords')
      .orderBy('vendors.name');

    res.render('admin/seo', {
      layout: 'admin/layout', activePage: 'seo',
      cities, vendors
    });
  } catch (err) {
    const cities = await db('cities').join('states', 'cities.state_id', '=', 'states.id').select('cities.*', 'states.name as state_name').orderBy('cities.name');
    res.render('admin/seo', { layout: 'admin/layout', activePage: 'seo', cities, vendors: [] });
  }
});

router.post('/seo/city/:id', requireAuth, async (req, res) => {
  const { custom_meta_title, custom_meta_description, custom_keywords } = req.body;
  try {
    await db('cities').where({ id: req.params.id }).update({
      custom_meta_title: custom_meta_title || null,
      custom_meta_description: custom_meta_description || null,
      custom_keywords: custom_keywords || null
    });
    res.json({ success: true, message: 'City SEO updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/seo/vendor/:id', requireAuth, async (req, res) => {
  const { custom_meta_title, custom_meta_description, custom_keywords } = req.body;
  try {
    await db('vendors').where({ id: req.params.id }).update({
      custom_meta_title: custom_meta_title || null,
      custom_meta_description: custom_meta_description || null,
      custom_keywords: custom_keywords || null
    });
    res.json({ success: true, message: 'Vendor SEO updated.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Settings Panel (v2.1) ────────────────────────────────────────────────────
router.get('/settings', requireAuth, (req, res) => {
  res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: null, success: null });
});

router.post('/settings/password', requireAuth, async (req, res) => {
  const { current_password, new_password, confirm_password } = req.body;
  if (!current_password || !new_password || !confirm_password) {
    return res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: 'All fields are required.', success: null });
  }
  if (new_password !== confirm_password) {
    return res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: 'New password and confirmation do not match.', success: null });
  }
  try {
    const adminUser = await db('users').where({ username: 'admin', role: 'admin' }).first();
    if (!adminUser) {
      return res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: 'Admin user account not found in database.', success: null });
    }
    const match = await bcrypt.compare(current_password, adminUser.password);
    if (!match) {
      return res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: 'Current password is incorrect.', success: null });
    }
    const hashed = await bcrypt.hash(new_password, 10);
    await db('users').where({ username: 'admin', role: 'admin' }).update({ password: hashed });
    
    res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: null, success: 'Password changed successfully!' });
  } catch (err) {
    console.error('Password change error:', err);
    res.render('admin/settings', { layout: 'admin/layout', activePage: 'settings', error: 'Database update failed. Try again.', success: null });
  }
});

// ─── Traffic Analytics Panel (v2.1) ───────────────────────────────────────────
router.get('/traffic', requireAuth, async (req, res) => {
  try {
    const [{ count: totalVisits }] = await db('traffic_logs').count('* as count');
    
    // Top pages list
    const topPages = await db('traffic_logs')
      .groupBy('url')
      .select('url')
      .count('* as count')
      .orderBy('count', 'desc')
      .limit(10);
      
    // Recent visits stream
    const recentLogs = await db('traffic_logs')
      .orderBy('created_at', 'desc')
      .limit(50)
      .select('*');

    res.render('admin/traffic', {
      layout: 'admin/layout',
      activePage: 'traffic',
      totalVisits: parseInt(totalVisits || 0),
      topPages,
      recentLogs
    });
  } catch (err) {
    console.error('Traffic logs error:', err);
    res.status(500).send('Error loading traffic logs: ' + err.message);
  }
});

// ─── Scraper Control Panel (v2.1) ─────────────────────────────────────────────
const { scrapeCity } = require('../../bin/scrape');

router.get('/scraper', requireAuth, async (req, res) => {
  try {
    const states = await db('states').orderBy('name', 'asc').select('*');
    const cities = await db('cities')
      .join('states', 'cities.state_id', '=', 'states.id')
      .orderBy('states.name')
      .orderBy('cities.name')
      .select('cities.*', 'states.name as state_name');

    res.render('admin/scraper', {
      layout: 'admin/layout',
      activePage: 'scraper',
      states,
      cities,
      success: null,
      error: null
    });
  } catch (err) {
    console.error('Scraper page load error:', err);
    res.status(500).send('Error loading scraper dashboard: ' + err.message);
  }
});

router.post('/scraper/run', requireAuth, async (req, res) => {
  const { city_name, state_id } = req.body;
  if (!city_name) {
    return res.status(400).json({ success: false, message: 'City name is required.' });
  }

  const logs = [];
  const logCollector = (msg) => {
    console.log(`[Scraper API] ${msg}`);
    logs.push(msg);
  };

  try {
    const result = await scrapeCity(city_name.trim(), state_id ? parseInt(state_id) : null, logCollector);
    res.json({
      success: true,
      message: result.message,
      logs: logs
    });
  } catch (err) {
    console.error('Scraping handler error:', err);
    res.status(500).json({
      success: false,
      message: 'Scraping failed: ' + err.message,
      logs: logs
    });
  }
});

router.post('/scraper/add-state', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ success: false, message: 'State name is required.' });
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  try {
    const existing = await db('states').where({ slug }).first();
    if (existing) {
      return res.status(400).json({ success: false, message: 'State already exists.' });
    }
    const [newIdObj] = await db('states').insert({ name: name.trim(), slug }).returning('id');
    const newId = typeof newIdObj === 'object' ? newIdObj.id : newIdObj;
    res.json({ success: true, message: 'State created successfully.', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/scraper/add-city', requireAuth, async (req, res) => {
  const { name, state_id } = req.body;
  if (!name || !state_id) {
    return res.status(400).json({ success: false, message: 'City name and State ID are required.' });
  }
  const slug = name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
  try {
    const existing = await db('cities').where({ slug, state_id: parseInt(state_id) }).first();
    if (existing) {
      return res.status(400).json({ success: false, message: 'City already exists under this state.' });
    }
    const [newIdObj] = await db('cities').insert({
      name: name.trim(),
      slug,
      state_id: parseInt(state_id)
    }).returning('id');
    const newId = typeof newIdObj === 'object' ? newIdObj.id : newIdObj;
    res.json({ success: true, message: 'City created successfully.', id: newId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── Reviews Manager (v2.2) ───────────────────────────────────────────────────
router.get('/reviews', requireAuth, async (req, res) => {
  try {
    const reviews = await db('reviews')
      .leftJoin('vendors', 'reviews.vendor_id', '=', 'vendors.id')
      .leftJoin('cities', 'reviews.city_id', '=', 'cities.id')
      .leftJoin('user_sessions', 'reviews.user_id', '=', 'user_sessions.id')
      .select(
        'reviews.*',
        'vendors.name as vendor_name',
        'cities.name as city_name',
        'user_sessions.phone as phone'
      )
      .orderBy('reviews.created_at', 'desc');

    const states = await db('states').orderBy('name').select('*');
    const cities = await db('cities').orderBy('name').select('*');
    const vendors = await db('vendors').where({ is_national: false }).orderBy('name').select('id', 'name', 'city_id');

    res.render('admin/reviews', {
      layout: 'admin/layout',
      activePage: 'reviews',
      reviews,
      states,
      cities,
      vendors
    });
  } catch (err) {
    console.error('Admin reviews page error:', err);
    res.status(500).send('Error loading reviews: ' + err.message);
  }
});

router.post('/reviews/add', requireAuth, async (req, res) => {
  const { vendor_id, city_id, customer_name, rating, review_text } = req.body;
  if (!vendor_id || !customer_name || !rating) {
    return res.status(400).json({ success: false, message: 'Missing fields.' });
  }
  try {
    await db('reviews').insert({
      vendor_id: parseInt(vendor_id, 10),
      city_id: city_id ? parseInt(city_id, 10) : null,
      customer_name: customer_name.trim(),
      rating: parseInt(rating, 10),
      review_text: review_text ? review_text.trim() : ''
    });

    if (parseInt(vendor_id, 10) !== 0) {
      const stats = await db('reviews').where({ vendor_id: parseInt(vendor_id, 10) }).avg('rating as avg_rating').count('id as count');
      const newAvgRating = parseFloat(parseFloat(stats[0].avg_rating || 0).toFixed(1));
      const newCount = parseInt(stats[0].count || 0, 10);
      await db('vendors').where({ id: parseInt(vendor_id, 10) }).update({ rating: newAvgRating, reviews_count: newCount });
    }
    res.json({ success: true, message: 'Review added successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/reviews/delete/:id', requireAuth, async (req, res) => {
  try {
    const review = await db('reviews').where({ id: req.params.id }).first();
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    await db('reviews').where({ id: req.params.id }).delete();

    if (review.vendor_id !== 0) {
      const stats = await db('reviews').where({ vendor_id: review.vendor_id }).avg('rating as avg_rating').count('id as count');
      const newAvgRating = parseFloat(parseFloat(stats[0].avg_rating || 0).toFixed(1));
      const newCount = parseInt(stats[0].count || 0, 10);
      await db('vendors').where({ id: review.vendor_id }).update({ rating: newAvgRating, reviews_count: newCount });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Write Admin Reply to Customer Review
router.post('/reviews/reply/:id', requireAuth, async (req, res) => {
  const { admin_reply } = req.body;
  if (!admin_reply || !admin_reply.trim()) {
    return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
  }
  try {
    const review = await db('reviews').where({ id: req.params.id }).first();
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

    await db('reviews').where({ id: req.params.id }).update({
      admin_reply: admin_reply.trim(),
      reply_date: db.fn.now()
    });

    res.json({ success: true, message: 'Official reply published.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── User Audit Logs (v2.2) ───────────────────────────────────────────────────
router.get('/users', requireAuth, async (req, res) => {
  try {
    const users = await db('user_sessions')
      .leftJoin('user_actions', 'user_sessions.id', '=', 'user_actions.session_id')
      .groupBy('user_sessions.id')
      .select('user_sessions.*')
      .count('user_actions.id as action_count')
      .orderBy('user_sessions.created_at', 'desc');

    res.render('admin/users', {
      layout: 'admin/layout',
      activePage: 'users',
      users
    });
  } catch (err) {
    console.error('Admin users load error:', err);
    res.status(500).send('Error loading users list: ' + err.message);
  }
});

router.get('/users/:id', requireAuth, async (req, res) => {
  try {
    const user = await db('user_sessions').where({ id: req.params.id }).first();
    if (!user) return res.status(404).send('User session not found.');

    const actions = await db('user_actions')
      .leftJoin('vendors', 'user_actions.vendor_id', '=', 'vendors.id')
      .leftJoin('cities', 'vendors.city_id', '=', 'cities.id')
      .where('user_actions.session_id', user.id)
      .select(
        'user_actions.*',
        'vendors.name as vendor_name',
        'cities.name as city_name'
      )
      .orderBy('user_actions.created_at', 'desc');

    res.render('admin/user_detail', {
      layout: 'admin/layout',
      activePage: 'users',
      user,
      actions
    });
  } catch (err) {
    res.status(500).send('Error loading user details: ' + err.message);
  }
});

// ─── Central Media Management Panel ───────────────────────────────────────────
router.get('/media', requireAuth, async (req, res) => {
  try {
    const typeFilter = req.query.type || '';
    const cityFilter = req.query.city || '';
    const search = req.query.search || '';

    // 1. Fetch from gallery_images
    const galleryItems = await db('gallery_images')
      .leftJoin('vendors', 'gallery_images.vendor_id', '=', 'vendors.id')
      .leftJoin('cities', 'gallery_images.city_id', '=', 'cities.id')
      .select(
        'gallery_images.id',
        'gallery_images.image_url',
        'gallery_images.caption',
        'gallery_images.vendor_id',
        'vendors.name as vendor_name',
        'cities.name as city_name',
        'cities.slug as city_slug',
        db.raw("'gallery' as type"),
        db.raw('NULL as blog_title'),
        db.raw('NULL as blog_id')
      );

    // 2. Fetch from vendors logos
    const logoItems = await db('vendors')
      .leftJoin('cities', 'vendors.city_id', '=', 'cities.id')
      .whereNotNull('logo_url')
      .whereNot('logo_url', '')
      .select(
        'vendors.id',
        'vendors.logo_url as image_url',
        db.raw("'Logo' as caption"),
        'vendors.id as vendor_id',
        'vendors.name as vendor_name',
        'cities.name as city_name',
        'cities.slug as city_slug',
        db.raw("'logo' as type"),
        db.raw('NULL as blog_title'),
        db.raw('NULL as blog_id')
      );

    // 3. Fetch from vendors banners
    const bannerItems = await db('vendors')
      .leftJoin('cities', 'vendors.city_id', '=', 'cities.id')
      .whereNotNull('banner_url')
      .whereNot('banner_url', '')
      .select(
        'vendors.id',
        'vendors.banner_url as image_url',
        db.raw("'Hero Banner' as caption"),
        'vendors.id as vendor_id',
        'vendors.name as vendor_name',
        'cities.name as city_name',
        'cities.slug as city_slug',
        db.raw("'banner' as type"),
        db.raw('NULL as blog_title'),
        db.raw('NULL as blog_id')
      );

    // 4. Fetch from blog_posts covers
    let blogItems = [];
    try {
      blogItems = await db('blog_posts')
        .whereNotNull('cover_image_url')
        .whereNot('cover_image_url', '')
        .select(
          'blog_posts.id',
          'blog_posts.cover_image_url as image_url',
          db.raw("'Blog Cover' as caption"),
          db.raw('NULL as vendor_id'),
          db.raw('NULL as vendor_name'),
          db.raw('NULL as city_name'),
          db.raw('NULL as city_slug'),
          db.raw("'blog' as type"),
          'blog_posts.title as blog_title',
          'blog_posts.id as blog_id'
        );
    } catch(e) {}

    // Combine all
    let mediaItems = [...galleryItems, ...logoItems, ...bannerItems, ...blogItems];

    // Filter by type
    if (typeFilter) {
      mediaItems = mediaItems.filter(item => item.type === typeFilter);
    }

    // Filter by city
    if (cityFilter) {
      mediaItems = mediaItems.filter(item => item.city_slug === cityFilter);
    }

    // Search query matching caption, vendor, or blog title
    if (search) {
      const q = search.toLowerCase();
      mediaItems = mediaItems.filter(item => 
        (item.caption && item.caption.toLowerCase().includes(q)) ||
        (item.vendor_name && item.vendor_name.toLowerCase().includes(q)) ||
        (item.blog_title && item.blog_title.toLowerCase().includes(q))
      );
    }

    // Sort: newest first
    mediaItems.reverse();

    const cities = await db('cities').orderBy('name', 'asc').select('id', 'name', 'slug');
    const vendors = await db('vendors').orderBy('name', 'asc').select('id', 'name', 'slug', 'city_id');
    
    let blogs = [];
    try { blogs = await db('blog_posts').orderBy('title', 'asc').select('id', 'title'); } catch(e) {}

    res.render('admin/media', {
      layout: 'admin/layout',
      activePage: 'media',
      mediaItems,
      cities,
      vendors,
      blogs,
      typeFilter,
      cityFilter,
      search,
      stats: {
        total: mediaItems.length
      }
    });
  } catch (err) {
    console.error('Media listing error:', err);
    res.status(500).send('Error loading media dashboard: ' + err.message);
  }
});

router.post('/media/save', requireAuth, async (req, res) => {
  const { type, image_url, vendor_id, city_id, blog_id, caption } = req.body;
  if (!image_url) return res.json({ success: false, message: 'Image URL is required.' });

  try {
    if (type === 'gallery') {
      await db('gallery_images').insert({
        vendor_id: vendor_id ? parseInt(vendor_id) : null,
        city_id: city_id ? parseInt(city_id) : null,
        image_url: image_url.trim(),
        caption: caption || 'Gallery Photo',
        sort_order: 0
      });
    } else if (type === 'logo') {
      if (vendor_id === undefined || vendor_id === null || vendor_id === '') {
        return res.json({ success: false, message: 'Vendor selection is required for logos.' });
      }
      await db('vendors').where({ id: vendor_id }).update({ logo_url: image_url.trim() });
    } else if (type === 'banner') {
      if (vendor_id === undefined || vendor_id === null || vendor_id === '') {
        return res.json({ success: false, message: 'Vendor selection is required for banners.' });
      }
      await db('vendors').where({ id: vendor_id }).update({ banner_url: image_url.trim() });
    } else if (type === 'blog') {
      if (!blog_id) return res.json({ success: false, message: 'Blog selection is required for blog covers.' });
      await db('blog_posts').where({ id: blog_id }).update({ cover_image_url: image_url.trim() });
    }

    res.json({ success: true, message: 'Asset saved successfully.' });
  } catch (err) {
    console.error('Save asset mapping error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/media/delete', requireAuth, async (req, res) => {
  const { type, id, vendor_id, blog_id } = req.body;
  try {
    if (type === 'gallery') {
      await db('gallery_images').where({ id }).delete();
    } else if (type === 'logo') {
      await db('vendors').where({ id: vendor_id }).update({ logo_url: null });
    } else if (type === 'banner') {
      await db('vendors').where({ id: vendor_id }).update({ banner_url: null });
    } else if (type === 'blog') {
      await db('blog_posts').where({ id: blog_id }).update({ cover_image_url: null });
    }

    res.json({ success: true, message: 'Asset deleted successfully.' });
  } catch (err) {
    console.error('Delete asset error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/api/upload', requireAuth, async (req, res) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image data received.' });
    }

    // Decode Base64 image data
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Generate secure randomized WebP filename
    const cleanName = (name || 'upload.webp').replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    const uniqueFilename = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${cleanName}`;

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    const bucketName = process.env.SUPABASE_BUCKET || 'images';

    if (supabaseUrl && supabaseKey) {
      // 1. Build Supabase Storage upload API endpoint
      // format: https://[PROJECT-ID].supabase.co/storage/v1/object/[BUCKET-NAME]/[FILENAME]
      const cleanUrl = supabaseUrl.replace(/\/$/, "");
      const uploadUrl = `${cleanUrl}/storage/v1/object/${bucketName}/${uniqueFilename}`;

      console.log(`Uploading to Supabase Storage: ${uploadUrl}`);
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
          'Content-Type': 'image/webp'
        },
        body: buffer
      });

      if (uploadResponse.ok) {
        // Build public access URL
        const publicUrl = `${cleanUrl}/storage/v1/object/public/${bucketName}/${uniqueFilename}`;
        return res.json({ success: true, url: publicUrl, filename: uniqueFilename });
      } else {
        const errorText = await uploadResponse.text();
        console.error('Supabase Storage API upload error response:', errorText);
        throw new Error(`Supabase Storage upload failed with status ${uploadResponse.status}`);
      }
    } else {
      // 2. Local fallback storage under public/uploads/
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, uniqueFilename);
      fs.writeFileSync(filePath, buffer);
      
      console.log(`Saved image to local upload folder: ${filePath}`);
      return res.json({ success: true, url: `/uploads/${uniqueFilename}`, filename: uniqueFilename });
    }
  } catch (err) {
    console.error('Unified upload API failed:', err);
    res.status(500).json({ success: false, message: 'Upload failed: ' + err.message });
  }
});

module.exports = router;

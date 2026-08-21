const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
require('dotenv').config();
const { db, initDb } = require('../config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up views and template engine
app.use(expressLayouts);
app.set('layout', 'layout');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Serverless Database Connection Initialization Lifecycle
let dbInitialized = false;
let dbInitPromise = null;

async function ensureDb() {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = initDb().then(() => {
      dbInitialized = true;
    }).catch(err => {
      console.error('Error initializing database in serverless function:', err);
      dbInitPromise = null;
    });
  }
  return dbInitPromise;
}

// Middleware to ensure DB is connected on Vercel serverless requests
app.use(async (req, res, next) => {
  try {
    await ensureDb();
  } catch (err) {
    console.error('DB middleware init error:', err);
  }
  next();
});

// Middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Session middleware (for admin auth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'bestpackers_secret_2026_xK9z',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // HTTPS-only cookies in production
    httpOnly: true, // Prevent client-side JS from accessing session cookie
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 8 // 8 hour session
  }
}));

// Helper to determine device type from User Agent
function getDeviceType(ua) {
  if (!ua) return 'Desktop';
  const uaLower = ua.toLowerCase();
  if (uaLower.includes('mobi') || uaLower.includes('android') || uaLower.includes('iphone')) return 'Mobile';
  if (uaLower.includes('tablet') || uaLower.includes('ipad')) return 'Tablet';
  return 'Desktop';
}

// Helper to lookup Geo IP Location
async function getIpGeo(ip) {
  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { city: 'Localhost', state: 'Development', country: 'IN' };
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    if (data && data.status === 'success') {
      return {
        city: data.city || 'Unknown',
        state: data.regionName || 'Unknown',
        country: data.countryCode || 'Unknown'
      };
    }
  } catch (e) {
    // Fail silently in background
  }
  return { city: 'Unknown', state: 'Unknown', country: 'Unknown' };
}

// Dynamic Visitor Tracking Middleware
app.use((req, res, next) => {
  const url = req.originalUrl || req.url;
  const isStatic = url.includes('.') || url.startsWith('/css') || url.startsWith('/js') || url.startsWith('/images') || url.startsWith('/favicon.ico');
  const isAdmin = url.startsWith('/admin') || url.startsWith('/api');
  
  if (req.method === 'GET' && !isStatic && !isAdmin) {
    (async () => {
      try {
        const ip = (req.headers['x-forwarded-for'] || req.ip || req.socket.remoteAddress || '').split(',')[0].trim();
        const ua = req.headers['user-agent'] || '';
        const deviceType = getDeviceType(ua);
        
        let city = req.headers['x-vercel-ip-city'] ? decodeURIComponent(req.headers['x-vercel-ip-city']) : null;
        let state = req.headers['x-vercel-ip-country-region'] ? decodeURIComponent(req.headers['x-vercel-ip-country-region']) : null;
        let country = req.headers['x-vercel-ip-country'] ? decodeURIComponent(req.headers['x-vercel-ip-country']) : null;
        let locality = req.session ? req.session.locality : null;

        // If user has a high-precision GPS geocode active in their session, use it
        if (req.session && req.session.city) {
          city = req.session.city;
          state = req.session.state;
        }
        
        if (!city || !state) {
          const geo = await getIpGeo(ip);
          city = city || geo.city;
          state = state || geo.state;
          country = country || geo.country;
        }
        
        await db('traffic_logs').insert({
          ip_address: ip,
          url: url,
          user_agent: ua,
          device_type: deviceType,
          city: city,
          state: state,
          country: country,
          locality: locality
        });
      } catch (err) {
        // Fail silently in background
      }
    })();
  }
  next();
});

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, '..', 'public')));

// Global locals for views
app.use((req, res, next) => {
  res.locals.currentYear = new Date().getFullYear();
  res.locals.metaTitle = "Best Packers and Movers - Top Relocation Directory";
  res.locals.metaDescription = "Find and compare the best packers and movers in India. Verified listings, user reviews, and transparent pricing.";
  res.locals.metaKeywords = "packers and movers, relocation services india";
  res.locals.canonicalUrl = null;
  res.locals.ogImage = null;
  res.locals.userPhone = req.session ? req.session.userPhone : null;
  res.locals.userId = req.session ? req.session.userId : null;
  next();
});

// Mount Admin router (uses its own layout: layout=false)
const adminRouter = require('../src/routes/admin');
app.use('/admin', adminRouter);

// Mount public frontend router
const frontendRouter = require('../src/routes/routes');
app.use('/', frontendRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).render('404', {
    metaTitle: "Page Not Found",
    metaDescription: "The page you are looking for does not exist.",
    message: "The page you're looking for doesn't exist."
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).render('404', {
    metaTitle: "Server Error",
    metaDescription: "An internal server error occurred.",
    message: "Something went wrong. Please try again."
  });
});

// Initialize DB and launch server
async function startServer() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`Local url: http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin`);
    });
  } catch (err) {
    console.error("Critical: Failed to launch server:", err);
    process.exit(1);
  }
}

module.exports = app;

if (require.main === module) {
  startServer();
}

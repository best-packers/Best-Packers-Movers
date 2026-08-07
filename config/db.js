const knex = require('knex');
const path = require('path');
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
const isPlaceholder = dbUrl && dbUrl.includes('[YOUR-PASSWORD]');
const isPostgres = dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) && !isPlaceholder;

if (isPlaceholder) {
  console.warn('\n⚠️  Supabase DATABASE_URL has default placeholder [YOUR-PASSWORD].');
  console.warn('⚡ Gracefully falling back to local SQLite database.sqlite for development.\n');
}

const pgConfig = {
  client: 'pg',
  connection: {
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 2, max: 10 }
};

const sqliteConfig = {
  client: 'sqlite3',
  connection: {
    filename: path.join(__dirname, '..', 'database.sqlite')
  },
  useNullAsDefault: true
};

let activeDb = knex(isPostgres ? pgConfig : sqliteConfig);

// Dummy target function to allow calling db('table_name') directly
const dummyTarget = function(...args) {
  return activeDb(...args);
};

// Proxy wrapper to support hot-swapping database drivers on connection failure
const dbProxy = new Proxy(dummyTarget, {
  get(target, prop) {
    if (typeof activeDb[prop] === 'function') {
      return activeDb[prop].bind(activeDb);
    }
    return activeDb[prop];
  }
});

async function initDb() {
  console.log(`Initializing database...`);
  
  if (isPostgres) {
    try {
      // Test connection
      await activeDb.raw('SELECT 1');
      console.log('✅ Connected to Supabase PostgreSQL successfully!');
    } catch (err) {
      console.error('\n❌ Supabase PostgreSQL connection failed:', err.message);
      console.warn('⚡ Falling back to local SQLite database.sqlite for this session...\n');
      activeDb = knex(sqliteConfig);
    }
  }

  const db = activeDb;
  
  // 0. Users table
  const hasUsers = await db.schema.hasTable('users');
  if (!hasUsers) {
    await db.schema.createTable('users', table => {
      table.increments('id').primary();
      table.string('username').unique().notNullable();
      table.string('password').notNullable();
      table.string('role').defaultTo('vendor'); // 'admin', 'vendor'
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: users');
  }

  // 1. States table
  const hasStates = await db.schema.hasTable('states');
  if (!hasStates) {
    await db.schema.createTable('states', table => {
      table.increments('id').primary();
      table.string('name').unique().notNullable();
      table.string('slug').unique().notNullable();
      table.text('seo_text').nullable();
    });
    console.log('Created table: states');
  } else {
    const hasStatesSeoText = await db.schema.hasColumn('states', 'seo_text');
    if (!hasStatesSeoText) {
      await db.schema.alterTable('states', table => { table.text('seo_text').nullable(); });
      console.log('Added column: states.seo_text');
    }
  }

  // 2. Cities table
  const hasCities = await db.schema.hasTable('cities');
  if (!hasCities) {
    await db.schema.createTable('cities', table => {
      table.increments('id').primary();
      table.integer('state_id').unsigned().references('id').inTable('states').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('slug').unique().notNullable();
      table.string('custom_meta_title').nullable();
      table.text('custom_meta_description').nullable();
      table.text('custom_keywords').nullable();
      table.text('seo_text').nullable();
    });
    console.log('Created table: cities');
  } else {
    const hasCityMetaTitle = await db.schema.hasColumn('cities', 'custom_meta_title');
    if (!hasCityMetaTitle) {
      await db.schema.alterTable('cities', table => { table.string('custom_meta_title').nullable(); });
      console.log('Added column: cities.custom_meta_title');
    }
    const hasCityMetaDesc = await db.schema.hasColumn('cities', 'custom_meta_description');
    if (!hasCityMetaDesc) {
      await db.schema.alterTable('cities', table => { table.text('custom_meta_description').nullable(); });
      console.log('Added column: cities.custom_meta_description');
    }
    const hasCityKeywords = await db.schema.hasColumn('cities', 'custom_keywords');
    if (!hasCityKeywords) {
      await db.schema.alterTable('cities', table => { table.text('custom_keywords').nullable(); });
      console.log('Added column: cities.custom_keywords');
    }
    const hasCitySeoText = await db.schema.hasColumn('cities', 'seo_text');
    if (!hasCitySeoText) {
      await db.schema.alterTable('cities', table => { table.text('seo_text').nullable(); });
      console.log('Added column: cities.seo_text');
    }
  }

  // 3. Vendors table
  const hasVendors = await db.schema.hasTable('vendors');
  if (!hasVendors) {
    await db.schema.createTable('vendors', table => {
      table.increments('id').primary();
      table.integer('city_id').unsigned().references('id').inTable('cities').onDelete('CASCADE');
      table.string('name').notNullable();
      table.string('slug').notNullable();
      table.text('address');
      table.string('phone');
      table.decimal('rating', 3, 2).defaultTo(4.0);
      table.integer('reviews_count').defaultTo(0);
      table.string('status').defaultTo('unclaimed'); // 'unclaimed', 'verified'
      table.string('website');
      table.boolean('is_national').defaultTo(false);
      table.integer('google_rank').defaultTo(0);
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      table.integer('views_count').defaultTo(0);
      table.string('timings').defaultTo('9:00 AM - 8:00 PM');
      table.text('services').defaultTo('Household Shifting, Office Relocation, Local Shifting, Packing & Unpacking');
      table.timestamps(true, true);
    });
    console.log('Created table: vendors');
  } else {
    // Dynamically alter existing tables to preserve user data
    const hasGoogleRank = await db.schema.hasColumn('vendors', 'google_rank');
    if (!hasGoogleRank) {
      await db.schema.alterTable('vendors', table => {
        table.integer('google_rank').defaultTo(0);
      });
      console.log('Added column: vendors.google_rank');
    }
    
    const hasUserId = await db.schema.hasColumn('vendors', 'user_id');
    if (!hasUserId) {
      await db.schema.alterTable('vendors', table => {
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL');
      });
      console.log('Added column: vendors.user_id');
    }

    const hasViewsCount = await db.schema.hasColumn('vendors', 'views_count');
    if (!hasViewsCount) {
      await db.schema.alterTable('vendors', table => {
        table.integer('views_count').defaultTo(0);
      });
      console.log('Added column: vendors.views_count');
    }

    const hasTimings = await db.schema.hasColumn('vendors', 'timings');
    if (!hasTimings) {
      await db.schema.alterTable('vendors', table => {
        table.string('timings').defaultTo('9:00 AM - 8:00 PM');
      });
      console.log('Added column: vendors.timings');
    }

    const hasServices = await db.schema.hasColumn('vendors', 'services');
    if (!hasServices) {
      await db.schema.alterTable('vendors', table => {
        table.text('services').defaultTo('Household Shifting, Office Relocation, Local Shifting, Packing & Unpacking');
      });
      console.log('Added column: vendors.services');
    }

    // v2.0: New vendor profile columns
    const hasLogoUrl = await db.schema.hasColumn('vendors', 'logo_url');
    if (!hasLogoUrl) {
      await db.schema.alterTable('vendors', table => { table.text('logo_url').nullable(); });
      console.log('Added column: vendors.logo_url');
    }

    const hasBannerUrl = await db.schema.hasColumn('vendors', 'banner_url');
    if (!hasBannerUrl) {
      await db.schema.alterTable('vendors', table => { table.text('banner_url').nullable(); });
      console.log('Added column: vendors.banner_url');
    }

    const hasAboutText = await db.schema.hasColumn('vendors', 'about_text');
    if (!hasAboutText) {
      await db.schema.alterTable('vendors', table => { table.text('about_text').nullable(); });
      console.log('Added column: vendors.about_text');
    }

    const hasYearFounded = await db.schema.hasColumn('vendors', 'year_founded');
    if (!hasYearFounded) {
      await db.schema.alterTable('vendors', table => { table.integer('year_founded').nullable(); });
      console.log('Added column: vendors.year_founded');
    }

    const hasVendorMetaTitle = await db.schema.hasColumn('vendors', 'custom_meta_title');
    if (!hasVendorMetaTitle) {
      await db.schema.alterTable('vendors', table => { table.string('custom_meta_title').nullable(); });
      console.log('Added column: vendors.custom_meta_title');
    }
    const hasVendorMetaDesc = await db.schema.hasColumn('vendors', 'custom_meta_description');
    if (!hasVendorMetaDesc) {
      await db.schema.alterTable('vendors', table => { table.text('custom_meta_description').nullable(); });
      console.log('Added column: vendors.custom_meta_description');
    }
    const hasVendorKeywords = await db.schema.hasColumn('vendors', 'custom_keywords');
    if (!hasVendorKeywords) {
      await db.schema.alterTable('vendors', table => { table.text('custom_keywords').nullable(); });
      console.log('Added column: vendors.custom_keywords');
    }

    const hasIsDofollow = await db.schema.hasColumn('vendors', 'is_dofollow');
    if (!hasIsDofollow) {
      await db.schema.alterTable('vendors', table => { table.boolean('is_dofollow').defaultTo(false); });
      console.log('Added column: vendors.is_dofollow');
    }
  }

  // 4. Leads table
  const hasLeads = await db.schema.hasTable('leads');
  if (!hasLeads) {
    await db.schema.createTable('leads', table => {
      table.increments('id').primary();
      table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('SET NULL');
      table.string('moving_from').notNullable();
      table.string('moving_to').notNullable();
      table.date('moving_date');
      table.string('phone').notNullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: leads');
  }

  // 5. Claims table
  const hasClaims = await db.schema.hasTable('claims');
  if (!hasClaims) {
    await db.schema.createTable('claims', table => {
      table.increments('id').primary();
      table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('CASCADE');
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.string('contact_name').notNullable();
      table.string('contact_phone').notNullable();
      table.string('contact_email').notNullable();
      table.text('verification_details');
      table.string('status').defaultTo('pending'); // 'pending', 'approved', 'rejected'
      table.string('payment_status').defaultTo('unpaid');
      table.decimal('verification_fee', 8, 2).defaultTo(1499.00);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: claims');
  } else {
    const hasClaimsUserId = await db.schema.hasColumn('claims', 'user_id');
    if (!hasClaimsUserId) {
      await db.schema.alterTable('claims', table => {
        table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
      });
      console.log('Added column: claims.user_id');
    }
    
    const hasPaymentStatus = await db.schema.hasColumn('claims', 'payment_status');
    if (!hasPaymentStatus) {
      await db.schema.alterTable('claims', table => {
        table.string('payment_status').defaultTo('unpaid');
      });
      console.log('Added column: claims.payment_status');
    }

    const hasVerificationFee = await db.schema.hasColumn('claims', 'verification_fee');
    if (!hasVerificationFee) {
      await db.schema.alterTable('claims', table => {
        table.decimal('verification_fee', 8, 2).defaultTo(1499.00);
      });
      console.log('Added column: claims.verification_fee');
    }
  }
  
  // 6. Reviews table
  const hasReviews = await db.schema.hasTable('reviews');
  if (!hasReviews) {
    await db.schema.createTable('reviews', table => {
      table.increments('id').primary();
      table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('CASCADE');
      table.string('customer_name').notNullable();
      table.integer('rating').notNullable();
      table.text('review_text');
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: reviews');
  }

  // 7. Gallery Images table (v2.0)
  const hasGallery = await db.schema.hasTable('gallery_images');
  if (!hasGallery) {
    await db.schema.createTable('gallery_images', table => {
      table.increments('id').primary();
      table.integer('vendor_id').unsigned().references('id').inTable('vendors').onDelete('CASCADE').nullable();
      table.integer('city_id').unsigned().references('id').inTable('cities').onDelete('CASCADE').nullable();
      table.text('image_url').notNullable();
      table.string('caption').nullable();
      table.integer('sort_order').defaultTo(0);
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: gallery_images');
  }

  // 8. Blog Posts table (v2.0)
  const hasBlogs = await db.schema.hasTable('blog_posts');
  if (!hasBlogs) {
    await db.schema.createTable('blog_posts', table => {
      table.increments('id').primary();
      table.string('title').notNullable();
      table.string('slug').unique().notNullable();
      table.text('excerpt');
      table.text('body_html');
      table.text('faqs_json'); // JSON array of {question, answer}
      table.string('category').defaultTo('Shifting Tips');
      table.string('cover_image_url').nullable();
      table.integer('read_time_mins').defaultTo(3);
      table.string('meta_keywords').nullable();
      table.boolean('is_published').defaultTo(false);
      table.timestamp('created_at').defaultTo(db.fn.now());
      table.timestamp('updated_at').defaultTo(db.fn.now());
    });
    console.log('Created table: blog_posts');
  }

  // 9. Traffic Logs table (v2.1)
  const hasTrafficLogs = await db.schema.hasTable('traffic_logs');
  if (!hasTrafficLogs) {
    await db.schema.createTable('traffic_logs', table => {
      table.increments('id').primary();
      table.string('ip_address');
      table.string('url');
      table.string('user_agent');
      table.string('device_type');
      table.string('city');
      table.string('state');
      table.string('country');
      table.string('locality').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: traffic_logs');
  }

  // Ensure locality column exists in traffic_logs (v2.2)
  const hasLocality = await db.schema.hasColumn('traffic_logs', 'locality');
  if (!hasLocality) {
    await db.schema.table('traffic_logs', table => {
      table.string('locality').nullable();
    });
    console.log('Added column: locality to traffic_logs');
  }

  // 10. Reviews table (v2.2)
  const hasReviewsTable = await db.schema.hasTable('reviews');
  if (!hasReviewsTable) {
    await db.schema.createTable('reviews', table => {
      table.increments('id').primary();
      table.integer('vendor_id').notNullable();
      table.integer('city_id').nullable();
      table.string('customer_name').notNullable();
      table.integer('rating').notNullable();
      table.text('review_text').nullable();
      table.integer('user_id').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: reviews');
  }

  // Ensure city_id exists in reviews (v2.2)
  const hasReviewsCityId = await db.schema.hasColumn('reviews', 'city_id');
  if (!hasReviewsCityId) {
    await db.schema.table('reviews', table => {
      table.integer('city_id').nullable();
    });
    console.log('Added column: city_id to reviews');
  }

  // Ensure user_id exists in reviews (v2.2)
  const hasReviewsUserId = await db.schema.hasColumn('reviews', 'user_id');
  if (!hasReviewsUserId) {
    await db.schema.table('reviews', table => {
      table.integer('user_id').nullable();
    });
    console.log('Added column: user_id to reviews');
  }

  // Ensure admin_reply & reply_date exist in reviews (v3.0)
  const hasAdminReply = await db.schema.hasColumn('reviews', 'admin_reply');
  if (!hasAdminReply) {
    await db.schema.table('reviews', table => {
      table.text('admin_reply').nullable();
      table.timestamp('reply_date').nullable();
    });
    console.log('Added columns: admin_reply, reply_date to reviews');
  }

  // 11. User Sessions table (v2.2)
  const hasUserSessionsTable = await db.schema.hasTable('user_sessions');
  if (!hasUserSessionsTable) {
    await db.schema.createTable('user_sessions', table => {
      table.increments('id').primary();
      table.string('phone').notNullable();
      table.string('ip_address').nullable();
      table.string('device_type').nullable();
      table.string('state').nullable();
      table.string('city').nullable();
      table.string('locality').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: user_sessions');
  }

  // 12. User Actions log table (v2.2)
  const hasUserActionsTable = await db.schema.hasTable('user_actions');
  if (!hasUserActionsTable) {
    await db.schema.createTable('user_actions', table => {
      table.increments('id').primary();
      table.integer('session_id').nullable();
      table.string('phone').nullable();
      table.string('action_type').notNullable(); // 'call', 'website', 'review'
      table.integer('vendor_id').nullable();
      table.string('target_url').nullable();
      table.timestamp('created_at').defaultTo(db.fn.now());
    });
    console.log('Created table: user_actions');
  }

  // Seed default admin if not exists (v2.1)
  const adminExists = await db('users').where({ role: 'admin' }).first();
  if (!adminExists) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db('users').insert({
      username: 'admin',
      password: hashedPassword,
      role: 'admin'
    });
    console.log('Default admin user seeded successfully.');
  }

  // Seed virtual National Mover row with ID 0 to satisfy reviews foreign key constraint (v2.2)
  const nationalMoverExists = await db('vendors').where({ id: 0 }).first();
  if (!nationalMoverExists) {
    // Check if there is at least one city in the database to satisfy city_id foreign key constraint
    const firstCity = await db('cities').first();
    const cityId = firstCity ? firstCity.id : 1; // Fallback to 1 if no city seeded yet
    
    await db('vendors').insert({
      id: 0,
      name: "National Packers & Movers",
      slug: "national-packers-movers",
      city_id: cityId,
      phone: "+91 98351 68368",
      address: "Pan-India Relocation Hub",
      rating: 4.9,
      reviews_count: 1540,
      is_national: true,
      status: 'verified'
    });
    console.log('Seeded virtual National Mover row with ID 0 in vendors table.');
  }

  // Auto-seed if SQLite and table is empty
  const isSqlite = db.client.config.client === 'sqlite3';
  if (isSqlite) {
    const cityCount = await db('cities').count('* as count').first();
    const count = parseInt(cityCount ? cityCount.count : 0, 10);
    if (count === 0) {
      console.log('⚡ Detected empty SQLite database. Automatically seeding development database...');
      
      const statesData = [
        { name: 'Uttar Pradesh', slug: 'uttar-pradesh', cities: ['Lucknow', 'Kanpur', 'Noida', 'Ghaziabad'] },
        { name: 'West Bengal', slug: 'west-bengal', cities: ['Kolkata', 'Siliguri', 'Asansol', 'Durgapur'] },
        { name: 'Jharkhand', slug: 'jharkhand', cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'] },
        { name: 'Bihar', slug: 'bihar', cities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur'] },
        { name: 'Madhya Pradesh', slug: 'madhya-pradesh', cities: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur'] },
        { name: 'Andhra Pradesh', slug: 'andhra-pradesh', cities: ['Vijayawada', 'Visakhapatnam', 'Guntur', 'Nellore'] }
      ];

      const mockTemplates = [
        { name: 'VRL Cargo Packers and Movers', rating: 4.6 },
        { name: 'Gati Relocation Services', rating: 4.4 },
        { name: 'DTC Logistics Movers', rating: 4.2 },
        { name: 'Express Household Shifting', rating: 4.5 },
        { name: 'Super Safe Packers & Movers', rating: 4.3 },
        { name: 'Blue Star Logistics India', rating: 4.1 },
        { name: 'Agarwal Domestic Relocation', rating: 4.7 }
      ];

      const slugify = text => text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');

      for (const stateItem of statesData) {
        const [stateId] = await db('states').insert({
          name: stateItem.name,
          slug: stateItem.slug
        });
        
        for (const cityName of stateItem.cities) {
          const citySlug = slugify(cityName);
          const [cityId] = await db('cities').insert({
            state_id: stateId,
            name: cityName,
            slug: citySlug
          });

          // Insert mock vendors per city
          for (const template of mockTemplates) {
            const vendorName = `${template.name} (${cityName})`;
            const vendorSlug = `${slugify(template.name)}-${citySlug}`;
            const reviewCount = Math.floor(Math.random() * 100) + 30;
            
            await db('vendors').insert({
              city_id: cityId,
              name: vendorName,
              slug: vendorSlug,
              address: `Plot No. ${Math.floor(Math.random() * 150) + 1}, Industrial Area, ${cityName}`,
              phone: `+91 98765 ${Math.floor(Math.random() * 89999) + 10000}`,
              rating: template.rating,
              reviews_count: reviewCount,
              status: 'unclaimed',
              is_national: false
            });
          }

          // Insert National Packers for this city
          await db('vendors').insert({
            city_id: cityId,
            name: "National Packers & Movers",
            slug: "national-packers-movers",
            address: `Pan-India Hub — Serving ${cityName}, ${cityName} District & Surrounding Areas`,
            phone: "+91 98351 68368",
            rating: 4.9,
            reviews_count: 1540,
            status: 'verified',
            is_national: true
          });
        }
      }
      console.log('✅ Auto-seeding completed successfully!');
    }
  }

  console.log('Database tables verified/created successfully.');
}

module.exports = {
  db: dbProxy,
  initDb,
  isPostgres
};

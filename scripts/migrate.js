require('dotenv').config();
const { query } = require('../lib/db');

async function migrate() {
  console.log('🚀 Starting BestPackerMovers.com Enterprise Database Migration...');

  try {
    // 0. Ensure uuid extension
    await query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // 1. STATES
    console.log('Creating table: states...');
    await query(`
      CREATE TABLE IF NOT EXISTS states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        region VARCHAR
      );
    `);

    // 2. CITIES
    console.log('Creating table: cities...');
    await query(`
      CREATE TABLE IF NOT EXISTS cities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        state_id UUID REFERENCES states(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        tier INTEGER DEFAULT 2,
        popular_localities JSONB DEFAULT '[]'::jsonb,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // 3. MOVERS
    console.log('Creating table: movers...');
    await query(`
      CREATE TABLE IF NOT EXISTS movers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        name VARCHAR NOT NULL,
        slug VARCHAR UNIQUE NOT NULL,
        logo_url TEXT,
        banner_url TEXT,
        phone VARCHAR NOT NULL,
        email VARCHAR,
        website_url TEXT,
        address TEXT NOT NULL,
        rating NUMERIC(2,1) DEFAULT 4.5,
        review_count INTEGER DEFAULT 15,
        rank_order INTEGER DEFAULT 999,
        is_verified BOOLEAN DEFAULT true,
        is_featured BOOLEAN DEFAULT false,
        badges JSONB DEFAULT '[]'::jsonb,
        services_offered JSONB DEFAULT '[]'::jsonb,
        about_text TEXT,
        fleet_size VARCHAR,
        established_year VARCHAR,
        pricing_table JSONB DEFAULT '{}'::jsonb,
        gallery_images JSONB DEFAULT '[]'::jsonb,
        source VARCHAR DEFAULT 'manual',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 4. INTENT ROUTES
    console.log('Creating table: intent_routes...');
    await query(`
      CREATE TABLE IF NOT EXISTS intent_routes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
        intent_type VARCHAR NOT NULL,
        slug_pattern VARCHAR UNIQUE NOT NULL,
        meta_title VARCHAR NOT NULL,
        meta_description VARCHAR NOT NULL,
        h1_heading VARCHAR NOT NULL,
        intro_text TEXT,
        filter_criteria JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT true
      );
    `);

    // 5. DIRECTORY LEADS (CRM)
    console.log('Creating table: directory_leads...');
    await query(`
      CREATE TABLE IF NOT EXISTS directory_leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mover_id UUID REFERENCES movers(id) ON DELETE SET NULL,
        customer_name VARCHAR NOT NULL,
        customer_phone VARCHAR NOT NULL,
        from_city VARCHAR NOT NULL,
        to_city VARCHAR NOT NULL,
        move_date VARCHAR,
        move_size VARCHAR,
        total_cft INTEGER DEFAULT 0,
        inventory_summary TEXT,
        source_page VARCHAR,
        status VARCHAR DEFAULT 'New',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 6. MOVER REVIEWS
    console.log('Creating table: mover_reviews...');
    await query(`
      CREATE TABLE IF NOT EXISTS mover_reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        mover_id UUID REFERENCES movers(id) ON DELETE CASCADE,
        user_name VARCHAR NOT NULL,
        user_phone VARCHAR,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT NOT NULL,
        status VARCHAR DEFAULT 'approved',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 7. OPTIMIZED INDEXES FOR LIGHTNING-FAST SSR CRAWL QUERIES
    console.log('Creating high-performance indexes...');
    await query(`CREATE INDEX IF NOT EXISTS idx_movers_city_rank ON movers(city_id, rank_order ASC);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_intent_slug ON intent_routes(slug_pattern);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_states_slug ON states(slug);`);
    await query(`CREATE INDEX IF NOT EXISTS idx_movers_slug ON movers(slug);`);

    console.log('✅ Enterprise Database Migration Completed Successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration Failed:', err);
    process.exit(1);
  }
}

migrate();

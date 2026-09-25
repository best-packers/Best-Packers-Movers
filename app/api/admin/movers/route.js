import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';

function slugify(text) {
  return text.toString().toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-');
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const cityId = searchParams.get('city_id');

    // Single mover fetch
    if (id) {
      const res = await query(
        `SELECT m.*, c.name as city_name, c.slug as city_slug, s.name as state_name, s.slug as state_slug 
         FROM movers m 
         LEFT JOIN cities c ON m.city_id = c.id 
         LEFT JOIN states s ON c.state_id = s.id 
         WHERE m.id = $1`,
        [id]
      );
      if (res.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'Mover not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, mover: res.rows[0] });
    }

    // City movers fetch
    let sql = 'SELECT m.*, c.name as city_name, s.name as state_name FROM movers m LEFT JOIN cities c ON m.city_id = c.id LEFT JOIN states s ON c.state_id = s.id';
    let params = [];

    if (cityId) {
      sql += ' WHERE m.city_id = $1';
      params.push(cityId);
    }

    sql += ' ORDER BY m.rank_order ASC, m.rating DESC LIMIT 200';

    const res = await query(sql, params);
    return NextResponse.json({ success: true, movers: res.rows || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      phone,
      email,
      website_url,
      address,
      rating,
      review_count,
      rank_order,
      is_verified,
      is_featured,
      established_year,
      fleet_size,
      badges,
      services_offered,
      pricing_table,
      about_text,
      gallery_images,
      logo_url,
      banner_url
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Mover ID is required' }, { status: 400 });
    }

    await query(
      `UPDATE movers SET
        name = COALESCE($1, name),
        phone = COALESCE($2, phone),
        email = COALESCE($3, email),
        website_url = COALESCE($4, website_url),
        address = COALESCE($5, address),
        rating = COALESCE($6, rating),
        review_count = COALESCE($7, review_count),
        rank_order = COALESCE($8, rank_order),
        is_verified = COALESCE($9, is_verified),
        is_featured = COALESCE($10, is_featured),
        established_year = COALESCE($11, established_year),
        fleet_size = COALESCE($12, fleet_size),
        badges = COALESCE($13, badges),
        services_offered = COALESCE($14, services_offered),
        pricing_table = COALESCE($15, pricing_table),
        about_text = COALESCE($16, about_text),
        gallery_images = COALESCE($17, gallery_images),
        logo_url = COALESCE($18, logo_url),
        banner_url = COALESCE($19, banner_url)
       WHERE id = $20`,
      [
        name !== undefined ? name : null,
        phone !== undefined ? phone : null,
        email !== undefined ? email : null,
        website_url !== undefined ? website_url : null,
        address !== undefined ? address : null,
        rating !== undefined ? Number(rating) : null,
        review_count !== undefined ? Number(review_count) : null,
        rank_order !== undefined ? Number(rank_order) : null,
        is_verified !== undefined ? (is_verified ? 1 : 0) : null,
        is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        established_year !== undefined ? established_year : null,
        fleet_size !== undefined ? fleet_size : null,
        badges !== undefined ? (typeof badges === 'string' ? badges : JSON.stringify(badges)) : null,
        services_offered !== undefined ? (typeof services_offered === 'string' ? services_offered : JSON.stringify(services_offered)) : null,
        pricing_table !== undefined ? (typeof pricing_table === 'string' ? pricing_table : JSON.stringify(pricing_table)) : null,
        about_text !== undefined ? about_text : null,
        gallery_images !== undefined ? (typeof gallery_images === 'string' ? gallery_images : JSON.stringify(gallery_images)) : null,
        logo_url !== undefined ? logo_url : null,
        banner_url !== undefined ? banner_url : null,
        id
      ]
    );

    return NextResponse.json({ success: true, message: 'Mover profile updated successfully' });
  } catch (err) {
    console.error('Mover PUT error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      city_id, name, phone, email, website_url, address, 
      rating, established_year, fleet_size, badges, services_offered, pricing_table, about_text 
    } = body;

    if (!city_id || !name || !phone) {
      return NextResponse.json({ success: false, error: 'City, name, and phone are required' }, { status: 400 });
    }

    const moverId = generateId();
    const moverSlug = `${slugify(name)}-${Date.now()}`;

    // Get current max rank in city
    const rankRes = await query('SELECT MAX(rank_order) as max_rank FROM movers WHERE city_id = $1', [city_id]);
    const nextRank = Math.max(1, Number(rankRes.rows[0]?.max_rank || 1)) + 1;

    const defaultPricing = pricing_table || {
      '1bhk': '₹3,500 - ₹6,500',
      '2bhk': '₹5,500 - ₹9,500',
      '3bhk': '₹8,500 - ₹14,500'
    };

    const defaultServices = services_offered || ['Household Shifting', 'Vehicle Moving', 'Office Relocation'];

    await query(
      `INSERT INTO movers (
        id, city_id, name, slug, phone, email, website_url, address,
        rating, review_count, rank_order, is_verified, is_featured,
        badges, services_offered, pricing_table, about_text, established_year, fleet_size, source
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, 30, $10, true, false,
        $11, $12, $13, $14, $15, $16, 'manual'
      )`,
      [
        moverId,
        city_id,
        name.trim(),
        moverSlug,
        phone.trim(),
        email || null,
        website_url || null,
        address || 'Transport Nagar Commercial Area',
        Number(rating) || 4.5,
        nextRank,
        JSON.stringify(badges || ['Verified Vendor']),
        JSON.stringify(defaultServices),
        JSON.stringify(defaultPricing),
        about_text || `${name} is a verified moving and logistics company providing residential and commercial relocation services.`,
        established_year || '2015',
        fleet_size || '10+ Vehicles'
      ]
    );

    return NextResponse.json({ 
      success: true, 
      mover_id: moverId, 
      slug: moverSlug,
      message: 'Custom mover added successfully' 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Mover ID is required' }, { status: 400 });
    }

    await query('DELETE FROM movers WHERE id = $1', [id]);
    return NextResponse.json({ success: true, message: 'Mover deleted successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

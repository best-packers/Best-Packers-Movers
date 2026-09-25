import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const cityId = searchParams.get('city_id');

    let sql = 'SELECT r.*, c.name as city_name FROM intent_routes r LEFT JOIN cities c ON r.city_id = c.id';
    let params = [];

    if (cityId) {
      sql += ' WHERE r.city_id = $1';
      params.push(cityId);
    }

    sql += ' ORDER BY r.slug_pattern ASC LIMIT 150';
    const res = await query(sql, params);
    return NextResponse.json({ success: true, routes: res.rows || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { city_id, intent_type, slug_pattern, meta_title, meta_description, h1_heading, intro_text } = body;

    if (!city_id || !slug_pattern || !meta_title) {
      return NextResponse.json({ success: false, error: 'City, slug pattern, and meta title required' }, { status: 400 });
    }

    const routeId = generateId();
    await query(
      `INSERT INTO intent_routes (
        id, city_id, intent_type, slug_pattern, meta_title, meta_description, h1_heading, intro_text, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)`,
      [
        routeId,
        city_id,
        intent_type || 'custom',
        slug_pattern.trim().toLowerCase(),
        meta_title.trim(),
        meta_description || meta_title,
        h1_heading || meta_title,
        intro_text || ''
      ]
    );

    return NextResponse.json({ success: true, route_id: routeId, message: 'Intent route created successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, meta_title, meta_description, h1_heading, intro_text, is_active } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Route ID required' }, { status: 400 });
    }

    await query(
      `UPDATE intent_routes SET
        meta_title = COALESCE($1, meta_title),
        meta_description = COALESCE($2, meta_description),
        h1_heading = COALESCE($3, h1_heading),
        intro_text = COALESCE($4, intro_text),
        is_active = COALESCE($5, is_active)
       WHERE id = $6`,
      [
        meta_title || null,
        meta_description || null,
        h1_heading || null,
        intro_text || null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id
      ]
    );

    return NextResponse.json({ success: true, message: 'Intent route updated successfully' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

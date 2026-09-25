import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const res = await query(`
      SELECT l.*, m.name as mover_name 
      FROM directory_leads l 
      LEFT JOIN movers m ON l.mover_id = m.id 
      ORDER BY l.created_at DESC LIMIT 200
    `);
    return NextResponse.json({ success: true, leads: res.rows || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Lead ID and status required' }, { status: 400 });
    }

    await query('UPDATE directory_leads SET status = $1 WHERE id = $2', [status, id]);
    return NextResponse.json({ success: true, message: 'Lead status updated' });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

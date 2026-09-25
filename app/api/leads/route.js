import { NextResponse } from 'next/server';
import { query, generateId } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, from_city, to_city, move_date, move_size, mover_id, source_page } = body;

    if (!customer_name || !customer_phone || !from_city) {
      return NextResponse.json(
        { success: false, error: 'Missing required lead details (name, phone, origin city)' },
        { status: 400 }
      );
    }

    const leadId = generateId();
    await query(
      `INSERT INTO directory_leads (
        id, mover_id, customer_name, customer_phone, from_city, to_city,
        move_date, move_size, source_page, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'New')`,
      [
        leadId,
        mover_id || null,
        customer_name.trim(),
        customer_phone.trim(),
        from_city.trim(),
        (to_city || '').trim(),
        move_date || null,
        move_size || '2 BHK',
        source_page || '/'
      ]
    );

    console.log(`[CRM INBOUND LEAD] ${customer_name} (${customer_phone}) | ${from_city} -> ${to_city || 'Local'}`);

    return NextResponse.json({
      success: true,
      lead_id: leadId,
      message: 'Lead captured successfully'
    });
  } catch (err) {
    console.error('API /leads error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error while saving lead.' },
      { status: 500 }
    );
  }
}

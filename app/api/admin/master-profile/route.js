import { NextResponse } from 'next/server';
import { getMasterNationalProfile, updateMasterNationalProfile } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const profile = getMasterNationalProfile();
    return NextResponse.json({ success: true, profile });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updated = updateMasterNationalProfile(body);
    return NextResponse.json({ 
      success: true, 
      profile: updated, 
      message: 'Master National Packers & Movers Profile updated successfully across all 7,606+ cities!' 
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { 
  ADMIN_COOKIE_NAME, 
  validateAdminCredentials, 
  generateAdminSessionToken, 
  verifyAdminSessionToken 
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!validateAdminCredentials(userId, password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid User ID or Password' },
        { status: 401 }
      );
    }

    const token = generateAdminSessionToken();
    const cookieStore = cookies();

    cookieStore.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days session
    });

    return NextResponse.json({
      success: true,
      message: 'Admin access authorized successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Server authentication error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = cookies();
    cookieStore.set(ADMIN_COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    return NextResponse.json({
      success: true,
      message: 'Admin session terminated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const isValid = verifyAdminSessionToken(token);

    return NextResponse.json({
      authenticated: isValid,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

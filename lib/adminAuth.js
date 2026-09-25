import crypto from 'crypto';

const ADMIN_USER = process.env.ADMIN_USER_ID || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'debabrata74618';
const AUTH_SECRET = process.env.ADMIN_AUTH_SECRET || 'bpm_empire_stealth_admin_secret_key_2026';

export const ADMIN_COOKIE_NAME = 'bpm_admin_session';

/**
 * Generate a cryptographically signed session token for the admin
 */
export function generateAdminSessionToken() {
  return crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(`${ADMIN_USER}:${ADMIN_PASS}:authenticated`)
    .digest('hex');
}

/**
 * Validate user credentials against admin user ID and password
 */
export function validateAdminCredentials(userId, password) {
  if (!userId || !password) return false;
  return (
    userId.trim().toLowerCase() === ADMIN_USER.toLowerCase() &&
    password === ADMIN_PASS
  );
}

/**
 * Verify whether a session token matches the expected HMAC signature
 */
export function verifyAdminSessionToken(token) {
  if (!token || typeof token !== 'string') return false;
  try {
    const expected = generateAdminSessionToken();
    const tokenBuffer = Buffer.from(token);
    const expectedBuffer = Buffer.from(expected);
    if (tokenBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(tokenBuffer, expectedBuffer);
  } catch (_) {
    return false;
  }
}

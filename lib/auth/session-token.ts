import crypto from 'node:crypto';
import { validateSecret } from '@/lib/security/env';

// Pure token helpers with no Next.js imports, so proxy.ts and tests can use them.

export const ADMIN_SESSION_COOKIE = 'volta_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface AdminSession {
  username: string;
  expiresAt: number;
}

interface AdminAuthConfig {
  username: string;
  password: string;
  secret: string;
}

export function getAdminAuthConfig(): AdminAuthConfig | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!username || !password || !validateSecret('ADMIN_SESSION_SECRET', secret).valid) {
    return null;
  }
  return { username, password, secret: secret! };
}

// The signing key includes the credentials, so changing the admin password
// (or the secret) signs everyone out.
function signingKey(config: AdminAuthConfig): Buffer {
  return crypto
    .createHash('sha256')
    .update(`${config.secret}\0${config.username}\0${config.password}`)
    .digest();
}

function sign(payload: string, config: AdminAuthConfig): string {
  return crypto.createHmac('sha256', signingKey(config)).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const digestA = crypto.createHash('sha256').update(a).digest();
  const digestB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const config = getAdminAuthConfig();
  if (!config) return false;
  // Evaluate both so a wrong username takes as long as a wrong password.
  const usernameOk = safeEqual(username, config.username);
  const passwordOk = safeEqual(password, config.password);
  return usernameOk && passwordOk;
}

export function createSessionToken(username: string, now = Date.now()): string {
  const config = getAdminAuthConfig();
  if (!config) throw new Error('Admin login is not configured.');
  const session: AdminSession = {
    username,
    expiresAt: Math.floor(now / 1000) + ADMIN_SESSION_TTL_SECONDS,
  };
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload, config)}`;
}

export function verifySessionToken(
  token: string | undefined,
  now = Date.now()
): AdminSession | null {
  const config = getAdminAuthConfig();
  if (!config || !token) return null;

  const [payload, signature, extra] = token.split('.');
  if (!payload || !signature || extra !== undefined) return null;
  if (!safeEqual(signature, sign(payload, config))) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString()) as AdminSession;
    if (typeof session.expiresAt !== 'number' || session.expiresAt * 1000 <= now) return null;
    if (session.username !== config.username) return null;
    return session;
  } catch {
    return null;
  }
}

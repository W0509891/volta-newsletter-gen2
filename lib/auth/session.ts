import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  AdminSession,
  createSessionToken,
  verifySessionToken,
} from './session-token';

export async function startAdminSession(username: string) {
  (await cookies()).set(ADMIN_SESSION_COOKIE, createSessionToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  return verifySessionToken((await cookies()).get(ADMIN_SESSION_COOKIE)?.value);
});

/** For admin pages: sends signed-out visitors to the login screen. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect('/login');
  return session;
}

/**
 * For Server Actions and Route Handlers. Server Actions are public POST
 * endpoints, so every admin action must call this itself.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized: please sign in again.');
  return session;
}

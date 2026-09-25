'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { endAdminSession, startAdminSession } from '@/lib/auth/session';
import { checkAdminCredentials, getAdminAuthConfig } from '@/lib/auth/session-token';
import { checkRateLimit } from '@/lib/security/rate-limit';

export interface LoginState {
  error?: string;
}

/** Only allow same-site relative paths, so ?next= can't redirect off-site. */
function safeNextPath(value: FormDataEntryValue | null): string {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\')
    ? next
    : '/admin';
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!getAdminAuthConfig()) {
    return {
      error:
        'Admin login is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET (24+ characters).',
    };
  }

  const headerList = await headers();
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
    headerList.get('x-real-ip') ||
    'unknown';
  const limit = checkRateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return { error: 'Too many login attempts. Try again in a few minutes.' };
  }

  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  if (!checkAdminCredentials(username, password)) {
    return { error: 'Incorrect username or password.' };
  }

  await startAdminSession(username);
  redirect(safeNextPath(formData.get('next')));
}

export async function logoutAction() {
  await endAdminSession();
  redirect('/login');
}

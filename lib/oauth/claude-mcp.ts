import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { validateSecret } from '@/lib/security/env';

const DEFAULT_CLIENT_ID = 'volta_user';
const DEFAULT_REDIRECT_URI = 'https://claude.ai/api/mcp/auth_callback';
const CODE_TTL_MS = 5 * 60 * 1000;

type AuthorizationCodePayload = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  exp: number;
  nonce: string;
};

export type OAuthValidationResult =
  | { valid: true; token: string }
  | { valid: false; status: number; error: string; description?: string };

function base64UrlEncode(value: Buffer | string) {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlDecode(value: string) {
  const padded = value + '='.repeat((4 - (value.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function getSigningSecret() {
  const token = process.env.VOLTA_MCP_TOKEN;
  const validation = validateSecret('VOLTA_MCP_TOKEN', token);
  if (!validation.valid || !token) {
    return { valid: false as const, error: validation.error || 'VOLTA_MCP_TOKEN is invalid.' };
  }

  return { valid: true as const, token };
}

function sign(payload: string, secret: string) {
  return base64UrlEncode(createHmac('sha256', secret).update(payload).digest());
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);
  return aBuffer.length === bBuffer.length && timingSafeEqual(aBuffer, bBuffer);
}

export function oauthClientId() {
  return process.env.VOLTA_OAUTH_CLIENT_ID || DEFAULT_CLIENT_ID;
}

export function oauthRedirectUris() {
  return (process.env.VOLTA_OAUTH_REDIRECT_URIS || DEFAULT_REDIRECT_URI)
    .split(';')
    .map((uri) => uri.trim())
    .filter(Boolean);
}

export function isAllowedRedirectUri(redirectUri: string) {
  return oauthRedirectUris().includes(redirectUri);
}

export function createAuthorizationCode(params: {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
}) {
  const secret = getSigningSecret();
  if (!secret.valid) return secret;

  const payload: AuthorizationCodePayload = {
    clientId: params.clientId,
    redirectUri: params.redirectUri,
    codeChallenge: params.codeChallenge,
    exp: Date.now() + CODE_TTL_MS,
    nonce: randomBytes(16).toString('hex'),
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  return {
    valid: true as const,
    code: `${encodedPayload}.${sign(encodedPayload, secret.token)}`,
  };
}

export function validateAuthorizationCode(params: {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}): OAuthValidationResult {
  const secret = getSigningSecret();
  if (!secret.valid) {
    return { valid: false, status: 503, error: 'server_error', description: secret.error };
  }

  const [encodedPayload, signature] = params.code.split('.');
  if (!encodedPayload || !signature || !safeEqual(signature, sign(encodedPayload, secret.token))) {
    return { valid: false, status: 400, error: 'invalid_grant', description: 'Invalid authorization code.' };
  }

  let payload: AuthorizationCodePayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString('utf8'));
  } catch {
    return { valid: false, status: 400, error: 'invalid_grant', description: 'Invalid authorization code.' };
  }

  if (payload.exp < Date.now()) {
    return { valid: false, status: 400, error: 'invalid_grant', description: 'Authorization code expired.' };
  }

  if (payload.clientId !== params.clientId || payload.redirectUri !== params.redirectUri) {
    return { valid: false, status: 400, error: 'invalid_grant', description: 'Authorization code mismatch.' };
  }

  const verifierChallenge = base64UrlEncode(createHash('sha256').update(params.codeVerifier).digest());
  if (!safeEqual(verifierChallenge, payload.codeChallenge)) {
    return { valid: false, status: 400, error: 'invalid_grant', description: 'PKCE verification failed.' };
  }

  return { valid: true, token: secret.token };
}

export function issuerFromRequest(request: Request) {
  const url = new URL(request.url);
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();
  const proto = forwardedProto || url.protocol.replace(':', '');
  const host = forwardedHost || request.headers.get('host') || url.host;
  return `${proto}://${host}`;
}

export function oauthMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/authorize`,
    token_endpoint: `${origin}/token`,
    response_types_supported: ['code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    grant_types_supported: ['authorization_code'],
  };
}


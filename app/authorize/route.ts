import { createAuthorizationCode, isAllowedRedirectUri, oauthClientId } from '@/lib/oauth/claude-mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function redirectWithError(redirectUri: string, error: string, state: string | null, description?: string) {
  const callback = new URL(redirectUri);
  callback.searchParams.set('error', error);
  if (description) callback.searchParams.set('error_description', description);
  if (state) callback.searchParams.set('state', state);
  return Response.redirect(callback, 302);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const responseType = url.searchParams.get('response_type');
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');
  const codeChallenge = url.searchParams.get('code_challenge');
  const codeChallengeMethod = url.searchParams.get('code_challenge_method');
  const state = url.searchParams.get('state');

  if (!redirectUri || !isAllowedRedirectUri(redirectUri)) {
    return Response.json({ error: 'invalid_request', error_description: 'Unsupported redirect_uri.' }, { status: 400 });
  }

  if (responseType !== 'code') {
    return redirectWithError(redirectUri, 'unsupported_response_type', state);
  }

  if (clientId !== oauthClientId()) {
    return redirectWithError(redirectUri, 'unauthorized_client', state);
  }

  if (!codeChallenge || codeChallengeMethod !== 'S256') {
    return redirectWithError(redirectUri, 'invalid_request', state, 'S256 PKCE is required.');
  }

  const code = createAuthorizationCode({ clientId, redirectUri, codeChallenge });
  if (!code.valid) {
    return redirectWithError(redirectUri, 'server_error', state, code.error);
  }

  const callback = new URL(redirectUri);
  callback.searchParams.set('code', code.code);
  if (state) callback.searchParams.set('state', state);
  return Response.redirect(callback, 302);
}


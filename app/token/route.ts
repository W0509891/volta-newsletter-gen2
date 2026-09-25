import { validateAuthorizationCode } from '@/lib/oauth/claude-mcp';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function oauthError(status: number, error: string, description?: string) {
  return Response.json(
    {
      error,
      ...(description ? { error_description: description } : {}),
    },
    { status, headers: corsHeaders() }
  );
}

async function formBody(request: Request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const body = await request.json();
    return new URLSearchParams(
      Object.entries(body as Record<string, string>).filter((entry): entry is [string, string] => {
        return typeof entry[1] === 'string';
      })
    );
  }

  return request.formData().then((form) => {
    const params = new URLSearchParams();
    for (const [key, value] of form.entries()) {
      if (typeof value === 'string') params.set(key, value);
    }
    return params;
  });
}

export async function POST(request: Request) {
  const body = await formBody(request);
  const grantType = body.get('grant_type');
  const code = body.get('code');
  const clientId = body.get('client_id');
  const redirectUri = body.get('redirect_uri');
  const codeVerifier = body.get('code_verifier');

  if (grantType !== 'authorization_code') {
    return oauthError(400, 'unsupported_grant_type');
  }

  if (!code || !clientId || !redirectUri || !codeVerifier) {
    return oauthError(400, 'invalid_request', 'code, client_id, redirect_uri, and code_verifier are required.');
  }

  const validation = validateAuthorizationCode({ code, clientId, redirectUri, codeVerifier });
  if (!validation.valid) {
    return oauthError(validation.status, validation.error, validation.description);
  }

  return Response.json(
    {
      access_token: validation.token,
      token_type: 'Bearer',
    },
    { headers: corsHeaders() }
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}


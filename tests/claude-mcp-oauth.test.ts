import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  createAuthorizationCode,
  isAllowedRedirectUri,
  oauthClientId,
  validateAuthorizationCode,
} from '@/lib/oauth/claude-mcp';

function challengeFor(verifier: string) {
  return createHash('sha256')
    .update(verifier)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

test('Claude MCP OAuth defaults match the web client callback', () => {
  assert.equal(oauthClientId(), 'volta_user');
  assert.equal(isAllowedRedirectUri('https://claude.ai/api/mcp/auth_callback'), true);
});

test('authorization code validates with the matching PKCE verifier', () => {
  const originalToken = process.env.VOLTA_MCP_TOKEN;
  process.env.VOLTA_MCP_TOKEN = 'a-secure-development-token';

  try {
    const verifier = 'correct-horse-battery-staple';
    const code = createAuthorizationCode({
      clientId: 'volta_user',
      redirectUri: 'https://claude.ai/api/mcp/auth_callback',
      codeChallenge: challengeFor(verifier),
    });

    assert.equal(code.valid, true);
    if (!code.valid) return;

    const validation = validateAuthorizationCode({
      code: code.code,
      clientId: 'volta_user',
      redirectUri: 'https://claude.ai/api/mcp/auth_callback',
      codeVerifier: verifier,
    });

    assert.deepEqual(validation, { valid: true, token: 'a-secure-development-token' });
  } finally {
    process.env.VOLTA_MCP_TOKEN = originalToken;
  }
});

test('authorization code rejects a mismatched PKCE verifier', () => {
  const originalToken = process.env.VOLTA_MCP_TOKEN;
  process.env.VOLTA_MCP_TOKEN = 'a-secure-development-token';

  try {
    const code = createAuthorizationCode({
      clientId: 'volta_user',
      redirectUri: 'https://claude.ai/api/mcp/auth_callback',
      codeChallenge: challengeFor('expected-verifier'),
    });

    assert.equal(code.valid, true);
    if (!code.valid) return;

    const validation = validateAuthorizationCode({
      code: code.code,
      clientId: 'volta_user',
      redirectUri: 'https://claude.ai/api/mcp/auth_callback',
      codeVerifier: 'wrong-verifier',
    });

    assert.equal(validation.valid, false);
    if (!validation.valid) {
      assert.equal(validation.error, 'invalid_grant');
    }
  } finally {
    process.env.VOLTA_MCP_TOKEN = originalToken;
  }
});


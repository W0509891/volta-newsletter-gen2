import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit } from '@/lib/security/rate-limit';

test('rate limiter blocks requests after the configured limit', () => {
  const key = `test-${Date.now()}-${Math.random()}`;

  assert.equal(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed, true);
  assert.equal(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed, true);
  assert.equal(checkRateLimit(key, { limit: 2, windowMs: 60_000 }).allowed, false);
});

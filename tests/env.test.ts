import test from 'node:test';
import assert from 'node:assert/strict';
import { validateSecret } from '@/lib/security/env';

test('secret validation rejects missing and short values', () => {
  assert.equal(validateSecret('TOKEN', undefined).valid, false);
  assert.equal(validateSecret('TOKEN', 'short').valid, false);
});

test('secret validation accepts sufficiently long values', () => {
  assert.equal(validateSecret('TOKEN', 'a-secure-development-token').valid, true);
});

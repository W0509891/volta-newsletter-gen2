import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest, NextResponse } from 'next/server';
import { proxy, config } from '../proxy';

test('proxy logs incoming requests in production environment', () => {
  const originalEnv = process.env.NODE_ENV;
  (process.env as Record<string, string | undefined>).NODE_ENV = 'production';

  const logs: string[] = [];
  const originalLog = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.map(String).join(' '));
  };

  try {
    const req = new NextRequest('http://localhost:3000/admin/newsletters', {
      headers: {
        'x-forwarded-for': '203.0.113.195',
      },
    });

    const res = proxy(req);

    assert.ok(res instanceof NextResponse);
    assert.equal(logs.length, 1);
    assert.match(logs[0], /GET \/admin\/newsletters \(IP: 203\.0\.113\.195\)/);
  } finally {
    console.log = originalLog;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalEnv;
  }
});

test('proxy config defines matcher excluding static files', () => {
  assert.ok(config.matcher);
  assert.ok(Array.isArray(config.matcher));
});

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { wantsSsl, defaultPoolMax, normalizeConnectionString } = require('../server/store');
const { COOKIE_NAME, createAppHandler } = require('../server/app');
const { dispatchRequest } = require('./helpers');
const { publicUser } = require('../server/security');

test('ADR-0006: detecta SSL para Neon e sslmode=require', () => {
  assert.equal(wantsSsl('postgres://u:p@ep-x.neon.tech/neondb'), true);
  assert.equal(wantsSsl('postgres://u:p@localhost/db?sslmode=require'), true);
  assert.equal(wantsSsl('postgres://u:p@localhost:5432/digitar_pro'), false);
});

test('ADR-0006: remove channel_binding da URL do Neon', () => {
  const normalized = normalizeConnectionString(
    'postgresql://user:secret@ep-example-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require'
  );
  assert.equal(normalized.includes('channel_binding'), false);
  assert.match(normalized, /sslmode=require/);
  assert.match(normalized, /-pooler/);
});

test('ADR-0006: pool max=1 em URL Neon', () => {
  assert.equal(defaultPoolMax('postgres://u:p@ep-x.neon.tech/neondb'), 1);
  assert.equal(defaultPoolMax('postgres://u:p@localhost:5432/digitar_pro'), 10);
});

test('ADR-0006: cookie SameSite=None quando CORS_ORIGIN está definido', async () => {
  const prev = process.env.CORS_ORIGIN;
  process.env.CORS_ORIGIN = 'https://example.github.io';
  try {
    const store = {
      async findUserAuthByEmail() {
        return null;
      },
      async createUser({ name, email, passwordHash, role }) {
        return publicUser({
          id: 1,
          name,
          email,
          password_hash: passwordHash,
          role,
          status: 'active',
          created_at: new Date('2026-11-19T00:00:00Z'),
        });
      },
      async createSession() {},
    };
    const handler = createAppHandler({ store });
    const res = await dispatchRequest(handler, '/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Aluno Teste',
        email: 'aluno-cors@test.local',
        password: 'senha12345',
      }),
    });
    assert.equal(res.status, 201);
    const setCookie = res.headers.get('set-cookie') || '';
    assert.match(setCookie, new RegExp(`${COOKIE_NAME}=`));
    assert.match(setCookie, /SameSite=None/i);
    assert.match(setCookie, /Secure/i);
  } finally {
    if (prev === undefined) delete process.env.CORS_ORIGIN;
    else process.env.CORS_ORIGIN = prev;
  }
});

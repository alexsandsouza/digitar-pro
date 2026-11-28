'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { createAppHandler } = require('../server/app');
const { hashPassword, publicUser } = require('../server/security');
const { createApp, closeAll, startTestServer } = require('./helpers');

test.afterEach(closeAll);

function createMemoryStore(initialUsers = []) {
  let nextId = 1;
  const users = initialUsers.map((u) => ({
    id: nextId++,
    name: u.name,
    email: u.email.toLowerCase(),
    password_hash: u.passwordHash,
    role: u.role || 'student',
    status: u.status || 'active',
    created_at: new Date('2026-11-18T00:00:00Z'),
    deleted_at: null,
  }));
  const sessions = new Map();

  return {
    async ping() {
      return true;
    },
    async createUser({ name, email, passwordHash, role = 'student' }) {
      const normalized = email.toLowerCase();
      if (users.some((u) => u.email === normalized && !u.deleted_at)) {
        const err = new Error('duplicate');
        err.code = '23505';
        throw err;
      }
      const row = {
        id: nextId++,
        name,
        email: normalized,
        password_hash: passwordHash,
        role,
        status: 'active',
        created_at: new Date('2026-11-18T00:01:00Z'),
        deleted_at: null,
      };
      users.push(row);
      return publicUser(row);
    },
    async findUserAuthByEmail(email) {
      return users.find((u) => u.email === email.toLowerCase() && !u.deleted_at) || null;
    },
    async createSession({ sessionId, userId, expiresAt }) {
      sessions.set(sessionId, { userId, expiresAt });
    },
    async findUserBySession(sessionId) {
      const s = sessions.get(sessionId);
      if (!s || s.expiresAt <= new Date()) return null;
      const user = users.find((u) => u.id === s.userId && !u.deleted_at && u.status === 'active');
      return publicUser(user || null);
    },
    async deleteSession(sessionId) {
      sessions.delete(sessionId);
    },
    async listUsers() {
      return users.filter((u) => !u.deleted_at).map(publicUser);
    },
    async getAdminOverview() {
      const active = users.filter((u) => !u.deleted_at);
      return {
        total_users: active.length,
        students: active.filter((u) => u.role === 'student').length,
        admins: active.filter((u) => u.role === 'admin').length,
        billing_enabled: false,
      };
    },
    async deleteAccount(userId) {
      for (const [sid, s] of sessions.entries()) {
        if (s.userId === userId) sessions.delete(sid);
      }
      const user = users.find((u) => u.id === userId);
      if (user) {
        user.deleted_at = new Date();
        user.status = 'disabled';
        user.password_hash = '';
        user.email = `deleted-${user.id}@removed.local`;
        user.name = 'Conta removida';
      }
    },
  };
}

function cookieFromHeaders(res) {
  const raw = res.headers.get('set-cookie');
  return raw ? raw.split(';')[0] : '';
}

test('AC-018: cadastro público cria somente conta student mesmo se enviar role admin', async () => {
  const store = createMemoryStore();
  const srv = await startTestServer(store);
  try {
    const res = await fetch(`${srv.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Maria Aluna',
        email: 'maria@exemplo.com',
        password: 'SenhaForte123',
        role: 'admin',
      }),
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.user.role, 'student');
    assert.equal(body.user.password_hash, undefined);
  } finally {
    await srv.close();
  }
});

test('AC-014: aluno autenticado recebe 403 em rotas administrativas', async () => {
  const store = createMemoryStore([
    {
      name: 'Aluno Teste',
      email: 'aluno@exemplo.com',
      passwordHash: hashPassword('SenhaAluno123'),
      role: 'student',
    },
  ]);
  const srv = await startTestServer(store);
  try {
    const loginRes = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aluno@exemplo.com', password: 'SenhaAluno123' }),
    });
    assert.equal(loginRes.status, 200);
    const cookie = cookieFromHeaders(loginRes);

    const meRes = await fetch(`${srv.baseUrl}/api/me`, { headers: { Cookie: cookie } });
    assert.equal(meRes.status, 200);
    const me = await meRes.json();
    assert.equal(me.user.role, 'student');

    const adminUsersRes = await fetch(`${srv.baseUrl}/api/admin/users`, { headers: { Cookie: cookie } });
    assert.equal(adminUsersRes.status, 403);

    const adminOverviewRes = await fetch(`${srv.baseUrl}/api/admin/overview`, { headers: { Cookie: cookie } });
    assert.equal(adminOverviewRes.status, 403);
  } finally {
    await srv.close();
  }
});

test('AC-015: administrador autenticado vê lista de contas e resumo sem password_hash', async () => {
  const store = createMemoryStore([
    {
      name: 'Admin Sistema',
      email: 'admin@digitarpro.local',
      passwordHash: hashPassword('AdminForte123'),
      role: 'admin',
    },
    {
      name: 'Joao Silva',
      email: 'joao@exemplo.com',
      passwordHash: hashPassword('SenhaJoao123'),
      role: 'student',
    },
  ]);
  const srv = await startTestServer(store);
  try {
    const loginRes = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@digitarpro.local', password: 'AdminForte123' }),
    });
    assert.equal(loginRes.status, 200);
    const cookie = cookieFromHeaders(loginRes);

    const listRes = await fetch(`${srv.baseUrl}/api/admin/users`, { headers: { Cookie: cookie } });
    assert.equal(listRes.status, 200);
    const listData = await listRes.json();
    assert.equal(listData.users.length, 2);
    for (const u of listData.users) {
      assert.equal(u.password_hash, undefined);
      assert.equal(u.password, undefined);
    }

    const overviewRes = await fetch(`${srv.baseUrl}/api/admin/overview`, { headers: { Cookie: cookie } });
    assert.equal(overviewRes.status, 200);
    const overview = await overviewRes.json();
    assert.equal(overview.total_users, 2);
    assert.equal(overview.students, 1);
    assert.equal(overview.admins, 1);
  } finally {
    await srv.close();
  }
});

test('LGPD: aluno pode excluir própria conta e perde sessão ativa', async () => {
  const store = createMemoryStore([
    {
      name: 'Ana Aluna',
      email: 'ana@exemplo.com',
      passwordHash: hashPassword('SenhaAna123'),
      role: 'student',
    },
  ]);
  const srv = await startTestServer(store);
  try {
    const loginRes = await fetch(`${srv.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@exemplo.com', password: 'SenhaAna123' }),
    });
    const cookie = cookieFromHeaders(loginRes);

    const delRes = await fetch(`${srv.baseUrl}/api/me`, {
      method: 'DELETE',
      headers: { Cookie: cookie },
    });
    assert.equal(delRes.status, 200);

    const meAfter = await fetch(`${srv.baseUrl}/api/me`, { headers: { Cookie: cookie } });
    assert.equal(meAfter.status, 401);
  } finally {
    await srv.close();
  }
});

test('AC-016 e AC-017: 720 lições seguem livres sem login e logout mantém localStorage', async () => {
  const app = createApp({
    progress: { 0: { wpm: 45, accuracy: 97, last: { wpm: 45, accuracy: 97, seconds: 20 } } },
    mode: 'precision',
    lesson: 7,
  });

  assert.equal(app.activeLessonIndex(), 7);
  assert.equal(app.lessonTitle(), 'Ergonomia e posição · Repetição 3');
  assert.equal(app.completedLabel(), '1 / 720');

  app.clickId('accountTrigger');
  assert.equal(app.get('accountModal').hidden, false);
  app.clickId('closeAccountModal');
  assert.equal(app.get('accountModal').hidden, true);

  app.clickId('logoutBtn');
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(app.stored()['0'].wpm, 45);
  assert.equal(app.window.localStorage.getItem('digitar-pro-typing-mode'), 'precision');
  assert.equal(app.window.localStorage.getItem('digitar-pro-current-lesson-v08'), '7');
});

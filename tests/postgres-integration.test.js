'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEnv } = require('../server/env');
loadEnv();

const { createPool, createPgStore, runMigrations } = require('../server/store');
const { hashPassword } = require('../server/security');
const { startTestServer } = require('./helpers');

const hasPostgres = Boolean(process.env.DATABASE_URL);

test(
  'Integração real PostgreSQL: cadastro student, RBAC 403, listagem admin sem hash e exclusão LGPD',
  { skip: !hasPostgres && 'DATABASE_URL não configurada' },
  async (t) => {
    let pool;
    try {
      pool = createPool({ connectionTimeoutMillis: 20000 });
      await pool.query('SELECT 1');
    } catch (err) {
      if (pool) await pool.end().catch(() => {});
      t.skip(`PostgreSQL não acessível (${err.message})`);
      return;
    }

    await runMigrations(pool);
    const store = createPgStore(pool);

    const unique = Date.now();
    const adminEmail = `it-admin-${unique}@digitarpro.local`;
    const studentEmail = `it-student-${unique}@digitarpro.local`;

    await store.upsertAdmin({
      name: 'Admin Integração',
      email: adminEmail,
      passwordHash: hashPassword('AdminInt123!'),
    });

    const srv = startTestServer(store);
    const base = srv.baseUrl;

    try {
      const healthRes = await fetch(`${base}/api/health`);
      assert.equal(healthRes.status, 200);
      const health = await healthRes.json();
      assert.equal(health.database, 'postgresql');

      // Auto-cadastro tentando escalar privilégio para admin -> nasce student (AC-018)
      const regRes = await fetch(`${base}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Aluno Postgres',
          email: studentEmail,
          password: 'AlunoInt123!',
          role: 'admin',
        }),
      });
      assert.equal(regRes.status, 201);
      const regBody = await regRes.json();
      assert.equal(regBody.user.role, 'student');
      const studentCookie = (regRes.headers.get('set-cookie') || '').split(';')[0];

      // Aluno não acessa rotas administrativas (AC-014)
      const forbiddenRes = await fetch(`${base}/api/admin/users`, {
        headers: { Cookie: studentCookie },
      });
      assert.equal(forbiddenRes.status, 403);

      // Admin acessa lista sem password_hash (AC-015)
      const adminLoginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: 'AdminInt123!' }),
      });
      assert.equal(adminLoginRes.status, 200);
      const adminCookie = (adminLoginRes.headers.get('set-cookie') || '').split(';')[0];

      const usersRes = await fetch(`${base}/api/admin/users`, {
        headers: { Cookie: adminCookie },
      });
      assert.equal(usersRes.status, 200);
      const usersBody = await usersRes.json();
      const foundStudent = usersBody.users.find((u) => u.email === studentEmail);
      assert.ok(foundStudent);
      assert.equal(foundStudent.password_hash, undefined);

      // Exclusão LGPD do aluno
      const delRes = await fetch(`${base}/api/me`, {
        method: 'DELETE',
        headers: { Cookie: studentCookie },
      });
      assert.equal(delRes.status, 200);

      const meAfterDel = await fetch(`${base}/api/me`, {
        headers: { Cookie: studentCookie },
      });
      assert.equal(meAfterDel.status, 401);
    } finally {
      await srv.close();
      await pool.query('DELETE FROM users WHERE email = ANY($1)', [[adminEmail, studentEmail]]).catch(() => {});
      await pool.query("DELETE FROM users WHERE email LIKE 'deleted-%@removed.local' AND name = 'Conta removida'").catch(() => {});
      await pool.end();
    }
  }
);

'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');
const { normalizeEmail, publicUser } = require('./security');

const MIGRATION_PATH = path.join(__dirname, '..', 'db', 'migrations', '001_accounts_rbac.sql');

function createPool(databaseUrl = process.env.DATABASE_URL, options = {}) {
  let finalUrl = databaseUrl;
  let finalOpts = options;
  if (typeof databaseUrl === 'object' && databaseUrl !== null) {
    finalOpts = databaseUrl;
    finalUrl = finalOpts.connectionString || process.env.DATABASE_URL;
  }
  if (!finalUrl) {
    throw new Error('DATABASE_URL não configurada.');
  }
  return new Pool({ connectionString: finalUrl, ...finalOpts });
}

async function runMigrations(pool) {
  const sql = fs.readFileSync(MIGRATION_PATH, 'utf8');
  await pool.query(sql);
}

function createPgStore(pool) {
  return {
    async ping() {
      await pool.query('SELECT 1');
      return true;
    },

    async createUser({ name, email, passwordHash, role = 'student' }) {
      const normalized = normalizeEmail(email);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role, status, created_at`,
        [String(name).trim(), normalized, passwordHash, role]
      );
      return publicUser(result.rows[0]);
    },

    async upsertAdmin({ name, email, passwordHash }) {
      const normalized = normalizeEmail(email);
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role, status, deleted_at)
         VALUES ($1, $2, $3, 'admin', 'active', NULL)
         ON CONFLICT (email) DO UPDATE
           SET name = EXCLUDED.name,
               password_hash = EXCLUDED.password_hash,
               role = 'admin',
               status = 'active',
               deleted_at = NULL
         RETURNING id, name, email, role, status, created_at`,
        [String(name).trim(), normalized, passwordHash]
      );
      return publicUser(result.rows[0]);
    },

    async findUserAuthByEmail(email) {
      const normalized = normalizeEmail(email);
      const result = await pool.query(
        `SELECT id, name, email, password_hash, role, status, created_at, deleted_at
         FROM users
         WHERE email = $1 AND deleted_at IS NULL
         LIMIT 1`,
        [normalized]
      );
      return result.rows[0] || null;
    },

    async createSession({ sessionId, userId, expiresAt }) {
      await pool.query(
        `INSERT INTO sessions (id, user_id, expires_at)
         VALUES ($1, $2, $3)`,
        [sessionId, userId, expiresAt]
      );
    },

    async findUserBySession(sessionId) {
      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.status, u.created_at
         FROM sessions s
         JOIN users u ON u.id = s.user_id
         WHERE s.id = $1
           AND s.expires_at > NOW()
           AND u.deleted_at IS NULL
           AND u.status = 'active'
         LIMIT 1`,
        [sessionId]
      );
      return publicUser(result.rows[0] || null);
    },

    async deleteSession(sessionId) {
      await pool.query('DELETE FROM sessions WHERE id = $1', [sessionId]);
    },

    async listUsers() {
      const result = await pool.query(
        `SELECT id, name, email, role, status, created_at
         FROM users
         WHERE deleted_at IS NULL
         ORDER BY created_at DESC, id DESC`
      );
      return result.rows.map(publicUser);
    },

    async getAdminOverview() {
      const result = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE deleted_at IS NULL)::int AS total_users,
           COUNT(*) FILTER (WHERE deleted_at IS NULL AND role = 'student')::int AS students,
           COUNT(*) FILTER (WHERE deleted_at IS NULL AND role = 'admin')::int AS admins
         FROM users`
      );
      const row = result.rows[0] || { total_users: 0, students: 0, admins: 0 };
      return {
        total_users: Number(row.total_users || 0),
        students: Number(row.students || 0),
        admins: Number(row.admins || 0),
        billing_enabled: false,
      };
    },

    async deleteAccount(userId) {
      await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
      await pool.query(
        `UPDATE users
         SET name = 'Conta removida',
             email = 'deleted-' || id || '@removed.local',
             password_hash = '',
             status = 'disabled',
             deleted_at = NOW()
         WHERE id = $1`,
        [userId]
      );
    },
  };
}

module.exports = {
  MIGRATION_PATH,
  createPool,
  runMigrations,
  createPgStore,
};

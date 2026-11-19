'use strict';

const crypto = require('node:crypto');

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LEN = 64;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function isValidEmail(email) {
  const normalized = normalizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) && normalized.length <= 254;
}

function hashPassword(password) {
  const value = String(password || '');
  if (value.length < 8) {
    throw new Error('A senha deve ter pelo menos 8 caracteres.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(value, salt, KEY_LEN, SCRYPT_PARAMS).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== 'string') return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, hashHex] = parts;
  if (!salt || !hashHex) return false;
  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length === 0) return false;
  const derived = crypto.scryptSync(String(password || ''), salt, expected.length, SCRYPT_PARAMS);
  return crypto.timingSafeEqual(expected, derived);
}

function createSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashSessionToken(token) {
  return crypto.createHash('sha256').update(String(token || '')).digest('hex');
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
  };
}

module.exports = {
  SESSION_TTL_MS,
  normalizeEmail,
  isValidEmail,
  hashPassword,
  verifyPassword,
  createSessionToken,
  hashSessionToken,
  publicUser,
};

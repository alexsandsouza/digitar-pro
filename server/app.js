'use strict';

const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {
  SESSION_TTL_MS,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  isValidEmail,
  publicUser,
  verifyPassword,
} = require('./security');

const COOKIE_NAME = 'dp_session';
const DEFAULT_INDEX_PATH = path.join(__dirname, '..', 'index.html');

function parseCookies(header) {
  const out = {};
  if (!header || typeof header !== 'string') return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(val);
  }
  return out;
}

function readJsonBody(req, limitBytes = 32 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error('Payload muito grande.'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) {
        resolve({});
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
          reject(Object.assign(new Error('JSON inválido.'), { statusCode: 400 }));
          return;
        }
        resolve(parsed);
      } catch {
        reject(Object.assign(new Error('JSON inválido.'), { statusCode: 400 }));
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(body);
}

function sessionCookieHeader(token, maxAgeSec) {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSec}`,
  ];
  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure');
  }
  return parts.join('; ');
}

function extractSessionToken(req) {
  const auth = req.headers.authorization;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
    const bearer = auth.slice(7).trim();
    if (bearer) return bearer;
  }
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] || null;
}

function applyCors(req, res, allowedOrigin) {
  const origin = req.headers.origin;
  if (!origin) return;
  if (allowedOrigin && origin === allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
}

function createAppHandler({ store, indexPath = DEFAULT_INDEX_PATH, allowedOrigin = process.env.CORS_ORIGIN || '' }) {
  async function getAuthenticatedUser(req) {
    const token = extractSessionToken(req);
    if (!token) return null;
    const sessionId = hashSessionToken(token);
    return store.findUserBySession(sessionId);
  }

  return async function handleRequest(req, res) {
    applyCors(req, res, allowedOrigin);
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = url.pathname;

    try {
      if (req.method === 'GET' && (pathname === '/' || pathname === '/index.html')) {
        if (!fs.existsSync(indexPath)) {
          sendJson(res, 404, { error: 'Página inicial não encontrada.' });
          return;
        }
        const html = fs.readFileSync(indexPath, 'utf8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
        return;
      }

      if (req.method === 'GET' && pathname.startsWith('/assets/')) {
        const assetsDir = path.resolve(path.dirname(indexPath), 'assets');
        const targetFile = path.resolve(path.dirname(indexPath), '.' + pathname);
        if (!targetFile.startsWith(assetsDir + path.sep) || !fs.existsSync(targetFile) || !fs.statSync(targetFile).isFile()) {
          sendJson(res, 404, { error: 'Arquivo não encontrado.' });
          return;
        }
        const ext = path.extname(targetFile).toLowerCase();
        const mime = {
          '.css': 'text/css; charset=utf-8',
          '.js': 'application/javascript; charset=utf-8',
          '.svg': 'image/svg+xml',
          '.webp': 'image/webp',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
        }[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
        res.end(fs.readFileSync(targetFile));
        return;
      }

      if (req.method === 'GET' && pathname === '/api/health') {
        await store.ping();
        sendJson(res, 200, { ok: true, database: 'postgresql' });
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/register') {
        const body = await readJsonBody(req);
        const name = String(body.name || '').trim();
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (name.length < 2 || name.length > 120) {
          sendJson(res, 400, { error: 'Informe um nome válido (entre 2 e 120 caracteres).' });
          return;
        }
        if (!isValidEmail(email)) {
          sendJson(res, 400, { error: 'Informe um e-mail válido.' });
          return;
        }
        if (password.length < 8) {
          sendJson(res, 400, { error: 'A senha deve ter pelo menos 8 caracteres.' });
          return;
        }

        const existing = await store.findUserAuthByEmail(email);
        if (existing) {
          sendJson(res, 409, { error: 'Já existe uma conta cadastrada com este e-mail.' });
          return;
        }

        // Cadastro público cria estritamente conta de aluno (AC-018), ignorando role enviado.
        const passwordHash = hashPassword(password);
        const user = await store.createUser({
          name,
          email,
          passwordHash,
          role: 'student',
        });

        const token = createSessionToken();
        const sessionId = hashSessionToken(token);
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await store.createSession({ sessionId, userId: user.id, expiresAt });

        sendJson(
          res,
          201,
          { user: publicUser(user) },
          { 'Set-Cookie': sessionCookieHeader(token, Math.floor(SESSION_TTL_MS / 1000)) }
        );
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/login') {
        const body = await readJsonBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const password = String(body.password || '');

        if (!isValidEmail(email) || !password) {
          sendJson(res, 400, { error: 'Informe e-mail e senha.' });
          return;
        }

        const found = await store.findUserAuthByEmail(email);
        if (!found || found.status !== 'active' || !verifyPassword(password, found.password_hash)) {
          sendJson(res, 401, { error: 'E-mail ou senha inválidos.' });
          return;
        }

        const token = createSessionToken();
        const sessionId = hashSessionToken(token);
        const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
        await store.createSession({ sessionId, userId: found.id, expiresAt });

        sendJson(
          res,
          200,
          { user: publicUser(found) },
          { 'Set-Cookie': sessionCookieHeader(token, Math.floor(SESSION_TTL_MS / 1000)) }
        );
        return;
      }

      if (req.method === 'POST' && pathname === '/api/auth/logout') {
        const token = extractSessionToken(req);
        if (token) {
          await store.deleteSession(hashSessionToken(token));
        }
        sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessionCookieHeader('', 0) });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/me') {
        const user = await getAuthenticatedUser(req);
        if (!user) {
          sendJson(res, 401, { error: 'Sessão não autenticada.' });
          return;
        }
        sendJson(res, 200, { user: publicUser(user) });
        return;
      }

      if (req.method === 'DELETE' && pathname === '/api/me') {
        const user = await getAuthenticatedUser(req);
        if (!user) {
          sendJson(res, 401, { error: 'Sessão não autenticada.' });
          return;
        }
        if (user.role === 'admin') {
          sendJson(res, 403, { error: 'Conta administrativa não pode ser removida pelo auto-atendimento.' });
          return;
        }
        await store.deleteAccount(user.id);
        sendJson(res, 200, { ok: true }, { 'Set-Cookie': sessionCookieHeader('', 0) });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/admin/users') {
        const user = await getAuthenticatedUser(req);
        if (!user) {
          sendJson(res, 401, { error: 'Autenticação necessária.' });
          return;
        }
        if (user.role !== 'admin') {
          sendJson(res, 403, { error: 'Acesso restrito ao administrador.' });
          return;
        }
        const users = await store.listUsers();
        sendJson(res, 200, { users: users.map(publicUser) });
        return;
      }

      if (req.method === 'GET' && pathname === '/api/admin/overview') {
        const user = await getAuthenticatedUser(req);
        if (!user) {
          sendJson(res, 401, { error: 'Autenticação necessária.' });
          return;
        }
        if (user.role !== 'admin') {
          sendJson(res, 403, { error: 'Acesso restrito ao administrador.' });
          return;
        }
        const overview = await store.getAdminOverview();
        sendJson(res, 200, overview);
        return;
      }

      sendJson(res, 404, { error: 'Rota não encontrada.' });
    } catch (err) {
      if (err && err.statusCode) {
        sendJson(res, err.statusCode, { error: err.message });
        return;
      }
      if (err && err.code === '23505') {
        sendJson(res, 409, { error: 'Já existe uma conta cadastrada com este e-mail.' });
        return;
      }
      sendJson(res, 500, { error: 'Erro interno ao processar a solicitação.' });
    }
  };
}

function createServer(deps) {
  return http.createServer(createAppHandler(deps));
}

module.exports = {
  COOKIE_NAME,
  createAppHandler,
  createServer,
};

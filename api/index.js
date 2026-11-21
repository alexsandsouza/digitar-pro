'use strict';

/**
 * Entrada serverless Vercel (ADR-0006).
 * Reutiliza o mesmo handler HTTP da FEAT-003; estáticos ficam no CDN da Vercel.
 */

const { createAppHandler } = require('../server/app');
const { createPool, createPgStore, runMigrations, migrationDatabaseUrl, attachRuntimePool } = require('../server/store');

let handlerPromise;

function shouldMigrateOnBoot() {
  if (process.env.RUN_MIGRATIONS_ON_BOOT === 'false') return false;
  if (process.env.RUN_MIGRATIONS_ON_BOOT === 'true') return true;
  // Neon/Vercel: migrações são IF NOT EXISTS; rodar uma vez por cold start é seguro no MVP.
  return Boolean(process.env.VERCEL || process.env.DATABASE_URL);
}

function getHandler() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL não configurada.');
      }
      if (shouldMigrateOnBoot()) {
        const migrationPool = createPool(migrationDatabaseUrl(), { max: 1 });
        try {
          await runMigrations(migrationPool);
        } finally {
          await migrationPool.end();
        }
      }
      const pool = attachRuntimePool(createPool());
      const store = createPgStore(pool);
      return createAppHandler({ store });
    })();
  }
  return handlerPromise;
}

module.exports = async function vercelHandler(req, res) {
  try {
    const handler = await getHandler();
    await handler(req, res);
  } catch (err) {
    console.error('vercelHandler:', err && err.message ? err.message : err);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify({ error: 'Erro interno ao processar a solicitação.' }));
    }
  }
};

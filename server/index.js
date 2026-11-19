'use strict';

const { loadEnv } = require('./env');
loadEnv();

const { createServer } = require('./app');
const { createPool, createPgStore, runMigrations, migrationDatabaseUrl, attachRuntimePool } = require('./store');

async function main() {
  const port = Number(process.env.PORT || 3000);
  const migrationPool = createPool(migrationDatabaseUrl(), { max: 1 });
  try {
    await runMigrations(migrationPool);
  } finally {
    await migrationPool.end();
  }
  const pool = attachRuntimePool(createPool());
  const store = createPgStore(pool);
  const server = createServer({ store });

  server.listen(port, () => {
    console.log(`Digitar Pro API + App rodando em http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Falha ao iniciar servidor:', err.message);
  process.exit(1);
});

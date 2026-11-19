'use strict';

const { loadEnv } = require('./env');
loadEnv();

const { createServer } = require('./app');
const { createPool, createPgStore, runMigrations } = require('./store');

async function main() {
  const port = Number(process.env.PORT || 3000);
  const pool = createPool();
  await runMigrations(pool);
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

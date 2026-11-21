'use strict';

const { loadEnv } = require('./env');
loadEnv();

const { createPool, runMigrations, migrationDatabaseUrl } = require('../server/store');

async function main() {
  const pool = createPool(migrationDatabaseUrl(), { max: 1 });
  try {
    await runMigrations(pool);
    console.log('Migração PostgreSQL aplicada com sucesso.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Erro na migração:', err.message);
  process.exit(1);
});

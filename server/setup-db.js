'use strict';

const { loadEnv } = require('./env');
loadEnv();

const { Client } = require('pg');
const { runMigrations } = require('./store');

async function main() {
  const targetUrl = process.env.DATABASE_URL;
  if (!targetUrl) {
    throw new Error('Defina DATABASE_URL no arquivo .env antes de rodar db:setup.');
  }

  const parsed = new URL(targetUrl);
  const dbName = parsed.pathname.replace(/^\//, '');
  if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error('Nome de banco inválido em DATABASE_URL.');
  }

  const adminUrl = new URL(targetUrl);
  adminUrl.pathname = '/postgres';

  const adminClient = new Client({ connectionString: adminUrl.toString() });
  await adminClient.connect();
  try {
    const check = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (check.rowCount === 0) {
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Banco "${dbName}" criado.`);
    } else {
      console.log(`Banco "${dbName}" já existe.`);
    }
  } finally {
    await adminClient.end();
  }

  const targetClient = new Client({ connectionString: targetUrl });
  await targetClient.connect();
  try {
    await runMigrations(targetClient);
    console.log('Migração 001_accounts_rbac.sql aplicada com sucesso.');
  } finally {
    await targetClient.end();
  }
}

main().catch((err) => {
  console.error('Erro no db:setup:', err.message);
  process.exit(1);
});

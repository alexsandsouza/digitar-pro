'use strict';

const { loadEnv } = require('./env');
loadEnv();

const { createPool, createPgStore, runMigrations } = require('./store');
const { hashPassword, isValidEmail } = require('./security');

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrador Digitar Pro';

  if (!isValidEmail(email)) {
    throw new Error('Defina ADMIN_EMAIL com um e-mail válido.');
  }
  if (!password || String(password).length < 8) {
    throw new Error('Defina ADMIN_PASSWORD com pelo menos 8 caracteres.');
  }

  const pool = createPool();
  try {
    await runMigrations(pool);
    const store = createPgStore(pool);
    const admin = await store.upsertAdmin({
      name,
      email,
      passwordHash: hashPassword(password),
    });
    console.log(`Administrador configurado: ${admin.email} (id=${admin.id}, role=${admin.role})`);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

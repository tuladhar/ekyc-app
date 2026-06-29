// scripts/migrate.mjs · Minimal dual-engine migration runner.
//
// Applies every migration in ../migrations (sorted by filename) that hasn't run
// yet, recording each in a schema_migrations table so re-runs are no-ops.
// Reuses the same DATABASE_* env vars and defaults as the app.
//
// Usage (inside the pod):  npm run migrate

import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', 'migrations');

const engine = process.env.DATABASE_ENGINE || 'mysql';
const cfg = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: Number(process.env.DATABASE_PORT) || (engine === 'pgsql' ? 5432 : 3306),
  database: process.env.DATABASE_NAME || 'sampledb',
  user: process.env.DATABASE_USER || 'app',
  password: process.env.DATABASE_PASSWORD || '',
};

// Thin adapter so the runner can speak to either engine with one interface.
async function connect() {
  if (engine === 'pgsql') {
    const { Client } = await import('pg');
    const client = new Client(cfg);
    await client.connect();
    return {
      query: async (sql, params = []) => (await client.query(sql, params)).rows,
      close: () => client.end(),
      placeholder: (i) => `$${i + 1}`,
    };
  }
  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection(cfg);
  return {
    query: async (sql, params = []) => (await conn.query(sql, params))[0],
    close: () => conn.end(),
    placeholder: () => '?',
  };
}

async function run() {
  const db = await connect();
  try {
    await db.query(
      `CREATE TABLE IF NOT EXISTS schema_migrations (
         version    VARCHAR(255) PRIMARY KEY,
         applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
       )`
    );

    const applied = new Set(
      (await db.query('SELECT version FROM schema_migrations')).map(
        (r) => r.version
      )
    );

    const files = (await readdir(MIGRATIONS_DIR))
      .filter((f) => f.endsWith('.mjs'))
      .sort();

    let count = 0;
    for (const file of files) {
      const version = file.replace(/\.mjs$/, '');
      if (applied.has(version)) {
        console.log(`= skip ${version} (already applied)`);
        continue;
      }
      const mod = await import(pathToFileURL(join(MIGRATIONS_DIR, file)).href);
      console.log(`+ apply ${version}`);
      await db.query(mod.up(engine));
      await db.query(
        `INSERT INTO schema_migrations (version) VALUES (${db.placeholder(0)})`,
        [version]
      );
      count++;
    }

    console.log(`Done. ${count} migration(s) applied on ${engine}.`);
  } finally {
    await db.close();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

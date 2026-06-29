// lib/db.js · Database helpers for the eKYC app.
//
// Connection settings come from the environment so the same image runs against
// either MySQL or PostgreSQL on OpenShift. Mirrors the original PHP defaults.

export function dbConfig() {
  const engine = process.env.DATABASE_ENGINE || 'mysql';
  return {
    engine,
    host: process.env.DATABASE_HOST || 'localhost',
    port: Number(process.env.DATABASE_PORT) || (engine === 'pgsql' ? 5432 : 3306),
    name: process.env.DATABASE_NAME || 'sampledb',
    user: process.env.DATABASE_USER || 'app',
    password: process.env.DATABASE_PASSWORD || '',
  };
}

// Open a connection, run `fn`, and always close — keeps the request stateless,
// which suits a containerised app that may scale to many pods.
async function withConnection(cfg, fn) {
  if (cfg.engine === 'pgsql') {
    const { Client } = await import('pg');
    const client = new Client({
      host: cfg.host,
      port: cfg.port,
      database: cfg.name,
      user: cfg.user,
      password: cfg.password,
    });
    await client.connect();
    try {
      return await fn(client);
    } finally {
      await client.end();
    }
  }

  const mysql = await import('mysql2/promise');
  const conn = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    database: cfg.name,
    user: cfg.user,
    password: cfg.password,
  });
  try {
    return await fn(conn);
  } finally {
    await conn.end();
  }
}

// Lightweight connectivity check used by the health endpoint.
export async function ping(cfg = dbConfig()) {
  await withConnection(cfg, (conn) => conn.query('SELECT 1'));
}

// List the tables visible to the app — same query intent as the PHP version.
export async function listTables(cfg = dbConfig()) {
  return withConnection(cfg, async (conn) => {
    if (cfg.engine === 'pgsql') {
      const res = await conn.query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
      );
      return res.rows.map((r) => r.tablename);
    }
    const [rows] = await conn.query('SHOW TABLES');
    return rows.map((r) => Object.values(r)[0]);
  });
}

// --- CKYC users (login / register) -----------------------------------------
// pg uses $1 placeholders and returns { rows }; mysql uses ? and returns [rows].

export async function findUserByEmail(email, cfg = dbConfig()) {
  return withConnection(cfg, async (conn) => {
    if (cfg.engine === 'pgsql') {
      const res = await conn.query(
        'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
        [email]
      );
      return res.rows[0] || null;
    }
    const [rows] = await conn.query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  });
}

export async function createUser({ email, passwordHash, fullName }, cfg = dbConfig()) {
  return withConnection(cfg, async (conn) => {
    if (cfg.engine === 'pgsql') {
      await conn.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3)',
        [email, passwordHash, fullName]
      );
    } else {
      await conn.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES (?, ?, ?)',
        [email, passwordHash, fullName]
      );
    }
  });
}

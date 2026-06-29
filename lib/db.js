// lib/db.js · Database helpers for the CKYC app.
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

// Run a parameterized query written in pg style ($1, $2, …) against either
// engine, returning an array of rows. MySQL uses ? placeholders, so we rewrite
// $n → ? for it. pg returns { rows }; mysql returns [rows].
async function exec(conn, engine, sql, params = []) {
  if (engine === 'pgsql') {
    return (await conn.query(sql, params)).rows;
  }
  const [rows] = await conn.query(sql.replace(/\$\d+/g, '?'), params);
  return rows;
}

// --- CKYC users (login / register) -----------------------------------------

export async function findUserByEmail(email, cfg = dbConfig()) {
  return withConnection(cfg, async (conn) => {
    const rows = await exec(
      conn,
      cfg.engine,
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  });
}

export async function createUser({ email, passwordHash, fullName }, cfg = dbConfig()) {
  return withConnection(cfg, (conn) =>
    exec(
      conn,
      cfg.engine,
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3)',
      [email, passwordHash, fullName]
    )
  );
}

// --- CKYC records (ckyc_applications) ---------------------------------------

const RECORD_COLUMNS =
  'id, ckyc_number, full_name, document_type, document_number, email, phone, status, created_at';

export async function listRecords(cfg = dbConfig()) {
  return withConnection(cfg, (conn) =>
    exec(conn, cfg.engine, `SELECT ${RECORD_COLUMNS} FROM ckyc_applications ORDER BY id`)
  );
}

export async function createRecord(r, cfg = dbConfig()) {
  return withConnection(cfg, (conn) =>
    exec(
      conn,
      cfg.engine,
      `INSERT INTO ckyc_applications
         (ckyc_number, full_name, document_type, document_number, email, phone, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [r.ckyc_number, r.full_name, r.document_type, r.document_number, r.email, r.phone, r.status]
    )
  );
}

export async function updateRecord(id, r, cfg = dbConfig()) {
  return withConnection(cfg, (conn) =>
    exec(
      conn,
      cfg.engine,
      `UPDATE ckyc_applications
          SET full_name = $1, document_type = $2, document_number = $3,
              email = $4, phone = $5, status = $6
        WHERE id = $7`,
      [r.full_name, r.document_type, r.document_number, r.email, r.phone, r.status, id]
    )
  );
}

export async function deleteRecord(id, cfg = dbConfig()) {
  return withConnection(cfg, (conn) =>
    exec(conn, cfg.engine, 'DELETE FROM ckyc_applications WHERE id = $1', [id])
  );
}

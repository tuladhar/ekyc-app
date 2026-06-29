// 003_extend_ckyc_applications · adds CKYC fields to the records table.
//
// One ALTER statement with multiple ADD COLUMN clauses — valid on both MySQL
// and PostgreSQL. Runs once (tracked in schema_migrations), so no need for
// "IF NOT EXISTS".

export function up() {
  return `
    ALTER TABLE ckyc_applications
      ADD COLUMN ckyc_number VARCHAR(32),
      ADD COLUMN email       VARCHAR(255),
      ADD COLUMN phone       VARCHAR(32)
  `;
}

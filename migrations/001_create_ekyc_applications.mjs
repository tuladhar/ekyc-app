// 001_create_ekyc_applications · creates the ekyc_applications table.
//
// Returns engine-specific SQL because the auto-increment primary key differs
// between MySQL and PostgreSQL. Everything else uses portable column types.

export function up(engine) {
  const idColumn =
    engine === 'pgsql'
      ? 'id SERIAL PRIMARY KEY'
      : 'id INT AUTO_INCREMENT PRIMARY KEY';

  return `
    CREATE TABLE IF NOT EXISTS ekyc_applications (
      ${idColumn},
      full_name        VARCHAR(255) NOT NULL,
      document_type    VARCHAR(50)  NOT NULL,
      document_number  VARCHAR(100) NOT NULL,
      status           VARCHAR(20)  NOT NULL DEFAULT 'pending',
      created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

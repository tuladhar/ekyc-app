// 002_create_users · creates the users table for CKYC login/registration.
//
// Engine-specific only in the auto-increment primary key; everything else is
// portable. Passwords are stored as scrypt hashes (salt:hash), never plaintext.

export function up(engine) {
  const idColumn =
    engine === 'pgsql'
      ? 'id SERIAL PRIMARY KEY'
      : 'id INT AUTO_INCREMENT PRIMARY KEY';

  return `
    CREATE TABLE IF NOT EXISTS users (
      ${idColumn},
      email          VARCHAR(255) NOT NULL UNIQUE,
      password_hash  VARCHAR(255) NOT NULL,
      full_name      VARCHAR(255),
      created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `;
}

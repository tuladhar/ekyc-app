// app/page.js · eKYC application home page.
//
// Connects to the database and lists the tables it can see. The
// ekyc_applications table is created manually in the database (assignment
// section 08b), not here — so this page stays read-only.

import { dbConfig, listTables } from '../lib/db';

// Always render at request time so table changes show up without a rebuild.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const banner = process.env.APP_BANNER || 'eKYC Application Service';
  const { host } = dbConfig();

  let tables = [];
  let error = null;
  try {
    tables = await listTables();
  } catch (e) {
    error = e.message;
  }

  return (
    <>
      <h1>{banner}</h1>

      <p>This is a simple eKYC application running on OpenShift.</p>

      <p>
        Database host: <b>{host}</b>
      </p>

      {error ? (
        <p>Connection failed: {error}</p>
      ) : (
        <>
          <h2>Database Tables ({tables.length})</h2>
          <ul>
            {tables.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </>
      )}

      <p>
        Health check: <a href="/status">/status</a>
      </p>
    </>
  );
}

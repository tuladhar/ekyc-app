// app/page.js · CKYC dashboard (requires login).
//
// Unauthenticated visitors are redirected to /login. Signed-in users see the
// Central KYC customer records with add / edit / delete.

import { redirect } from 'next/navigation';
import { listRecords } from '@/lib/db';
import { getSession } from '@/lib/session';
import { LogoutButton } from '@/components/logout-button';
import { RecordsTable } from '@/components/records-table';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const session = getSession();
  if (!session) redirect('/login');

  const banner = process.env.APP_BANNER || 'CKYC · Central Know Your Customer';

  let records = [];
  let error = null;
  try {
    records = await listRecords();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{banner}</h1>
          <p className="text-sm text-muted-foreground">
            Centralized customer identity repository
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {session.fullName || session.email}
          </span>
          <LogoutButton />
        </div>
      </header>

      {error ? (
        <div className="rounded-lg border border-destructive/50 p-4 text-sm text-destructive">
          Could not load records: {error}
          <div className="mt-1 text-muted-foreground">
            Has the database migration been run? (<code>npm run migrate</code>)
          </div>
        </div>
      ) : (
        <RecordsTable records={records} />
      )}
    </div>
  );
}

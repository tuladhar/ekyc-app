// app/page.js · CKYC home page.
//
// Shows session state (sign in / register vs. signed-in identity) and — to keep
// the assignment's database checks intact — lists the tables it can see plus a
// link to the /status health endpoint.

import Link from 'next/link';
import { dbConfig, listTables } from '@/lib/db';
import { getSession } from '@/lib/session';
import { Button } from '@/components/ui/button';
import { LogoutButton } from '@/components/logout-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Always render at request time: session + table list are per-request.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const banner = process.env.APP_BANNER || 'CKYC · Central Know Your Customer';
  const { host } = dbConfig();
  const session = getSession();

  let tables = [];
  let error = null;
  try {
    tables = await listTables();
  } catch (e) {
    error = e.message;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{banner}</h1>
          <p className="text-sm text-muted-foreground">
            Centralized identity repository — proof of concept.
          </p>
        </div>
        {session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.fullName || session.email}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        )}
      </header>

      {session && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Welcome, {session.fullName || session.email}
            </CardTitle>
            <CardDescription>
              You are signed in to the CKYC repository.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Database</CardTitle>
          <CardDescription>
            Host: <span className="font-mono">{host}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">Connection failed: {error}</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium">
                Tables ({tables.length})
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {tables.map((t) => (
                  <li key={t} className="font-mono">
                    {t}
                  </li>
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Health check:{' '}
        <Link href="/status" className="underline">
          /status
        </Link>
      </p>
    </div>
  );
}

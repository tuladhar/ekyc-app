// app/status/route.js · Health endpoint for the readiness probe and the grader.
// Reachable at /status.

import { dbConfig, ping } from '../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { host } = dbConfig();
  try {
    await ping();
    return new Response(`DATABASE HEALTHY\nhost: ${host}\n`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (e) {
    return new Response(`DATABASE UNHEALTHY\nhost: ${host}\n`, {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

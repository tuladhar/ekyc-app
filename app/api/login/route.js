import { cookies } from 'next/headers';
import { findUserByEmail } from '@/lib/db';
import { verifyPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user || !verifyPassword(password, user.password_hash)) {
      return Response.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    cookies().set(
      SESSION_COOKIE,
      createSessionToken({ email: user.email, fullName: user.full_name }),
      {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: `Login failed: ${e.message}` }, { status: 500 });
  }
}

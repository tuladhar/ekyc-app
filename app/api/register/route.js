import { cookies } from 'next/headers';
import { createUser, findUserByEmail } from '@/lib/db';
import { hashPassword, createSessionToken, SESSION_COOKIE } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const fullName = (body.fullName || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';

  if (!email || !password) {
    return Response.json({ error: 'Email and password are required' }, { status: 400 });
  }
  if (password.length < 8) {
    return Response.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  try {
    if (await findUserByEmail(email)) {
      return Response.json({ error: 'An account with that email already exists' }, { status: 409 });
    }

    await createUser({ email, passwordHash: hashPassword(password), fullName });

    cookies().set(SESSION_COOKIE, createSessionToken({ email, fullName }), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: `Registration failed: ${e.message}` }, { status: 500 });
  }
}

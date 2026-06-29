import { cookies } from 'next/headers';
import { readSessionToken, SESSION_COOKIE } from './auth';

// Returns the decoded session ({ email, fullName }) or null. Server-only.
export function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  return token ? readSessionToken(token) : null;
}

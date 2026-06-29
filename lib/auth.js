// lib/auth.js · Minimal password hashing + signed session cookie.
//
// Proof-of-concept auth with zero extra dependencies — uses Node's built-in
// crypto (scrypt for passwords, HMAC-SHA256 for the session cookie). Not a
// substitute for a real auth library in production.

import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';

export const SESSION_COOKIE = 'ckyc_session';

function sessionSecret() {
  // Set SESSION_SECRET in OpenShift (a Secret). Falls back to a dev value so
  // the app still runs locally — do not rely on the fallback in production.
  return process.env.SESSION_SECRET || 'dev-insecure-session-secret';
}

// --- passwords --------------------------------------------------------------

export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

// --- session cookie ---------------------------------------------------------
// Format: base64url(payloadJSON).hmac  — tamper-evident, not encrypted.

function sign(value) {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

export function createSessionToken(payload) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [body, mac] = token.split('.');
  const expected = sign(body);
  // Constant-time compare of the signatures.
  if (
    mac.length !== expected.length ||
    !timingSafeEqual(Buffer.from(mac), Buffer.from(expected))
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }
}

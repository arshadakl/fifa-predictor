// Shared admin-auth helpers used by both the Edge middleware and the Node route
// handlers, so they must rely only on Web Crypto / standard APIs (no node:*).

export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Stateless session value: a hash of the configured credentials. It is
// unguessable without knowing the password and never stores the raw password
// in the cookie. The middleware recomputes the same value from env to verify.
export async function expectedSessionToken(): Promise<string | null> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return sha256Hex(`${username}:${password}`);
}

// Length-aware constant-time-ish comparison to avoid trivial timing leaks.
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

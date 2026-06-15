import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, ADMIN_SESSION_MAX_AGE, expectedSessionToken, safeEqual } from '@/lib/adminAuth';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === 'string' ? body.username : '';
  const password = typeof body?.password === 'string' ? body.password : '';

  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  if (!envUser || !envPass) {
    return NextResponse.json(
      { success: false, message: 'Admin login is not configured on the server.' },
      { status: 500 }
    );
  }

  const ok = safeEqual(username, envUser) && safeEqual(password, envPass);
  if (!ok) {
    return NextResponse.json({ success: false, message: 'Invalid username or password.' }, { status: 401 });
  }

  const token = await expectedSessionToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token ?? '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_SESSION_MAX_AGE,
  });
  return response;
}

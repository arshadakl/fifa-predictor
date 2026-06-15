import { NextResponse } from 'next/server';
import { getPublicConfigSafe } from '@/lib/serverConfig';

// Public, unauthenticated config used by the registration flow and the results
// page. Cached server-side (see serverConfig) so it never repeats the slow
// Apps Script round-trip. Only the safe subset is exposed (no audit timestamps).
export async function GET() {
  const config = await getPublicConfigSafe();
  return NextResponse.json({ success: true, config });
}

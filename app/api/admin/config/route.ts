import { NextResponse } from 'next/server';
import { readConfig, writeConfig } from '@/lib/appsScript';
import { CONFIG_KEYS, toAppConfig } from '@/lib/config';

const MAX_MESSAGE_LENGTH = 500;

export async function GET() {
  try {
    const config = toAppConfig(await readConfig());
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error reading admin config:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load event settings right now.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const patch: Record<string, string> = {};

  if (typeof body.registrationEnabled === 'boolean') {
    patch[CONFIG_KEYS.registrationEnabled] = body.registrationEnabled ? 'TRUE' : 'FALSE';
    // Stamp the moment registration is turned off so late entries (e.g. anyone
    // hitting the API directly) can be audited against it later. Clear the stamp
    // when re-opening so the audit window only reflects the current closure and
    // legitimate post-reopen entries are not falsely flagged.
    patch[CONFIG_KEYS.registrationDisabledAt] = body.registrationEnabled ? '' : new Date().toISOString();
  }
  if (typeof body.registrationClosedMessage === 'string') {
    patch[CONFIG_KEYS.registrationClosedMessage] = body.registrationClosedMessage.slice(0, MAX_MESSAGE_LENGTH);
  }
  if (typeof body.resultsPublished === 'boolean') {
    patch[CONFIG_KEYS.resultsPublished] = body.resultsPublished ? 'TRUE' : 'FALSE';
  }
  if (typeof body.resultsMessage === 'string') {
    patch[CONFIG_KEYS.resultsMessage] = body.resultsMessage.slice(0, MAX_MESSAGE_LENGTH);
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ success: false, message: 'No valid settings to update.' }, { status: 400 });
  }

  try {
    const updated = await writeConfig(patch);
    // Public pages pick the change up within the cache TTL (~30s). The predict
    // API reads config fresh, so the registration gate enforces immediately.
    return NextResponse.json({ success: true, config: toAppConfig(updated) });
  } catch (error) {
    console.error('Error writing admin config:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to save event settings right now.' },
      { status: 500 }
    );
  }
}

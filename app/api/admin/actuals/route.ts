import { NextResponse } from 'next/server';
import { readActuals, writeActuals } from '@/lib/appsScript';
import { PREDICTION_FIELDS, type Predictions } from '@/lib/fields';

function normalizeActuals(raw: unknown): Predictions {
  const source = (raw ?? {}) as Record<string, unknown>;
  const actuals = {} as Predictions;
  for (const field of PREDICTION_FIELDS) {
    const value = source[field];
    actuals[field] = typeof value === 'string' ? value.trim() : '';
  }
  return actuals;
}

// Returns the actual tournament results saved in the sheet's "Actuals" tab, so
// the admin form survives reloads / different browsers (previously local-only).
export async function GET() {
  try {
    const record = await readActuals();
    return NextResponse.json({ success: true, actuals: normalizeActuals(record) });
  } catch (error) {
    console.error('Error reading actuals:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load saved results right now.' },
      { status: 500 }
    );
  }
}

// Persists the actuals as-is (does NOT re-score submissions). Used by the admin
// "Clear" action to wipe the saved results without touching participant scores.
export async function POST(request: Request) {
  const raw = await request.json().catch(() => ({}));
  const actuals = normalizeActuals(raw);

  try {
    await writeActuals(actuals);
    return NextResponse.json({ success: true, actuals });
  } catch (error) {
    console.error('Error saving actuals:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to save results right now.' },
      { status: 500 }
    );
  }
}

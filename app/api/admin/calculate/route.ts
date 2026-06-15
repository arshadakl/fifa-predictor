import { NextResponse } from 'next/server';
import { readSubmissions, overwriteSubmissions, writeActuals } from '@/lib/appsScript';
import { calculateScoresAndRankings } from '@/lib/scoring';
import { PREDICTION_FIELDS, type Predictions } from '@/lib/fields';

export async function POST(request: Request) {
  const raw = await request.json().catch(() => ({}));

  // Normalise to exactly the known prediction fields so only clean data is
  // scored against and persisted to the Actuals tab.
  const actuals = {} as Predictions;
  for (const field of PREDICTION_FIELDS) {
    const value = raw?.[field];
    actuals[field] = typeof value === 'string' ? value.trim() : '';
  }

  // Persist the entered results (best-effort) so the admin's selections survive
  // reloads. Failure here must NOT abort scoring, which is the primary job.
  async function persistActuals() {
    try {
      await writeActuals(actuals);
    } catch (err) {
      console.error('Failed to persist actuals (continuing with scoring):', err);
    }
  }

  try {
    const submissions = await readSubmissions();

    if (submissions.length === 0) {
      await persistActuals();
      return NextResponse.json({ success: true, submissions, message: 'No submissions to calculate.' });
    }

    const updatedSubmissions = calculateScoresAndRankings(submissions, actuals);
    await overwriteSubmissions(updatedSubmissions);
    await persistActuals();

    return NextResponse.json({
      success: true,
      submissions: updatedSubmissions,
      message: 'Scoring and rankings calculated successfully!',
    });
  } catch (error) {
    console.error('Error calculating scores:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to calculate scores right now.' },
      { status: 500 }
    );
  }
}

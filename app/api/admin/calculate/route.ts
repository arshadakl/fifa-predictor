import { NextResponse } from 'next/server';
import { readSubmissions, overwriteSubmissions } from '@/lib/appsScript';
import { calculateScoresAndRankings } from '@/lib/scoring';

export async function POST(request: Request) {
  const actuals = await request.json().catch(() => ({}));

  try {
    const submissions = await readSubmissions();

    if (submissions.length === 0) {
      return NextResponse.json({ success: true, submissions, message: 'No submissions to calculate.' });
    }

    const updatedSubmissions = calculateScoresAndRankings(submissions, actuals);
    await overwriteSubmissions(updatedSubmissions);

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

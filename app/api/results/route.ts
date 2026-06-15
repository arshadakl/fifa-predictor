import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { readSubmissions } from '@/lib/appsScript';
import { getPublicConfigSafe } from '@/lib/serverConfig';
import type { PublicSubmission } from '@/lib/fields';

// The slow part (reading the whole sheet) is cached so a burst of results-page
// visitors can't each trigger an Apps Script round-trip. PII is stripped here so
// the cached payload never holds mobile numbers or emails.
const getPublicParticipantsCached = unstable_cache(
  async (): Promise<PublicSubmission[]> => {
    const submissions = await readSubmissions();
    return submissions.map((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { Mobile_Number, Email_Address, ...rest } = s;
      return rest;
    });
  },
  ['public-results-participants'],
  { revalidate: 60 },
);

// Public results endpoint. Only returns participant data once the admin has
// published results, and never includes mobile numbers or email addresses.
export async function GET() {
  try {
    const config = await getPublicConfigSafe();

    if (!config.resultsPublished) {
      return NextResponse.json({ success: true, published: false, message: config.resultsMessage });
    }

    const participants = await getPublicParticipantsCached();
    return NextResponse.json({ success: true, published: true, participants });
  } catch (error) {
    console.error('Error reading results:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to load results right now. Please try again later.' },
      { status: 500 }
    );
  }
}

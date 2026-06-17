// TEMPORARY test/preview route for the prediction confirmation email.
// NOT meant to be committed — delete before shipping.
//
//   Preview the line-up UI in a browser:
//     GET /api/email-preview
//   Send a real test email (needs AUTH_SMTP_EMAIL / AUTH_SMTP_APP_PASSWORD):
//     GET /api/email-preview?send=1&to=you@example.com
import { NextResponse } from 'next/server';
import { renderPredictionEmail, LOGO_CID } from '@/lib/emailTemplate';
import { sendPredictionEmail } from '@/lib/email';
import { PREDICTION_FIELDS, type Predictions } from '@/lib/fields';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';

// Build sample predictions from real options so every crest/photo resolves.
function samplePredictions(): Predictions {
  const team = (i: number) => TEAM_OPTIONS[i % TEAM_OPTIONS.length]?.name ?? 'Brazil';
  const player = (i: number) => PLAYER_OPTIONS[i % PLAYER_OPTIONS.length]?.name ?? 'Lionel Messi';
  const teamFields = new Set(['World_Cup_Winner', 'Runner_Up', 'Third_Place', 'Fair_Play_Award']);
  const values = {} as Predictions;
  PREDICTION_FIELDS.forEach((field, i) => {
    values[field] = teamFields.has(field) ? team(i) : player(i);
  });
  return values;
}

export async function GET(request: Request) {
  // Dev-only. This route can send mail to any address, so it must never be
  // reachable in production (would be an open email-relay / spam vector).
  if (process.env.NODE_ENV === 'production') {
    return new NextResponse('Not found', { status: 404 });
  }

  const url = new URL(request.url);
  const predictions = samplePredictions();
  const sample = {
    fullName: 'Test User',
    submissionId: 'TEST-1234',
    timestamp: new Date().toISOString(),
    predictions,
  };

  if (url.searchParams.get('send') === '1') {
    const to = url.searchParams.get('to');
    if (!to) {
      return NextResponse.json({ ok: false, message: 'Add ?to=you@example.com' }, { status: 400 });
    }
    const sent = await sendPredictionEmail({ to, ...sample });
    return NextResponse.json({
      ok: sent,
      message: sent ? `Test email sent to ${to}` : 'Send failed/skipped — check server logs and env vars.',
    });
  }

  // Browser preview: cid: images only work inside email clients, so swap the
  // logo to its public path for the HTML preview.
  const { html } = renderPredictionEmail(sample);
  const previewHtml = html.replace(`cid:${LOGO_CID}`, '/logo/fifa-world-cup-logo.png');
  return new NextResponse(previewHtml, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

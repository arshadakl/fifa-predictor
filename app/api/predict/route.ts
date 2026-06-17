import { NextResponse, after } from 'next/server';
import { submitPredictionAtomic } from '@/lib/appsScript';
import { sendPredictionEmail } from '@/lib/email';
import { PREDICTION_FIELDS, type Predictions } from '@/lib/fields';
import {
  EMAIL_REGEX,
  MOBILE_REGEX,
  MAX_TEXT_LENGTH,
  normalizeMobile,
  normalizeEmail,
} from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 });
  }

  const { Full_Name, Mobile_Number, Email_Address } = body;

  if (typeof Full_Name !== 'string' || !Full_Name.trim()) {
    return NextResponse.json({ success: false, message: 'Full name is required.' }, { status: 400 });
  }
  if (!MOBILE_REGEX.test(normalizeMobile(Mobile_Number))) {
    return NextResponse.json(
      { success: false, message: 'A valid mobile number is required.' },
      { status: 400 }
    );
  }
  if (!EMAIL_REGEX.test(normalizeEmail(Email_Address))) {
    return NextResponse.json(
      { success: false, message: 'A valid email address is required.' },
      { status: 400 }
    );
  }

  const predictions = {} as Predictions;
  for (const field of PREDICTION_FIELDS) {
    const value = body[field];
    if (typeof value !== 'string' || !value.trim()) {
      return NextResponse.json(
        { success: false, message: `Missing prediction: ${field.replace(/_/g, ' ')}.` },
        { status: 400 }
      );
    }
    predictions[field] = value.trim().slice(0, MAX_TEXT_LENGTH);
  }

  const fullName = Full_Name.trim().slice(0, MAX_TEXT_LENGTH);
  const email = normalizeEmail(Email_Address);
  const timestamp = new Date().toISOString();

  try {
    // ONE atomic Apps Script call does the registration gate, duplicate check,
    // ID generation and append under a lock. This replaces the previous
    // read-config + read-submissions + append (two sequential round-trips),
    // halving the submit latency and closing the read-then-write duplicate race.
    const outcome = await submitPredictionAtomic({
      Full_Name: fullName,
      Mobile_Number: normalizeMobile(Mobile_Number),
      Email_Address: email,
      Timestamp: timestamp,
      ...predictions,
    });

    if (outcome.outcome === 'closed') {
      return NextResponse.json({ success: false, message: outcome.message }, { status: 403 });
    }
    if (outcome.outcome === 'duplicate') {
      const message =
        outcome.field === 'mobile'
          ? 'This mobile number has already been used for a submission.'
          : 'This email address has already been used for a submission.';
      return NextResponse.json({ success: false, message }, { status: 409 });
    }

    // Send the confirmation email AFTER the response is sent (next/server
    // `after`) so the SMTP handshake (~2-4s) never delays the user's success
    // screen. The platform keeps the function alive to run this. The email is
    // strictly optional: if AUTH_SMTP_EMAIL / AUTH_SMTP_APP_PASSWORD are not
    // configured, sendPredictionEmail no-ops; the extra try/catch guarantees a
    // mail failure can never surface as an unhandled rejection.
    after(async () => {
      try {
        await sendPredictionEmail({
          to: email,
          fullName,
          submissionId: outcome.submissionId,
          timestamp: outcome.timestamp,
          predictions,
        });
      } catch (emailError) {
        console.error('Prediction confirmation email failed (submission already saved):', emailError);
      }
    });

    return NextResponse.json(
      {
        success: true,
        Submission_ID: outcome.submissionId,
        Timestamp: outcome.timestamp,
        message: 'Prediction submitted successfully!',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error saving submission:', error);
    return NextResponse.json(
      { success: false, message: 'Unable to save your prediction right now. Please try again later.' },
      { status: 500 }
    );
  }
}

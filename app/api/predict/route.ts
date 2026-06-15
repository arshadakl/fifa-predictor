import { NextResponse } from 'next/server';
import { readSubmissions, appendSubmission, readConfig } from '@/lib/appsScript';
import { toPublicConfig } from '@/lib/config';
import { PREDICTION_FIELDS, type Predictions, type Submission } from '@/lib/fields';
import {
  EMAIL_REGEX,
  MOBILE_REGEX,
  MAX_TEXT_LENGTH,
  normalizeMobile,
  normalizeEmail,
  findDuplicateField,
  generateSubmissionId,
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

  try {
    // Enforce the registration window server-side so the gate cannot be bypassed
    // by calling this endpoint directly after predictions have closed. Read fresh
    // (uncached) so a close takes effect immediately with no bypass window, and in
    // PARALLEL with the submissions read to halve the function's wall-time.
    // Fail OPEN on the config read: if it fails (e.g. Apps Script not yet
    // redeployed with the config actions), allow the submission rather than
    // blocking everyone.
    const [config, submissions] = await Promise.all([
      readConfig()
        .then(toPublicConfig)
        .catch((configError) => {
          console.error('Registration gate config read failed, allowing submission:', configError);
          return null;
        }),
      readSubmissions(),
    ]);

    if (config && !config.registrationEnabled) {
      return NextResponse.json(
        { success: false, message: config.registrationClosedMessage },
        { status: 403 }
      );
    }

    const duplicateField = findDuplicateField(submissions, Mobile_Number, Email_Address);
    if (duplicateField === 'mobile') {
      return NextResponse.json(
        { success: false, message: 'This mobile number has already been used for a submission.' },
        { status: 409 }
      );
    }
    if (duplicateField === 'email') {
      return NextResponse.json(
        { success: false, message: 'This email address has already been used for a submission.' },
        { status: 409 }
      );
    }

    const existingIds = new Set(submissions.map((s) => s.Submission_ID));
    const submissionId = generateSubmissionId(existingIds);
    const timestamp = new Date().toISOString();

    const newEntry: Submission = {
      Submission_ID: submissionId,
      Timestamp: timestamp,
      Full_Name: Full_Name.trim().slice(0, MAX_TEXT_LENGTH),
      Mobile_Number: normalizeMobile(Mobile_Number),
      Email_Address: normalizeEmail(Email_Address),
      ...predictions,
      Total_Score: 0,
      Rank: '',
    };

    await appendSubmission(newEntry);

    return NextResponse.json(
      {
        success: true,
        Submission_ID: submissionId,
        Timestamp: timestamp,
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

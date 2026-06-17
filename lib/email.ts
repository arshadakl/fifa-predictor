import path from 'node:path';
import nodemailer, { type Transporter } from 'nodemailer';
import type { Predictions } from './fields';
import { renderPredictionEmail, LOGO_CID } from './emailTemplate';

const LOGO_PATH = path.join(process.cwd(), 'public', 'logo', 'fifa-world-cup-logo.png');

let cachedTransporter: Transporter | null = null;

// Gmail SMTP transporter built from an account + app password. Cached across
// invocations. Returns null (with a warning) when the credentials are not
// configured so a missing env never breaks a submission.
function getTransporter(): Transporter | null {
  const user = process.env.AUTH_SMTP_EMAIL;
  const pass = process.env.AUTH_SMTP_APP_PASSWORD;

  if (!user || !pass) {
    console.warn('Email disabled: AUTH_SMTP_EMAIL / AUTH_SMTP_APP_PASSWORD not set.');
    return null;
  }

  if (!cachedTransporter) {
    cachedTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
  }
  return cachedTransporter;
}

export type SendPredictionEmailInput = {
  to: string;
  fullName: string;
  submissionId: string;
  timestamp: string;
  predictions: Predictions;
};

// Sends the confirmation email with the predicted line-up. Resolves to true on
// success, false if skipped/failed — callers should NOT fail the submission on
// a false result.
export async function sendPredictionEmail(input: SendPredictionEmailInput): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;

  const { subject, html } = renderPredictionEmail({
    fullName: input.fullName,
    submissionId: input.submissionId,
    timestamp: input.timestamp,
    predictions: input.predictions,
  });

  try {
    await transporter.sendMail({
      from: `"FIFA World Cup 2026 Predictions" <${process.env.AUTH_SMTP_EMAIL}>`,
      to: input.to,
      subject,
      html,
      attachments: [
        {
          filename: 'fifa-world-cup-logo.png',
          path: LOGO_PATH,
          cid: LOGO_CID,
        },
      ],
    });
    return true;
  } catch (error) {
    console.error('Failed to send prediction confirmation email:', error);
    return false;
  }
}

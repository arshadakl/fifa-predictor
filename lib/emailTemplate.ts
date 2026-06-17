import { findTeamOption, findPlayerOption } from './predictionOptions';
import type { Predictions, PredictionField } from './fields';

// Content ID used to embed the logo as an inline attachment (so the email shows
// the local /logo asset without depending on a public absolute URL).
export const LOGO_CID = 'wc2026-logo';

type Slot = { field: PredictionField; label: string; kind: 'team' | 'player' };

// Mirrors the FORMATION used by components/steps/PredictionPreview.tsx so the
// emailed line-up matches the on-screen "Your Prediction Preview".
const FORMATION: Slot[][] = [
  [
    { field: 'Golden_Ball', label: 'Golden Ball', kind: 'player' },
    { field: 'World_Cup_Winner', label: 'World Champion', kind: 'team' },
    { field: 'Golden_Boot', label: 'Golden Boot', kind: 'player' },
  ],
  [
    { field: 'Runner_Up', label: 'Runner-Up', kind: 'team' },
    { field: 'Most_Assists', label: 'Most Assists', kind: 'player' },
    { field: 'Best_Young_Player', label: 'Young Player', kind: 'player' },
  ],
  [
    { field: 'Third_Place', label: 'Third Place', kind: 'team' },
    { field: 'Fair_Play_Award', label: 'Fair Play', kind: 'team' },
  ],
  [{ field: 'Golden_Glove', label: 'Golden Glove', kind: 'player' }],
];

// GOLD stays bright for the goalkeeper ring on the green pitch; GOLD_TEXT is a
// deeper gold readable on the light card. Pitch colours (PITCH_DARK / stripes /
// LINE) are intentionally unchanged — the ground keeps its green look.
const GOLD = '#ffd700';
const GOLD_TEXT = '#b58a00';
const BLUE_TEXT = '#0284c7';
const PITCH_DARK = '#1e5c34';
const LINE = 'rgba(255,255,255,0.28)';
// Light theme tokens for the email card.
const PAGE_BG = '#eef1f5';
const CARD_BG = '#ffffff';
const HAIRLINE = '#e5e7eb';
const PANEL_BG = '#f3f4f6';
const INK = '#111827';
const BODY_TEXT = '#374151';
const MUTED = '#6b7280';
// Mowing stripes: alternating green bands, matching the on-screen .pitch-field.
const PITCH_STRIPES =
  'repeating-linear-gradient(to bottom,#1e5c34 0px,#1e5c34 48px,#226339 48px,#226339 96px)';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function imageForSlot(slot: Slot, value: string): string | null {
  if (slot.kind === 'team') {
    return findTeamOption(value)?.flagSrc ?? null;
  }
  return findPlayerOption(value)?.imageSrc ?? null;
}

const AVATAR = 64;

// One line-up card: circular crest/photo on top, label + chosen name below.
// Built entirely with tables + inline styles for broad email-client support.
//
// IMPORTANT (learned from real renders): do NOT zoom via an oversized <img> in
// an overflow:hidden circle. Mobile Gmail ignores overflow → the image isn't
// clipped and renders as a stretched ellipse; transparent player PNGs over a
// dark bg also showed up as black blobs on desktop. So flags AND player photos
// use the SAME bullet-proof construction: one square <img> (the source is a
// 1x1 square from the FIFA transform service) with border-radius:50% over a
// white background, no overflow / oversize / negative margins anywhere.
function renderCard(slot: Slot, value: string): string {
  const imageSrc = imageForSlot(slot, value);
  const isGoalkeeper = slot.field === 'Golden_Glove';
  const ringColor = isGoalkeeper ? GOLD : 'rgba(255,255,255,0.55)';

  const circle = imageSrc
    ? `<img src="${escapeHtml(imageSrc)}" width="${AVATAR}" height="${AVATAR}" alt="" style="display:block;width:${AVATAR}px;height:${AVATAR}px;border-radius:50%;border:2px solid ${ringColor};background:#ffffff;" />`
    : `<div style="width:${AVATAR}px;height:${AVATAR}px;border-radius:50%;border:2px solid ${ringColor};background:rgba(255,255,255,0.12);font-size:1px;line-height:1px;">&nbsp;</div>`;

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="width:96px;">
      <tr><td align="center" style="padding-bottom:6px;">${circle}</td></tr>
      <tr>
        <td align="center" style="background:#ffffff;border-radius:6px;padding:5px 6px;">
          <div style="font-size:9px;line-height:1;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;color:#6b7280;margin-bottom:3px;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(slot.label)}</div>
          <div style="font-size:11px;line-height:1.2;font-weight:800;color:#111111;font-family:Arial,Helvetica,sans-serif;">${escapeHtml(value) || '&mdash;'}</div>
        </td>
      </tr>
    </table>`;
}

function renderRow(row: Slot[], values: Predictions): string {
  const cells = row
    .map(
      (slot) =>
        `<td align="center" valign="top" style="padding:10px 8px;">${renderCard(slot, values[slot.field])}</td>`,
    )
    .join('');
  return `<tr>${cells}</tr>`;
}

function renderFormationRow(row: Slot[], values: Predictions): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center"><tbody>${renderRow(
    row,
    values,
  )}</tbody></table>`;
}

// Halfway line only (no centre circle), drawn with PURE TABLE FLOW (no
// position / overflow / negative margins) so every email client renders it.
function renderHalfway(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:10px 0;">
      <tr>
        <td><div style="border-top:2px solid ${LINE};font-size:1px;line-height:1px;">&nbsp;</div></td>
      </tr>
    </table>`;
}

// Builds the pitch: striped green container, formation rows stacked in normal
// flow with the halfway marking inserted at the visual midpoint. No CSS
// positioning anywhere, so it survives Gmail / Outlook / Apple Mail.
function renderPitch(values: Predictions): string {
  const mid = Math.ceil(FORMATION.length / 2);
  const top = FORMATION.slice(0, mid).map((row) => renderFormationRow(row, values)).join('');
  const bottom = FORMATION.slice(mid).map((row) => renderFormationRow(row, values)).join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PITCH_DARK};background-image:${PITCH_STRIPES};border:2px solid rgba(255,255,255,0.3);border-radius:16px;">
      <tr><td align="center" style="padding:20px 10px;">
        ${top}
        ${renderHalfway()}
        ${bottom}
      </td></tr>
    </table>`;
}

export type PredictionEmailInput = {
  fullName: string;
  submissionId: string;
  timestamp: string;
  predictions: Predictions;
};

export function renderPredictionEmail(input: PredictionEmailInput): {
  subject: string;
  html: string;
} {
  const { fullName, submissionId, timestamp } = input;
  const subject = 'Sports Gallary · FIFA World Cup 2026 Prediction Received ⚽';
  const dateText = new Date(timestamp).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:${PAGE_BG};">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${PAGE_BG};">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:${CARD_BG};border:1px solid ${HAIRLINE};border-radius:18px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding:28px 24px 12px 24px;">
              <img src="cid:${LOGO_CID}" width="72" height="72" alt="Sports Gallary" style="display:block;" />
              <div style="margin-top:14px;font-size:15px;letter-spacing:2px;text-transform:uppercase;font-weight:800;color:${GOLD_TEXT};font-family:Arial,Helvetica,sans-serif;">Sports Gallary</div>
              <div style="margin-top:4px;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:${BLUE_TEXT};font-family:Arial,Helvetica,sans-serif;">FIFA World Cup 2026 · Prediction Received</div>
              <h1 style="margin:10px 0 0 0;font-size:24px;line-height:1.25;font-weight:800;color:${INK};font-family:Arial,Helvetica,sans-serif;">Thank You for Your Prediction!</h1>
            </td>
          </tr>

          <!-- Greeting + meta -->
          <tr>
            <td align="center" style="padding:6px 28px 18px 28px;">
              <p style="margin:0 0 12px 0;font-size:15px;line-height:1.6;color:${BODY_TEXT};font-family:Arial,Helvetica,sans-serif;">
                Hi <strong style="color:${INK};">${escapeHtml(fullName)}</strong>, your FIFA World Cup 2026 predictions have been successfully submitted. Here is your line-up:
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="background:${PANEL_BG};border:1px solid ${HAIRLINE};border-radius:10px;">
                <tr>
                  <td style="padding:8px 16px;font-size:13px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">
                    Submission ID: <strong style="color:${GOLD_TEXT};">${escapeHtml(submissionId)}</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pitch -->
          <tr>
            <td style="padding:6px 18px 4px 18px;">
              <div style="text-align:center;font-size:13px;font-weight:700;letter-spacing:0.5px;text-transform:uppercase;color:${MUTED};margin-bottom:10px;font-family:Arial,Helvetica,sans-serif;">Your Prediction Line-up</div>
              ${renderPitch(input.predictions)}
            </td>
          </tr>

          <!-- Footer message -->
          <tr>
            <td align="center" style="padding:18px 28px 28px 28px;">
              <p style="margin:0 0 8px 0;font-size:14px;line-height:1.6;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">
                Thank you for taking part in the Predict &amp; Win Contest. We wish you the very best of luck!
              </p>
              <p style="margin:0;font-size:13px;line-height:1.6;font-style:italic;color:${GOLD_TEXT};font-family:Arial,Helvetica,sans-serif;">
                May the beautiful game bring unforgettable moments throughout FIFA World Cup 2026.
              </p>
              <p style="margin:18px 0 0 0;font-size:11px;color:${MUTED};font-family:Arial,Helvetica,sans-serif;">
                Submitted on ${escapeHtml(dateText)}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}

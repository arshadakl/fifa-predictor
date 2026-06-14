import type { Submission } from './fields';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MOBILE_REGEX = /^\+91[6-9]\d{9}$/;
export const MAX_TEXT_LENGTH = 100;

export function normalizeMobile(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim();
}

export function normalizeEmail(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  return String(value).trim().toLowerCase();
}

export function findDuplicateField(
  submissions: Submission[],
  mobile: unknown,
  email: unknown
): 'mobile' | 'email' | null {
  const normalizedMobile = normalizeMobile(mobile);
  const normalizedEmail = normalizeEmail(email);

  if (submissions.some((s) => normalizeMobile(s.Mobile_Number) === normalizedMobile)) {
    return 'mobile';
  }
  if (submissions.some((s) => normalizeEmail(s.Email_Address) === normalizedEmail)) {
    return 'email';
  }
  return null;
}

export function generateSubmissionId(existingIds: Set<string>): string {
  let id: string;
  do {
    id = 'FWC26-' + Math.floor(10000 + Math.random() * 90000);
  } while (existingIds.has(id));
  return id;
}

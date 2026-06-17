import type { Predictions, Submission, PublicSubmission } from './fields';
import type { AppConfig } from './config';

type RegistrationPayload = {
  Full_Name: string;
  Mobile_Number: string;
  Email_Address: string;
};

type DuplicateCheckPayload = {
  Mobile_Number: string;
  Email_Address: string;
};

type ApiResponse<T> = {
  status: number;
  ok: boolean;
  result: T;
};

const JSON_HEADERS = { 'Content-Type': 'application/json' };

async function requestJson<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  const response = await fetch(url, init);
  const result = (await response.json()) as T;
  return { status: response.status, ok: response.ok, result };
}

export type PredictResult =
  | { success: true; Submission_ID: string; message?: string }
  | { success: false; message?: string };

const SUBMIT_MAX_ATTEMPTS = 4; // 1 initial try + 3 retries
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Exponential backoff (600ms, 1.2s, ~2.4s, capped) plus random jitter so a
// burst of clients retrying at once de-synchronises instead of hammering the
// backend in lockstep.
function backoffDelay(attempt: number): number {
  return Math.min(600 * 2 ** (attempt - 1), 2500) + Math.random() * 300;
}

// Submitting is idempotent on the server (it dedups by mobile/email), so it is
// safe to retry transient failures. We retry on network errors and on 5xx
// (Apps Script lock timeout / "too many simultaneous invocations" during a
// burst, or a 502/503/504 gateway error) — but NOT on 4xx (validation 400,
// duplicate 409, registration-closed 403), which are terminal. This turns a
// burst-induced failure into "a little slower, still succeeds".
export async function submitPrediction(
  payload: Predictions & Partial<RegistrationPayload>
): Promise<ApiResponse<PredictResult>> {
  const init: RequestInit = {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  };

  let lastError: unknown;
  for (let attempt = 1; attempt <= SUBMIT_MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch('/api/predict', init);
      if (response.status >= 500 && attempt < SUBMIT_MAX_ATTEMPTS) {
        await sleep(backoffDelay(attempt));
        continue;
      }
      const result = (await response.json()) as PredictResult;
      return { status: response.status, ok: response.ok, result };
    } catch (err) {
      lastError = err;
      if (attempt < SUBMIT_MAX_ATTEMPTS) {
        await sleep(backoffDelay(attempt));
        continue;
      }
      throw lastError;
    }
  }

  // Unreachable (loop either returns or throws), but keeps the type checker happy.
  throw lastError;
}

export type CheckDuplicateResult = { success: true; message?: string } | { success: false; message?: string };

export function checkDuplicate(payload: DuplicateCheckPayload) {
  return requestJson<CheckDuplicateResult>('/api/check-duplicate', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
}

export type SubmissionsResult =
  | { success: true; submissions: Submission[]; message?: string }
  | { success: false; message?: string };

export function fetchSubmissions() {
  return requestJson<SubmissionsResult>('/api/admin/submissions');
}

export type CalculateResult =
  | { success: true; submissions: Submission[]; message?: string }
  | { success: false; message?: string };

export function calculateScores(actuals: Predictions) {
  return requestJson<CalculateResult>('/api/admin/calculate', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(actuals),
  });
}

export type ResultsResult =
  | { success: true; published: false; message: string }
  | { success: true; published: true; participants: PublicSubmission[] }
  | { success: false; message?: string };

export function fetchResults() {
  return requestJson<ResultsResult>('/api/results', { cache: 'no-store' });
}

export type ActualsResult =
  | { success: true; actuals: Predictions }
  | { success: false; message?: string };

export function fetchActuals() {
  return requestJson<ActualsResult>('/api/admin/actuals');
}

// Persists actuals to the sheet without re-scoring (used by the Clear action).
export function saveActuals(actuals: Predictions) {
  return requestJson<ActualsResult>('/api/admin/actuals', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(actuals),
  });
}

export type AdminConfigResult =
  | { success: true; config: AppConfig }
  | { success: false; message?: string };

export function fetchAdminConfig() {
  return requestJson<AdminConfigResult>('/api/admin/config');
}

export function saveAdminConfig(patch: Partial<{
  registrationEnabled: boolean;
  registrationClosedMessage: string;
  resultsPublished: boolean;
  resultsMessage: string;
}>) {
  return requestJson<AdminConfigResult>('/api/admin/config', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(patch),
  });
}

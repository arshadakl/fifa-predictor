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

export function submitPrediction(payload: Predictions & Partial<RegistrationPayload>) {
  return requestJson<PredictResult>('/api/predict', {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });
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

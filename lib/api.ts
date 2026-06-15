import type { Predictions, Submission } from './fields';

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

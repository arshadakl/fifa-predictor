import type { Predictions, Submission } from './fields';

type AppsScriptAction =
  | 'read'
  | 'append'
  | 'submit'
  | 'overwrite'
  | 'readConfig'
  | 'writeConfig'
  | 'readActuals'
  | 'writeActuals';

// Result of the atomic `submit` action (gate + dedup + ID + append in one call).
export type SubmitOutcome =
  | { outcome: 'created'; submissionId: string; timestamp: string }
  | { outcome: 'duplicate'; field: 'mobile' | 'email' }
  | { outcome: 'closed'; message: string };

type AppsScriptResponse = {
  ok: boolean;
  error?: string;
  submissions?: Submission[];
  config?: Record<string, string>;
  actuals?: Record<string, string>;
  submit?: SubmitOutcome;
};

export async function callAppsScript(
  action: AppsScriptAction,
  payload?: unknown
): Promise<AppsScriptResponse> {
  const url = process.env.APPS_SCRIPT_URL;
  const secret = process.env.APPS_SCRIPT_SECRET;

  if (!url || !secret) {
    throw new Error(
      'Apps Script is not configured. Set APPS_SCRIPT_URL and APPS_SCRIPT_SECRET in .env.local.'
    );
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, action, payload }),
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Apps Script request failed with status ${response.status}`);
  }

  const data = (await response.json()) as AppsScriptResponse;

  if (!data.ok) {
    throw new Error(data.error || 'Apps Script returned an error.');
  }

  return data;
}

export async function readSubmissions(): Promise<Submission[]> {
  const data = await callAppsScript('read');
  return data.submissions ?? [];
}

export async function appendSubmission(entry: Submission): Promise<void> {
  await callAppsScript('append', entry);
}

// Atomic submit: the Apps Script side runs the registration gate, duplicate
// check, ID generation and append under a lock, returning the outcome. The
// caller (predict route) maps the outcome to an HTTP status.
export async function submitPredictionAtomic(
  entry: Partial<Submission> & { Timestamp: string }
): Promise<SubmitOutcome> {
  const data = await callAppsScript('submit', entry);
  if (!data.submit) {
    throw new Error('Apps Script submit action returned no result.');
  }
  return data.submit;
}

export async function overwriteSubmissions(submissions: Submission[]): Promise<void> {
  await callAppsScript('overwrite', submissions);
}

export async function readConfig(): Promise<Record<string, string>> {
  const data = await callAppsScript('readConfig');
  return data.config ?? {};
}

export async function writeConfig(patch: Record<string, string>): Promise<Record<string, string>> {
  const data = await callAppsScript('writeConfig', patch);
  return data.config ?? {};
}

export async function readActuals(): Promise<Record<string, string>> {
  const data = await callAppsScript('readActuals');
  return data.actuals ?? {};
}

export async function writeActuals(actuals: Predictions): Promise<void> {
  await callAppsScript('writeActuals', actuals);
}

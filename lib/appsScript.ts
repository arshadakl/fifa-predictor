import type { Predictions, Submission } from './fields';

type AppsScriptAction =
  | 'read'
  | 'append'
  | 'overwrite'
  | 'readConfig'
  | 'writeConfig'
  | 'readActuals'
  | 'writeActuals';

type AppsScriptResponse = {
  ok: boolean;
  error?: string;
  submissions?: Submission[];
  config?: Record<string, string>;
  actuals?: Record<string, string>;
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

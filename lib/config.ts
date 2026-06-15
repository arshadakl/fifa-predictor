// Keys stored in the Google Sheet "Config" tab (key/value rows). Centralised so
// the routes that read/write config never drift on spelling.
export const CONFIG_KEYS = {
  registrationEnabled: 'registration_enabled',
  registrationClosedMessage: 'registration_closed_message',
  registrationDisabledAt: 'registration_disabled_at',
  resultsPublished: 'results_published',
  resultsMessage: 'results_message',
} as const;

export const DEFAULT_REGISTRATION_CLOSED_MESSAGE =
  'Predictions are now closed. The submission window for FIFA World Cup 2026 has ended — thank you for your interest!';

export const DEFAULT_RESULTS_MESSAGE =
  'Results are not published yet. Check back once the predictions have been scored.';

// Full config as the admin sees it (includes the disabled-at audit stamp).
export type AppConfig = {
  registrationEnabled: boolean;
  registrationClosedMessage: string;
  registrationDisabledAt: string;
  resultsPublished: boolean;
  resultsMessage: string;
};

// Public subset exposed to unauthenticated pages — no audit timestamps.
export type PublicConfig = {
  registrationEnabled: boolean;
  registrationClosedMessage: string;
  resultsPublished: boolean;
  resultsMessage: string;
};

// Sheet stores everything as strings. Treat only an explicit "TRUE" (any case)
// as enabled; a missing/blank registration flag defaults to ENABLED so the
// contest keeps working if the Config tab has not been set up yet. Results
// default to NOT published (safer default for hiding data).
function parseBool(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value.trim().toUpperCase() === 'TRUE';
}

export function toAppConfig(record: Record<string, string>): AppConfig {
  return {
    registrationEnabled: parseBool(record[CONFIG_KEYS.registrationEnabled], true),
    registrationClosedMessage:
      record[CONFIG_KEYS.registrationClosedMessage]?.trim() || DEFAULT_REGISTRATION_CLOSED_MESSAGE,
    registrationDisabledAt: record[CONFIG_KEYS.registrationDisabledAt] ?? '',
    resultsPublished: parseBool(record[CONFIG_KEYS.resultsPublished], false),
    resultsMessage: record[CONFIG_KEYS.resultsMessage]?.trim() || DEFAULT_RESULTS_MESSAGE,
  };
}

export function toPublicConfig(record: Record<string, string>): PublicConfig {
  const full = toAppConfig(record);
  return {
    registrationEnabled: full.registrationEnabled,
    registrationClosedMessage: full.registrationClosedMessage,
    resultsPublished: full.resultsPublished,
    resultsMessage: full.resultsMessage,
  };
}

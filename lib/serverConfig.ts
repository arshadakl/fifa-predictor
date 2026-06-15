import { unstable_cache } from 'next/cache';
import { readConfig } from './appsScript';
import { toPublicConfig, type PublicConfig } from './config';

// The Apps Script config read is a slow (~seconds) network round-trip. Config
// changes rarely, so cache the raw record in Next's data cache and revalidate on
// a short interval. Admin writes bust this tag for an immediate refresh.
export const CONFIG_CACHE_TAG = 'app-config';

const getConfigRecordCached = unstable_cache(async () => readConfig(), ['app-config-record'], {
  // Public config only drives cosmetic UI (closed banner, results link); the
  // predict API enforces the gate uncached, so a couple of minutes of staleness
  // is fine and keeps ISR regeneration (and function cost) low.
  revalidate: 120,
  tags: [CONFIG_CACHE_TAG],
});

// Public config, cached and crash-safe: a backend failure falls back to safe
// defaults (registration enabled, results hidden) instead of throwing.
export async function getPublicConfigSafe(): Promise<PublicConfig> {
  try {
    return toPublicConfig(await getConfigRecordCached());
  } catch (error) {
    console.error('Falling back to default config:', error);
    return toPublicConfig({});
  }
}

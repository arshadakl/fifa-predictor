'use client';

import { createContext, useContext } from 'react';
import type { PublicConfig } from '@/lib/config';

// Public config is fetched once on the server (root layout) and seeded here, so
// every page reads it from context instantly — no per-page loading round-trip.
const ConfigContext = createContext<PublicConfig | null>(null);

export function ConfigProvider({
  value,
  children,
}: Readonly<{ value: PublicConfig; children: React.ReactNode }>) {
  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function usePublicConfig(): PublicConfig | null {
  return useContext(ConfigContext);
}

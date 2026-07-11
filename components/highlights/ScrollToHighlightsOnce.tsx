'use client';

import { useEffect } from 'react';

const STORAGE_KEY = 'highlights-auto-scrolled';

/** Auto-scrolls the home page to #targetId, but only the first time this browser ever loads it. */
export default function ScrollToHighlightsOnce({ targetId }: Readonly<{ targetId: string }>) {
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return;
    localStorage.setItem(STORAGE_KEY, '1');

    const target = document.getElementById(targetId);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [targetId]);

  return null;
}

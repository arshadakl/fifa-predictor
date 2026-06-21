'use client';

import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type HighlightMatch,
  highlightThumb,
  normalizeText,
  teamLabel,
  teamSearchText,
} from '@/lib/highlights';
import { cn } from '@/lib/utils';

const MAX_SUGGESTIONS = 6;

interface HighlightsSearchProps {
  matches: HighlightMatch[];
}

export default function HighlightsSearch({ matches }: Readonly<HighlightsSearchProps>) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Build the normalized search index once per dataset (cheap, ~40 items).
  const index = useMemo(
    () => matches.map((match) => ({ match, text: teamSearchText(match.title) })),
    [matches],
  );

  // Synchronous, in-memory filter — no network, so it can never fail or stall.
  const results = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return [];
    return index
      .filter((entry) => entry.text.includes(q))
      .sort((a, b) => rank(a.text, q) - rank(b.text, q))
      .slice(0, MAX_SUGGESTIONS)
      .map((entry) => entry.match);
  }, [index, query]);

  // Close the dropdown on any click outside the component.
  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const showDropdown = open && query.trim().length > 0;

  function go(match: HighlightMatch) {
    setOpen(false);
    router.push(`/highlights/${match.videoId}`);
  }

  function clearSearch() {
    setQuery('');
    setActive(-1);
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (!showDropdown || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      const target = results[active] ?? results[0];
      if (target) go(target);
    }
  }

  return (
    <div ref={containerRef} className="relative mb-10 max-w-xs">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1); // results change with the query, so clear the highlight
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search by team..."
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="highlight-search-list"
          aria-autocomplete="list"
          className="w-full bg-transparent border-0 border-b border-white/15 outline-none text-white text-sm py-2 pl-1 pr-7 placeholder:text-white/35 transition-colors focus:border-(--color-gold-3)"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Clear search"
            className="absolute right-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-white/45 transition-colors hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        )}
      </div>

      {showDropdown && (
        <ul
          id="highlight-search-list"
          role="listbox"
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-lg border border-white/10 bg-(--color-nav-dark) shadow-xl"
        >
          {results.length === 0 ? (
            <li className="px-4 py-3 text-sm text-white/50">No matches found.</li>
          ) : (
            results.map((match, i) => (
              <li key={match.videoId} role="option" aria-selected={i === active}>
                <Link
                  href={`/highlights/${match.videoId}`}
                  onClick={() => setOpen(false)}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 no-underline transition-colors',
                    i === active ? 'bg-white/10' : 'hover:bg-white/5',
                  )}
                >
                  <span className="relative aspect-video w-16 shrink-0 overflow-hidden rounded bg-(--color-badge-dark)">
                    {match.image && (
                      <Image
                        src={highlightThumb(match.image.src, 480)}
                        alt=""
                        fill
                        sizes="64px"
                        className="scale-[2] object-cover"
                        unoptimized
                      />
                    )}
                  </span>
                  <span className="line-clamp-2 text-xs font-medium leading-snug text-white/85">
                    {teamLabel(match.title)}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

/** Word-prefix matches rank above mid-word substring matches. */
function rank(text: string, query: string): number {
  return text.split(' ').some((word) => word.startsWith(query)) ? 0 : 1;
}

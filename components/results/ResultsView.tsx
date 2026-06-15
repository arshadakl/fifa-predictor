'use client';

import { useEffect, useMemo, useState } from 'react';
import Nav from '../Nav';
import Floodlights from '../Floodlights';
import Footer from '../Footer';
import Spinner from '../Spinner';
import { PredictionPitch } from '../steps/PredictionPreview';
import { btnSecondary } from '../buttonStyles';
import type { PublicSubmission } from '@/lib/fields';
import { fetchResults } from '@/lib/api';
import { DEFAULT_RESULTS_MESSAGE } from '@/lib/config';

type ViewState =
  | { kind: 'loading' }
  | { kind: 'unpublished'; message: string }
  | { kind: 'published'; participants: PublicSubmission[] }
  | { kind: 'error'; message: string };

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

function rankNumber(value: PublicSubmission['Rank']): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : Number.POSITIVE_INFINITY;
}

export default function ResultsView() {
  const [state, setState] = useState<ViewState>({ kind: 'loading' });
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<PublicSubmission | null>(null);

  useEffect(() => {
    let active = true;
    fetchResults()
      .then(({ result }) => {
        if (!active) return;
        if (result.success && result.published) {
          setState({ kind: 'published', participants: result.participants });
        } else if (result.success && !result.published) {
          setState({ kind: 'unpublished', message: result.message || DEFAULT_RESULTS_MESSAGE });
        } else {
          setState({ kind: 'error', message: result.message || 'Unable to load results right now.' });
        }
      })
      .catch(() => {
        if (active) setState({ kind: 'error', message: 'Unable to connect to the server.' });
      });
    return () => {
      active = false;
    };
  }, []);

  const sorted = useMemo(() => {
    if (state.kind !== 'published') return [];
    return [...state.participants].sort((a, b) => {
      const rankDiff = rankNumber(a.Rank) - rankNumber(b.Rank);
      if (rankDiff !== 0) return rankDiff;
      return (b.Total_Score ?? 0) - (a.Total_Score ?? 0) || a.Full_Name.localeCompare(b.Full_Name);
    });
  }, [state]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sorted;
    return sorted.filter((p) => p.Full_Name.toLowerCase().includes(q));
  }, [sorted, query]);

  return (
    <>
      <Nav />
      <Floodlights />

      <main className="flex-1 w-full max-w-[1100px] mx-auto px-5 pt-24 pb-20">
        <div className="text-center mb-8">
          <h1 className="font-(family-name:--font-heading) font-extrabold text-[2rem] sm:text-[2.6rem] gold-text">
            Participant Predictions
          </h1>
          <p className="text-(--color-text-secondary) mt-2">
            Browse everyone&apos;s FIFA World Cup 2026 predictions.
          </p>
        </div>

        {state.kind === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-20 text-(--color-text-secondary)">
            <Spinner /> <span>Loading results…</span>
          </div>
        )}

        {state.kind === 'unpublished' && (
          <div className="glass-card max-w-[550px] mx-auto text-center px-6 py-10">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="font-(family-name:--font-heading) font-bold text-2xl mb-3 text-(--color-accent-gold)">
              Results Not Published Yet
            </h2>
            <p className="text-(--color-text-secondary) leading-relaxed">{state.message}</p>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="glass-card max-w-[550px] mx-auto text-center px-6 py-10 text-(--color-text-secondary)">
            {state.message}
          </div>
        )}

        {state.kind === 'published' && (
          <>
            <div className="relative w-full max-w-[500px] mx-auto mb-8">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-(--color-text-secondary)">🔍</span>
              <input
                type="text"
                placeholder="Search by participant name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[rgba(10,10,15,0.5)] border border-(--color-border-subtle) rounded-xl outline-none text-[0.95rem] text-white transition-all focus:border-(--color-accent-blue)"
              />
            </div>

            {filtered.length === 0 ? (
              <p className="text-center text-(--color-text-secondary) italic py-10">
                {sorted.length === 0
                  ? 'No predictions have been submitted yet.'
                  : 'No participants match your search.'}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => {
                  const rank = rankNumber(p.Rank);
                  return (
                    <div
                      key={p.Submission_ID}
                      className="glass-card flex items-center justify-between gap-3 p-5"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {Number.isFinite(rank) && rank <= 3 && (
                            <span aria-hidden="true">{RANK_MEDAL[rank]}</span>
                          )}
                          <span className="truncate font-(family-name:--font-heading) font-bold text-white">
                            {p.Full_Name}
                          </span>
                        </div>
                        <span className="text-[0.8rem] text-(--color-text-secondary)">
                          Score: <strong className="text-(--color-accent-blue)">{p.Total_Score ?? 0}</strong>
                          {Number.isFinite(rank) && <> · Rank {rank}</>}
                        </span>
                      </div>
                      <button onClick={() => setSelected(p)} className={`${btnSecondary} px-3 py-2 text-[0.8rem] shrink-0`}>
                        View
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {selected && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-5 backdrop-blur-[10px] animate-fade-in"
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card max-h-[90vh] w-full max-w-[750px] overflow-y-auto p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-(family-name:--font-heading) text-xl font-bold text-(--color-accent-gold)">
                  {selected.Full_Name}
                </h3>
                <p className="text-[0.85rem] text-(--color-text-secondary)">
                  Score: {selected.Total_Score ?? 0}
                  {Number.isFinite(rankNumber(selected.Rank)) && <> · Rank {rankNumber(selected.Rank)}</>}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className={btnSecondary}>
                Close
              </button>
            </div>
            <PredictionPitch values={selected} />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Floodlights from '../Floodlights';
import MetricsGrid from './MetricsGrid';
import ActualsForm from './ActualsForm';
import LeaderboardTable from './LeaderboardTable';
import DetailModal from './DetailModal';
import EventControls from './EventControls';
import { btnSecondary } from '../buttonStyles';
import type { Predictions, Submission } from '@/lib/fields';
import { fetchSubmissions, calculateScores, fetchActuals, saveActuals } from '@/lib/api';
import { cn } from '@/lib/utils';

type AdminTab = 'leaderboard' | 'actuals' | 'controls';

const TABS: { id: AdminTab; label: string }[] = [
  { id: 'leaderboard', label: 'Participant Leaderboard' },
  { id: 'actuals', label: 'Enter Actual Tournament Results' },
  { id: 'controls', label: 'Event Controls' },
];

const EMPTY_ACTUALS: Predictions = {
  World_Cup_Winner: '',
  Runner_Up: '',
  Third_Place: '',
  Fair_Play_Award: '',
  Most_Entertaining_Team: '',
  Dark_Horse: '',
  Golden_Ball: '',
  Golden_Boot: '',
  Most_Assists: '',
  Golden_Glove: '',
  Best_Young_Player: '',
};

const STORAGE_KEY = 'fwc26_actuals';

function loadStoredActuals(): Predictions {
  if (typeof window === 'undefined') return EMPTY_ACTUALS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...EMPTY_ACTUALS, ...JSON.parse(stored) };
    }
  } catch (err) {
    console.error(err);
  }
  return EMPTY_ACTUALS;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [actuals, setActuals] = useState<Predictions>(loadStoredActuals);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('leaderboard');

  useEffect(() => {
    async function loadSubmissions() {
      try {
        const { ok, status, result } = await fetchSubmissions();
        if (status === 401) {
          window.location.assign('/admin/login');
          return;
        }
        if (ok && result.success) {
          setSubmissions(result.submissions);
        } else {
          throw new Error(result.message || 'Failed to load submissions');
        }
      } catch (err) {
        console.error('Failed to load submissions:', err);
        setSubmissions([]);
        showToast('Unable to load submissions from the server.');
      }
    }

    loadSubmissions();
  }, []);

  // Load saved actuals from the sheet so the form is consistent across browsers
  // (localStorage above only gives an instant first paint). Sheet wins.
  useEffect(() => {
    async function loadActuals() {
      try {
        const { ok, status, result } = await fetchActuals();
        if (status === 401) {
          window.location.assign('/admin/login');
          return;
        }
        if (ok && result.success) {
          setActuals((prev) => ({ ...prev, ...result.actuals }));
        }
      } catch (err) {
        console.error('Failed to load actuals:', err);
      }
    }

    loadActuals();
  }, []);

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleLogout() {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      window.location.assign('/admin/login');
    }
  }

  async function handleClearActuals() {
    setClearing(true);
    setActuals(EMPTY_ACTUALS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }

    try {
      const { ok, status, result } = await saveActuals(EMPTY_ACTUALS);
      if (status === 401) {
        window.location.assign('/admin/login');
        return;
      }
      if (ok && result.success) {
        showToast('Actual results cleared.');
      } else {
        showToast('Cleared the form, but saving to the sheet failed.');
      }
    } catch (err) {
      console.error('Clear actuals failed:', err);
      showToast('Cleared the form, but could not reach the server.');
    } finally {
      setClearing(false);
    }
  }

  async function handleCalculate() {
    setCalculating(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actuals));
    } catch (err) {
      console.error(err);
    }

    try {
      const { ok, status, result } = await calculateScores(actuals);
      if (status === 401) {
        window.location.assign('/admin/login');
        return;
      }
      if (ok && result.success) {
        setSubmissions(result.submissions);
        showToast(result.message || 'Scores and rankings computed successfully!');
      } else {
        showToast(result.message || 'Unable to calculate scores right now.');
      }
    } catch (err) {
      console.error('Calculation failed:', err);
      showToast('Unable to connect to the server.');
    } finally {
      setCalculating(false);
    }
  }

  return (
    <div className="admin-body flex flex-col flex-1">
      <Floodlights />

      <main className="w-full max-w-[1400px] mx-auto px-5 py-10 pb-20 flex flex-col gap-8 flex-1">
        <header className="flex justify-between items-center border-b border-(--color-border-subtle) pb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-shadow-[0_0_20px_rgba(255,255,255,0.1)] font-(family-name:--font-heading) font-extrabold text-[2rem]">
              <span className="gold-text">FIFA World Cup 2026</span> Admin Dashboard
            </h1>
            <p className="text-(--color-text-secondary) text-base mt-1">
              Manage predictions, calculate scores, and export results
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link href="/" className={`${btnSecondary} text-[0.95rem] px-5 py-2.5`}>
              ← Back to Contest Home
            </Link>
            <button onClick={handleLogout} className={`${btnSecondary} text-[0.95rem] px-5 py-2.5`}>
              Log out
            </button>
          </div>
        </header>

        <MetricsGrid submissions={submissions} />

        <div className="flex gap-2 flex-wrap border-b border-(--color-border-subtle) pb-4">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn('category-pill', activeTab === tab.id && 'active')}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'leaderboard' && (
          <LeaderboardTable submissions={submissions} onSelect={setSelected} />
        )}
        {activeTab === 'actuals' && (
          <ActualsForm
            actuals={actuals}
            onChange={(field, value) => setActuals((prev) => ({ ...prev, [field]: value }))}
            onCalculate={handleCalculate}
            calculating={calculating}
            onClear={handleClearActuals}
            clearing={clearing}
          />
        )}
        {activeTab === 'controls' && <EventControls submissions={submissions} onToast={showToast} />}
      </main>

      <DetailModal submission={selected} actuals={actuals} onClose={() => setSelected(null)} />

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-7 py-3 rounded-xl font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.3)] z-200 transition-all">
          {toast}
        </div>
      )}
    </div>
  );
}

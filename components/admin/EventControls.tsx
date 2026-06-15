'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Spinner from '../Spinner';
import { btnGold, btnSecondary } from '../buttonStyles';
import type { Submission } from '@/lib/fields';
import type { AppConfig } from '@/lib/config';
import { fetchAdminConfig, saveAdminConfig } from '@/lib/api';
import { formatTimestamp, cn } from '@/lib/utils';

interface EventControlsProps {
  submissions: Submission[];
  onToast: (message: string) => void;
}

type ConfigPatch = Partial<{
  registrationEnabled: boolean;
  registrationClosedMessage: string;
  resultsPublished: boolean;
  resultsMessage: string;
}>;

function StatusPill({ on, onLabel, offLabel }: Readonly<{ on: boolean; onLabel: string; offLabel: string }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.8rem] font-bold uppercase tracking-[0.5px]',
        on ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', on ? 'bg-emerald-400' : 'bg-red-400')} />
      {on ? onLabel : offLabel}
    </span>
  );
}

export default function EventControls({ submissions, onToast }: Readonly<EventControlsProps>) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [regMessage, setRegMessage] = useState('');
  const [resMessage, setResMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [lateEntries, setLateEntries] = useState<Submission[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { ok, status: httpStatus, result } = await fetchAdminConfig();
        if (httpStatus === 401) {
          window.location.assign('/admin/login');
          return;
        }
        if (ok && result.success) {
          setConfig(result.config);
          // Seed the editable message drafts once, on first load only — so saving
          // one field never discards an unsaved edit in the other.
          setRegMessage(result.config.registrationClosedMessage);
          setResMessage(result.config.resultsMessage);
          setStatus('ready');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Failed to load event settings:', err);
        setStatus('error');
      }
    }
    load();
  }, []);

  async function persist(patch: ConfigPatch) {
    setSaving(true);
    try {
      const { ok, status: httpStatus, result } = await saveAdminConfig(patch);
      if (httpStatus === 401) {
        window.location.assign('/admin/login');
        return;
      }
      if (ok && result.success) {
        setConfig(result.config);
        onToast('Event settings updated.');
      } else {
        onToast(result.success === false ? result.message || 'Unable to save settings.' : 'Unable to save settings.');
      }
    } catch (err) {
      console.error('Failed to save event settings:', err);
      onToast('Unable to connect to the server.');
    } finally {
      setSaving(false);
    }
  }

  function checkLateEntries() {
    if (!config?.registrationDisabledAt) {
      onToast('Registration has not been disabled yet — no cut-off time to check against.');
      setLateEntries(null);
      return;
    }
    const cutoff = new Date(config.registrationDisabledAt).getTime();
    const late = submissions.filter((s) => {
      const t = new Date(s.Timestamp).getTime();
      return !Number.isNaN(t) && t > cutoff;
    });
    setLateEntries(late);
  }

  if (status === 'loading') {
    return (
      <section className="glass-card flex items-center justify-center gap-3 p-12 text-(--color-text-secondary)">
        <Spinner /> Loading event settings…
      </section>
    );
  }

  if (status === 'error' || !config) {
    return (
      <section className="glass-card p-8 text-center text-(--color-text-secondary)">
        Unable to load event settings. Make sure the sheet&apos;s <strong>Config</strong> tab and Apps Script are set up,
        then reload.
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Registration window */}
      <section className="glass-card p-8">
        <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-(family-name:--font-heading) font-bold text-[1.4rem] text-white">Registration Window</h2>
            <p className="text-(--color-text-secondary) text-[0.9rem]">
              Disable to close predictions. The site and the submission API both honour this.
            </p>
          </div>
          <StatusPill on={config.registrationEnabled} onLabel="Open" offLabel="Closed" />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => persist({ registrationEnabled: !config.registrationEnabled })}
            disabled={saving}
            className={config.registrationEnabled ? btnSecondary : btnGold}
          >
            {config.registrationEnabled ? 'Close Predictions' : 'Open Predictions'}
          </button>
        </div>

        {config.registrationDisabledAt && (
          <p className="mt-4 text-[0.85rem] text-(--color-text-secondary)">
            Last disabled at: <strong className="text-white">{formatTimestamp(config.registrationDisabledAt)}</strong>
          </p>
        )}

        <div className="mt-6">
          <label className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-[1px] text-(--color-text-secondary)">
            Closed message (shown to participants)
          </label>
          <textarea
            value={regMessage}
            onChange={(e) => setRegMessage(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full resize-y rounded-xl border border-(--color-border-subtle) bg-[rgba(10,10,15,0.5)] px-4 py-3 text-[0.95rem] text-white outline-none transition-all focus:border-(--color-accent-blue)"
          />
          <button
            onClick={() => persist({ registrationClosedMessage: regMessage })}
            disabled={saving || regMessage === config.registrationClosedMessage}
            className={`${btnSecondary} mt-3`}
          >
            Save message
          </button>
        </div>
      </section>

      {/* Late-entry audit */}
      <section className="glass-card p-8">
        <h2 className="font-(family-name:--font-heading) font-bold text-[1.4rem] text-white mb-1.5">
          Late Entry Check
        </h2>
        <p className="text-(--color-text-secondary) text-[0.9rem] mb-5">
          Flags submissions whose timestamp is after the last time registration was disabled — useful for spotting
          entries made by calling the API directly after closing. Nothing is deleted.
        </p>

        <button onClick={checkLateEntries} disabled={saving} className={btnSecondary}>
          Check Late Entries
        </button>

        {lateEntries !== null && (
          <div className="mt-5">
            {lateEntries.length === 0 ? (
              <p className="text-emerald-400 text-[0.95rem]">
                ✅ No entries found after {formatTimestamp(config.registrationDisabledAt)}.
              </p>
            ) : (
              <>
                <p className="text-red-400 text-[0.95rem] mb-3 font-semibold">
                  ⚠️ {lateEntries.length} entr{lateEntries.length === 1 ? 'y' : 'ies'} after{' '}
                  {formatTimestamp(config.registrationDisabledAt)}:
                </p>
                <div className="overflow-x-auto rounded-xl border border-(--color-border-subtle)">
                  <table className="w-full text-left text-[0.9rem]">
                    <thead>
                      <tr>
                        {['Submission ID', 'Name', 'Submitted'].map((h) => (
                          <th
                            key={h}
                            className="bg-[rgba(16,24,39,0.8)] p-3 font-(family-name:--font-heading) font-bold text-white uppercase text-[0.75rem] tracking-[0.5px]"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lateEntries.map((s) => (
                        <tr key={s.Submission_ID} className="border-b border-white/[0.03] last:border-b-0">
                          <td className="p-3 text-(--color-text-secondary)">{s.Submission_ID}</td>
                          <td className="p-3 text-white">{s.Full_Name}</td>
                          <td className="p-3 text-(--color-text-secondary) whitespace-nowrap">
                            {formatTimestamp(s.Timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Results publishing */}
      <section className="glass-card p-8">
        <div className="mb-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="font-(family-name:--font-heading) font-bold text-[1.4rem] text-white">Results Publishing</h2>
            <p className="text-(--color-text-secondary) text-[0.9rem]">
              When published, anyone can view participant predictions at{' '}
              <Link href="/results" className="text-(--color-accent-blue) underline">
                /results
              </Link>{' '}
              (no mobile numbers or emails are shown).
            </p>
          </div>
          <StatusPill on={config.resultsPublished} onLabel="Published" offLabel="Hidden" />
        </div>

        <button
          onClick={() => persist({ resultsPublished: !config.resultsPublished })}
          disabled={saving}
          className={config.resultsPublished ? btnSecondary : btnGold}
        >
          {config.resultsPublished ? 'Unpublish Results' : 'Publish Results'}
        </button>

        <div className="mt-6">
          <label className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-[1px] text-(--color-text-secondary)">
            Message shown before results are published
          </label>
          <textarea
            value={resMessage}
            onChange={(e) => setResMessage(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full resize-y rounded-xl border border-(--color-border-subtle) bg-[rgba(10,10,15,0.5)] px-4 py-3 text-[0.95rem] text-white outline-none transition-all focus:border-(--color-accent-blue)"
          />
          <button
            onClick={() => persist({ resultsMessage: resMessage })}
            disabled={saving || resMessage === config.resultsMessage}
            className={`${btnSecondary} mt-3`}
          >
            Save message
          </button>
        </div>
      </section>
    </div>
  );
}

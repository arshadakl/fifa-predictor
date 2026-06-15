'use client';

import { useState } from 'react';
import ActualPickerField from './ActualPickerField';
import { btnGold, btnSecondary, btnSecondarySm } from '../buttonStyles';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';
import type { Predictions } from '@/lib/fields';

// Same option sets the prediction wizard uses, so the stored actual strings
// match participant answers exactly. Teams sorted alphabetically for the
// picker list; players already arrive sorted from predictionOptions.
const TEAM_PICKER_OPTIONS = [...TEAM_OPTIONS].sort((a, b) => a.name.localeCompare(b.name));

interface ActualsFormProps {
  actuals: Predictions;
  onChange: (field: keyof Predictions, value: string) => void;
  onCalculate: () => void;
  calculating: boolean;
  onClear: () => void;
  clearing: boolean;
}

export default function ActualsForm({
  actuals,
  onChange,
  onCalculate,
  calculating,
  onClear,
  clearing,
}: Readonly<ActualsFormProps>) {
  const [confirmClear, setConfirmClear] = useState(false);

  const hasAnyValue = Object.values(actuals).some((v) => v.trim() !== '');

  function handleConfirmClear() {
    setConfirmClear(false);
    onClear();
  }
  function teamField(key: keyof Predictions, label: string) {
    return (
      <ActualPickerField
        label={label}
        kind="team"
        options={TEAM_PICKER_OPTIONS}
        value={actuals[key]}
        onChange={(v) => onChange(key, v)}
      />
    );
  }

  function playerField(key: keyof Predictions, label: string) {
    return (
      <ActualPickerField
        label={label}
        kind="player"
        options={PLAYER_OPTIONS}
        value={actuals[key]}
        onChange={(v) => onChange(key, v)}
      />
    );
  }

  return (
    <section className="glass-card p-8 w-full">
      <div className="mb-8">
        <h2 className="font-(family-name:--font-heading) font-bold text-[1.8rem] mb-1.5 bg-gradient-to-r from-white to-(--color-accent-blue) bg-clip-text text-transparent">
          Enter Actual Tournament Results
        </h2>
        <p className="text-(--color-text-secondary) text-[0.95rem]">
          Provide correct outcomes to calculate participant scores
        </p>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <h3 className="font-(family-name:--font-heading) text-[1.05rem] font-bold uppercase tracking-[1px] text-(--color-accent-blue) mt-4 mb-5 border-b border-(--color-accent-blue)/15 pb-1.5">
          Team Outcomes
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamField('World_Cup_Winner', 'World Cup Winner (2pts)')}
          {teamField('Runner_Up', 'Runner-Up (1pt)')}
          {teamField('Third_Place', 'Third Place (1pt)')}
          {teamField('Fair_Play_Award', 'Fair Play Award (1pt)')}
          {teamField('Most_Entertaining_Team', 'Most Entertaining (1pt)')}
          {teamField('Dark_Horse', 'Dark Horse (1pt)')}
        </div>

        <h3 className="font-(family-name:--font-heading) text-[1.05rem] font-bold uppercase tracking-[1px] text-(--color-accent-blue) mt-8 mb-5 border-b border-(--color-accent-blue)/15 pb-1.5">
          Player Awards
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {playerField('Golden_Ball', 'Golden Ball Best Player (2pts)')}
          {playerField('Golden_Boot', 'Golden Boot Top Scorer (1pt)')}
          {playerField('Most_Assists', 'Most Assists (1pt)')}
          {playerField('Golden_Glove', 'Golden Glove Goalkeeper (1pt)')}
          {playerField('Best_Young_Player', 'Best Young Player Award (1pt)')}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button onClick={onCalculate} disabled={calculating || clearing} className={`${btnGold} flex-1 py-4`}>
            Calculate &amp; Rank Submissions
            <span className="btn-shine" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            disabled={clearing || calculating || !hasAnyValue}
            className={`${btnSecondary} py-4 sm:w-auto w-full`}
          >
            {clearing ? 'Clearing…' : 'Clear Results'}
          </button>
        </div>
      </form>

      {confirmClear && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-5 backdrop-blur-[10px] animate-fade-in">
          <div className="glass-card w-full max-w-[450px] p-9 px-6 text-center border border-(--color-accent-gold)/25">
            <div className="text-5xl mb-4">🧹</div>
            <h3 className="font-(family-name:--font-heading) font-bold text-2xl mb-3 text-(--color-accent-gold)">
              Clear Actual Results?
            </h3>
            <p className="text-(--color-text-secondary) leading-relaxed mb-7">
              All entered actual results will be cleared from the form and the sheet. Participant scores and rankings
              are <strong className="text-white">not</strong> changed — re-run Calculate after entering new results.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmClear(false)} className={`${btnSecondarySm} flex-1`}>
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="btn inline-flex flex-1 items-center justify-center font-(family-name:--font-heading) font-bold text-sm px-5 py-2 rounded-xl cursor-pointer transition-all relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:-translate-y-0.5"
              >
                Yes, Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

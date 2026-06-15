'use client';

import { useState } from 'react';
import OptionSelector, { OptionFlagOrPhoto } from '../OptionSelector';
import { ChevronDownIcon } from '../icons';
import { findTeamOption, findPlayerOption } from '@/lib/predictionOptions';
import type { TeamOption, PlayerOption } from '@/lib/predictionOptions';
import { btnSecondarySm } from '../buttonStyles';

interface ActualPickerFieldProps {
  label: string;
  kind: 'team' | 'player';
  options: TeamOption[] | PlayerOption[];
  value: string;
  onChange: (value: string) => void;
}

// Admin "actual result" field: shows the chosen team/player with its flag or
// photo and opens a modal (the same searchable picker the wizard uses) to
// change it. The stored value is the exact option name, so scoring's string
// comparison stays aligned with participant answers.
export default function ActualPickerField({
  label,
  kind,
  options,
  value,
  onChange,
}: Readonly<ActualPickerFieldProps>) {
  const [open, setOpen] = useState(false);

  const selected = kind === 'team' ? findTeamOption(value) : findPlayerOption(value);

  function handleSelect(name: string) {
    onChange(name);
    setOpen(false);
  }

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <span className="text-[0.7rem] font-semibold tracking-[1px] uppercase text-(--color-text-secondary)">
          {label}
        </span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-(--color-border-subtle) bg-[rgba(10,10,15,0.5)] px-4 py-3 text-left transition-all cursor-pointer hover:border-(--color-accent-blue) focus:border-(--color-accent-blue) outline-none"
        >
          {selected ? (
            <OptionFlagOrPhoto option={selected} size={40} sizeClass="h-10 w-10" />
          ) : (
            <span className="h-10 w-10 shrink-0 rounded-full border border-dashed border-white/20 bg-white/5" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[0.95rem] font-semibold text-white">
              {selected ? selected.name : '— Not decided —'}
            </span>
            {selected && (
              <span className="block truncate text-xs text-white/45">
                {kind === 'team'
                  ? (selected as TeamOption).stage
                  : `${(selected as PlayerOption).teamName} · ${(selected as PlayerOption).position}`}
              </span>
            )}
          </span>
          <ChevronDownIcon className="h-4 w-4 shrink-0 text-(--color-text-secondary)" />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-5 backdrop-blur-[10px] animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="glass-card flex max-h-[85vh] w-full max-w-[520px] flex-col p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h3 className="font-(family-name:--font-heading) text-xl font-bold text-(--color-accent-gold)">
                {label}
              </h3>
              <button type="button" onClick={() => setOpen(false)} className={btnSecondarySm}>
                Close
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <OptionSelector options={options} kind={kind} value={value} onChange={handleSelect} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

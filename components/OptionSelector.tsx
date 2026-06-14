'use client';

import { useState } from 'react';
import Image from 'next/image';
import type { TeamOption, PlayerOption } from '@/lib/predictionOptions';
import PlayerSilhouette from './PlayerSilhouette';
import SearchInput from './SearchInput';

type Option = TeamOption | PlayerOption;

const PLAYER_LIST_CAP = 50;

function isPlayerOption(option: Option): option is PlayerOption {
  return 'teamName' in option;
}

function matchesQuery(name: string, query: string): boolean {
  if (!query) return true;
  return name.toLowerCase().split(/\s+/).some((word) => word.startsWith(query));
}

function OptionFlagOrPhoto({ option, size }: { option: Option; size: number }) {
  const sizeClass = size === 40 ? 'h-10 w-10' : 'h-7 w-7';

  if (isPlayerOption(option)) {
    return option.imageSrc ? (
      <Image
        src={option.imageSrc}
        alt=""
        width={size}
        height={size}
        className={`${sizeClass} rounded-full border border-white/15 object-cover object-top shrink-0`}
        unoptimized
      />
    ) : (
      <PlayerSilhouette className={`${sizeClass} rounded-full border border-white/15 bg-white/5 p-1 text-white/20 shrink-0`} />
    );
  }

  return (
    <Image
      src={option.flagSrc}
      alt=""
      width={size}
      height={size}
      className={`${sizeClass} rounded-full border border-white/15 object-cover shrink-0`}
      unoptimized
    />
  );
}

export default function OptionSelector({
  options,
  kind,
  value,
  onChange,
}: {
  options: Option[];
  kind: 'team' | 'player';
  value: string;
  onChange: (name: string) => void;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const selected = options.find((o) => o.name.toLowerCase() === value.toLowerCase());

  const visible = q
    ? options.filter((o) => matchesQuery(o.name, q))
    : options.slice(0, kind === 'player' ? PLAYER_LIST_CAP : options.length);

  return (
    <div>
      <div className="mb-5 flex min-h-[76px] items-center gap-3 rounded-lg border border-white/10 bg-(--color-badge-dark) p-4">
        {selected ? (
          <>
            <OptionFlagOrPhoto option={selected} size={40} />
            <div className="flex flex-col gap-0.5 text-left">
              <span className="font-(family-name:--font-display) font-extrabold uppercase text-white">
                {selected.name}
              </span>
              <span className="text-xs text-white/45">
                {isPlayerOption(selected) ? `${selected.teamName} · ${selected.position}` : selected.stage}
              </span>
            </div>
          </>
        ) : (
          <span className="mx-auto font-(family-name:--font-display) text-3xl font-extrabold text-white/15">?</span>
        )}
      </div>

      <div className="mb-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder={kind === 'team' ? 'Search teams...' : 'Search players...'}
        />
      </div>

      <div className="max-h-80 overflow-y-auto rounded-lg border border-white/10 scrollbar-thin">
        {visible.map((option) => {
          const isSelected = option.name.toLowerCase() === value.toLowerCase();

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.name)}
              className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors border-b border-white/5 last:border-b-0 ${
                isSelected ? 'bg-(--color-gold-3)/10' : 'hover:bg-white/5'
              }`}
            >
              <span className="flex items-center gap-2.5 min-w-0">
                <OptionFlagOrPhoto option={option} size={28} />
                <span className="truncate text-sm font-semibold text-white">{option.name}</span>
              </span>
              <span className="shrink-0 text-xs text-white/45">
                {isPlayerOption(option) ? option.teamName : option.stage}
              </span>
            </button>
          );
        })}

        {visible.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-white/45">No results found.</p>
        )}
      </div>
    </div>
  );
}

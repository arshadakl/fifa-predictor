'use client';

import { useState } from 'react';
import { type Team } from '@/lib/teams';
import TeamCard from './TeamCard';
import SearchInput from './SearchInput';

interface TeamsGridProps {
  teams: Team[];
}

export default function TeamsGrid({ teams }: Readonly<TeamsGridProps>) {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered = teams.filter((team) =>
    team.teamName.toLowerCase().split(/\s+/).some((word) => word.startsWith(q)),
  );

  return (
    <>
      <div className="max-w-xs mb-6">
        <SearchInput value={query} onChange={setQuery} placeholder="Search teams..." />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filtered.map((team) => (
          <TeamCard key={team.teamId} team={team} />
        ))}
      </div>
    </>
  );
}

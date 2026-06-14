'use client';

import { useState } from 'react';
import { type SquadOfficial, type SquadPlayer, groupPlayersByPosition } from '@/lib/teams';
import PlayerCard from './PlayerCard';
import ManagerCard from './ManagerCard';
import SearchInput from './SearchInput';

export default function SquadGrid({
  players,
  manager,
  flagSrc,
}: {
  players: SquadPlayer[];
  manager: SquadOfficial | null;
  flagSrc: string;
}) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();

  const matchesQuery = (name: string) =>
    name.toLowerCase().split(/\s+/).some((word) => word.startsWith(q));

  const filteredPlayers = players.filter((player) => matchesQuery(player.name));
  const groups = groupPlayersByPosition(filteredPlayers);
  const showManager = manager && matchesQuery(manager.name);

  return (
    <>
      <div className="max-w-xs mb-8">
        <SearchInput value={query} onChange={setQuery} placeholder="Search players..." />
      </div>

      {groups.map((group) => (
        <section key={group.position} className="mb-10">
          <h2 className="font-(family-name:--font-display) font-bold uppercase text-lg text-white mb-4 pb-2 border-b border-white/10">
            {group.position}
            {group.players.length > 1 ? 's' : ''}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {group.players.map((player) => (
              <PlayerCard key={player.idPlayer} player={player} flagSrc={flagSrc} />
            ))}
          </div>
        </section>
      ))}

      {showManager && manager && (
        <section className="mb-10">
          <h2 className="font-(family-name:--font-display) font-bold uppercase text-lg text-white mb-4 pb-2 border-b border-white/10">
            Manager
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <ManagerCard manager={manager} flagSrc={flagSrc} />
          </div>
        </section>
      )}
    </>
  );
}

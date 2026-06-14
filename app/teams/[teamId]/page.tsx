import Image from 'next/image';
import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import PlayerCard from '@/components/PlayerCard';
import ManagerCard from '@/components/ManagerCard';
import { fetchSquadData, flagUrl, groupPlayersByPosition } from '@/lib/teams';

export default async function SquadPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const squad = await fetchSquadData(teamId);
  const groups = groupPlayersByPosition(squad.players);
  const flagSrc = flagUrl(squad.teamFlag, 1);

  return (
    <>
      <Nav />
      <Floodlights />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-5 sm:px-8 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <Image
            src={flagUrl(squad.teamFlag, 4)}
            alt={`${squad.teamName} flag`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full border border-white/10 object-cover"
            unoptimized
          />
          <h1 className="font-(family-name:--font-display) font-extrabold uppercase text-2xl sm:text-3xl text-white">
            {squad.teamName} <span className="text-(--color-gold-3)">Squad</span>
          </h1>
        </div>

        {groups.map((group) => (
          <section key={group.position} className="mb-10">
            <h2 className="font-(family-name:--font-display) font-bold uppercase text-lg text-white mb-4 pb-2 border-b border-white/10">
              {group.position}{group.players.length > 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {group.players.map((player) => (
                <PlayerCard key={player.idPlayer} player={player} flagSrc={flagSrc} />
              ))}
            </div>
          </section>
        ))}

        {squad.manager && (
          <section className="mb-10">
            <h2 className="font-(family-name:--font-display) font-bold uppercase text-lg text-white mb-4 pb-2 border-b border-white/10">
              Manager
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <ManagerCard manager={squad.manager} flagSrc={flagSrc} />
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

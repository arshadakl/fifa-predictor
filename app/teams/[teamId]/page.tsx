import Image from 'next/image';
import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import SquadGrid from '@/components/SquadGrid';
import { fetchSquadData, fetchTeamsData, flagUrl } from '@/lib/teams';

// Squad rosters rarely change — regenerate hourly (matches the fetch TTL).
export const revalidate = 3600;

export async function generateStaticParams() {
  const { teams } = await fetchTeamsData();
  return teams.map((team) => ({ teamId: team.teamId }));
}

export default async function SquadPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params;
  const squad = await fetchSquadData(teamId);
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

        <SquadGrid players={squad.players} manager={squad.manager} flagSrc={flagSrc} />
      </main>

      <Footer />
    </>
  );
}

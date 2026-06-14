import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import TeamCard from '@/components/TeamCard';
import { fetchTeamsData } from '@/lib/teams';

export default async function TeamsPage() {
  const { teams } = await fetchTeamsData();

  return (
    <>
      <Nav />
      <Floodlights />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-5 sm:px-8 pt-24 pb-16">
        <h1 className="font-(family-name:--font-display) font-extrabold uppercase text-2xl sm:text-3xl text-white mb-6">
          Qualified <span className="text-(--color-gold-3)">Teams</span>
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {teams.map((team) => (
            <TeamCard key={team.teamId} team={team} />
          ))}
        </div>
      </main>

      <Footer />
    </>
  );
}

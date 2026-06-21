import type { Metadata } from 'next';
import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import HighlightsGroup from '@/components/highlights/HighlightsGroup';
import HighlightsCarousel from '@/components/highlights/HighlightsCarousel';
import HighlightsSearch from '@/components/highlights/HighlightsSearch';
import {
  type HighlightGroup,
  fetchHighlightGroups,
  getAllMatches,
  getLatestMatches,
} from '@/lib/highlights';

// Carousels change slowly; regenerate hourly. The page is CDN-cached, so all
// visitors share ~24 builds/day rather than each triggering upstream fetches.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Highlights',
  description: 'Match highlights from the FIFA World Cup 2026.',
};

export default async function HighlightsPage() {
  // Degrade to the empty state on an upstream outage rather than throwing a 500.
  let groups: HighlightGroup[] = [];
  try {
    groups = await fetchHighlightGroups();
  } catch {
    groups = [];
  }
  const latest = getLatestMatches(groups, 4);
  const allMatches = getAllMatches(groups);

  return (
    <>
      <Nav />
      <Floodlights />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-5 sm:px-8 pt-24 pb-16">
        <h1 className="font-(family-name:--font-display) font-extrabold uppercase text-2xl sm:text-3xl text-white mb-8">
          Match <span className="text-(--color-gold-3)">Highlights</span>
        </h1>

        {groups.length === 0 ? (
          <p className="text-white/60">No highlights available yet. Check back soon.</p>
        ) : (
          <>
            {latest.length > 0 && <HighlightsCarousel title="Latest Highlights" matches={latest} />}
            <HighlightsSearch matches={allMatches} />
            {groups.map((group) => <HighlightsGroup key={group.id} group={group} />)}
          </>
        )}
      </main>

      <Footer />
    </>
  );
}

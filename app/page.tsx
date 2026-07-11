import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import WelcomeStep from '@/components/steps/WelcomeStep';
import ExtendedHighlightsSection from '@/components/highlights/ExtendedHighlightsSection';
import ScrollToHighlightsOnce from '@/components/highlights/ScrollToHighlightsOnce';
import { getExtendedHighlightGroups } from '@/lib/extendedHighlights';

export default function Home() {
  const extendedGroups = getExtendedHighlightGroups();

  return (
    <>
      <Nav />
      <Floodlights />
      <main className="flex-1 flex flex-col w-full">
        <WelcomeStep />

        {extendedGroups.length > 0 && (
          <section id="highlights" className="w-full max-w-[1400px] mx-auto px-5 sm:px-8 py-16">
            {extendedGroups.map((group) => (
              <ExtendedHighlightsSection key={group.id} group={group} />
            ))}
            <ScrollToHighlightsOnce targetId="highlights" />
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

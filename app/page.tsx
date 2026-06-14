import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import WelcomeStep from '@/components/steps/WelcomeStep';

export default function Home() {
  return (
    <>
      <Nav />
      <Floodlights />
      <main className="flex-1 flex w-full">
        <WelcomeStep />
      </main>
    </>
  );
}

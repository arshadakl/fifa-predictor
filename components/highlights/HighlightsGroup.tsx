import { type HighlightGroup } from '@/lib/highlights';
import HighlightCard from './HighlightCard';

export default function HighlightsGroup({ group }: Readonly<{ group: HighlightGroup }>) {
  return (
    <section className="mb-12">
      <h2 className="font-(family-name:--font-display) mb-4 border-b border-white/10 pb-2 text-xl font-bold uppercase text-white">
        {group.title}
      </h2>
      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {group.matches.map((match) => (
          <HighlightCard key={match.videoId} match={match} />
        ))}
      </div>
    </section>
  );
}

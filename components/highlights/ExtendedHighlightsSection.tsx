import { type ExtendedHighlightGroup } from '@/lib/extendedHighlights';
import ExtendedHighlightCard from './ExtendedHighlightCard';

export default function ExtendedHighlightsSection({ group }: Readonly<{ group: ExtendedHighlightGroup }>) {
  return (
    <div className="mb-8">
      <h3 className="font-(family-name:--font-display) mb-4 border-b border-white/10 pb-2 text-xl font-bold uppercase text-white">
        {group.title} Extended Highlights ({group.durationMinutes} minutes)
      </h3>
      <div className="grid grid-cols-1 gap-x-5 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {group.matches.map((match) => (
          <ExtendedHighlightCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}

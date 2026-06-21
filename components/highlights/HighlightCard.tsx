import Image from 'next/image';
import Link from 'next/link';
import { type HighlightMatch, formatDuration, highlightThumb } from '@/lib/highlights';

interface HighlightCardProps {
  match: HighlightMatch;
}

export default function HighlightCard({ match }: Readonly<HighlightCardProps>) {
  return (
    <Link href={`/highlights/${match.videoId}`} className="group flex flex-col no-underline">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-(--color-badge-dark)">
        {match.image && (
          <Image
            src={highlightThumb(match.image.src, 640)}
            alt={match.image.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        )}
        <span className="absolute bottom-0 left-0 bg-black/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          Highlights
        </span>
        {match.duration != null && (
          <span className="absolute bottom-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {formatDuration(match.duration)}
          </span>
        )}
      </div>
      <h3 className="mt-2 text-sm leading-snug text-white/85 transition-colors group-hover:text-white">
        {match.title}
      </h3>
    </Link>
  );
}

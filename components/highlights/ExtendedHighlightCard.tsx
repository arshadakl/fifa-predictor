import Image from 'next/image';
import Link from 'next/link';
import { type ExtendedHighlightMatch } from '@/lib/extendedHighlights';

interface ExtendedHighlightCardProps {
  match: ExtendedHighlightMatch;
}

export default function ExtendedHighlightCard({ match }: Readonly<ExtendedHighlightCardProps>) {
  return (
    <Link href={`/highlights/extended/${match.id}`} className="group flex flex-col no-underline">
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-white/10 bg-(--color-badge-dark)">
        <Image
          src={match.image}
          alt={match.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
        <span className="absolute bottom-0 left-0 bg-black/75 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white">
          Extended Highlights
        </span>
      </div>
      <h3 className="mt-2 text-sm leading-snug text-white/85 transition-colors group-hover:text-white">
        {match.title}
      </h3>
    </Link>
  );
}

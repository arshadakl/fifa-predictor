'use client';

import { useRef, useState } from 'react';
import { type HighlightMatch } from '@/lib/highlights';
import { cn } from '@/lib/utils';
import HighlightCard from './HighlightCard';

interface HighlightsCarouselProps {
  title: string;
  matches: HighlightMatch[];
}

export default function HighlightsCarousel({ title, matches }: Readonly<HighlightsCarouselProps>) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function scroll(direction: 1 | -1) {
    const track = trackRef.current;
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  }

  // Map the scroll range onto dot indices so it works regardless of card width.
  function handleScroll() {
    const track = trackRef.current;
    if (!track || matches.length < 2) return;
    const max = track.scrollWidth - track.clientWidth;
    setActive(max > 0 ? Math.round((track.scrollLeft / max) * (matches.length - 1)) : 0);
  }

  function goTo(index: number) {
    const track = trackRef.current;
    if (!track || matches.length < 2) return;
    const max = track.scrollWidth - track.clientWidth;
    track.scrollTo({ left: (index / (matches.length - 1)) * max, behavior: 'smooth' });
  }

  const arrowClass =
    'flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition-colors hover:bg-white/15';

  return (
    <section className="mb-12">
      <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
        <h2 className="font-(family-name:--font-display) text-xl font-bold uppercase text-white">{title}</h2>
        <div className="hidden gap-2 sm:flex">
          <button type="button" onClick={() => scroll(-1)} aria-label="Scroll left" className={arrowClass}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" onClick={() => scroll(1)} aria-label="Scroll right" className={arrowClass}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {matches.map((match) => (
          <div key={match.videoId} className="w-[78%] shrink-0 snap-start sm:w-[45%] lg:w-[31%]">
            <HighlightCard match={match} />
          </div>
        ))}
      </div>

      {matches.length > 1 && (
        <div className="mt-3 flex justify-center gap-1.5 sm:hidden">
          {matches.map((match, i) => (
            <button
              key={match.videoId}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to highlight ${i + 1}`}
              aria-current={i === active}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === active ? 'w-5 bg-(--color-gold-3)' : 'w-1.5 bg-white/25',
              )}
            />
          ))}
        </div>
      )}
    </section>
  );
}

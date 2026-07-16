import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import ExtendedVideoPlayer from '@/components/highlights/ExtendedVideoPlayer';
import {
  buildFallbackPlayerUrl,
  buildMasterPlaylist,
  getExtendedHighlightGroups,
  getExtendedHighlightMatch,
} from '@/lib/extendedHighlights';

export async function generateStaticParams() {
  const groups = await getExtendedHighlightGroups();
  return groups.flatMap((g) => g.matches.map((m) => ({ id: m.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const found = await getExtendedHighlightMatch(id);
  return {
    title: found?.match.title ?? 'Highlights',
    description: found ? `${found.group.title} extended highlights from the FIFA World Cup 2026.` : undefined,
  };
}

export default async function ExtendedHighlightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const found = await getExtendedHighlightMatch(id);
  if (!found) notFound();
  const { match, group } = found;

  // buildMasterPlaylist is the source of truth for "does this match have a playable
  // rendition" — the actual playlist text is served by the playlist.m3u8 route so the
  // player gets a real same-origin URL (Safari's native HLS engine won't reliably
  // load a manifest from a blob: URL).
  if (!buildMasterPlaylist(match)) notFound();
  const playlistUrl = `/highlights/extended/${match.id}/playlist.m3u8`;
  const fallbackUrl = buildFallbackPlayerUrl(match);

  return (
    <>
      <Nav />
      <Floodlights />

      <main className="flex-1 w-full max-w-[1000px] mx-auto px-5 sm:px-8 pt-24 pb-16">
        <Link
          href="/highlights"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/55 no-underline transition-colors hover:text-white"
        >
          <span aria-hidden="true">←</span> All Highlights
        </Link>

        <ExtendedVideoPlayer
          src={playlistUrl}
          poster={match.image}
          title={match.title}
          fallbackUrl={fallbackUrl}
        />

        <div className="mt-6">
          <h1 className="font-(family-name:--font-display) text-xl sm:text-2xl font-extrabold uppercase leading-tight text-white">
            {match.title}
          </h1>
          <p className="mt-1 text-sm text-white/45">
            {group.title} · {group.durationMinutes} minutes
          </p>
        </div>
      </main>

      <Footer />
    </>
  );
}

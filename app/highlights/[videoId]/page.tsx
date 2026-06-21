import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Nav from '@/components/Nav';
import Floodlights from '@/components/Floodlights';
import Footer from '@/components/Footer';
import VideoPlayer from '@/components/highlights/VideoPlayer';
import { fetchHighlightGroups, fetchHighlightVideo, formatDuration } from '@/lib/highlights';

// Poster / title / description are stable, so refresh daily. The playback token is
// minted fresh client-side at play time — the stale token cached here is never used.
export const revalidate = 86400;

export async function generateStaticParams() {
  // Don't fail the build if FIFA is unreachable — pages still render on-demand.
  try {
    const groups = await fetchHighlightGroups();
    return groups.flatMap((g) => g.matches.map((m) => ({ videoId: m.videoId })));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ videoId: string }>;
}): Promise<Metadata> {
  const { videoId } = await params;
  const video = await fetchHighlightVideo(videoId);
  return {
    title: video?.title ?? 'Highlights',
    description: video?.description ?? 'Match highlights from the FIFA World Cup 2026.',
  };
}

export default async function HighlightMatchPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  const video = await fetchHighlightVideo(videoId);
  if (!video) notFound();

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

        <VideoPlayer videoId={video.videoId} poster={video.poster} title={video.title} />

        <div className="mt-6">
          <h1 className="font-(family-name:--font-display) text-xl sm:text-2xl font-extrabold uppercase leading-tight text-white">
            {video.title}
          </h1>
          {video.duration != null && (
            <p className="mt-1 text-sm text-white/45">{formatDuration(video.duration)}</p>
          )}
          {video.description && (
            <p className="mt-4 leading-relaxed text-white/70">{video.description}</p>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

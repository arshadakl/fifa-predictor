import { buildMasterPlaylist, getExtendedHighlightMatch } from '@/lib/extendedHighlights';

/**
 * Serves the synthesized HLS multivariant playlist as a real network resource.
 *
 * iOS/Safari's native HLS engine is unreliable with `blob:` URLs as a manifest
 * source — it can silently fail to load a multivariant playlist built as a Blob
 * object URL, even though hls.js (used everywhere else) handles that fine. Every
 * URI inside the playlist is already an absolute upstream URL, so there's nothing
 * host-relative here that a real endpoint changes — this exists purely so Safari
 * gets an actual HTTP(S) manifest to fetch instead of a blob.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const found = getExtendedHighlightMatch(id);
  if (!found) return new Response('Not found', { status: 404 });

  const playlist = buildMasterPlaylist(found.match);
  if (!playlist) return new Response('Not found', { status: 404 });

  return new Response(playlist, {
    headers: {
      'Content-Type': 'application/vnd.apple.mpegurl',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}

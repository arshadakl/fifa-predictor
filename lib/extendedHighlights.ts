export type ExtendedHighlightMatch = {
  id: string;
  title: string;
  image: string;
  audio: Record<string, string>;
  video: Record<string, string>;
};

export type ExtendedHighlightGroup = {
  id: string;
  title: string;
  durationMinutes: number;
  matches: ExtendedHighlightMatch[];
};

/**
 * Data used to live in a checked-in JSON file; it's now fetched from an object
 * storage bucket so it can be updated without a redeploy. Cached for an hour —
 * matches this project's convention in lib/highlights.ts for slow-changing data.
 */
export async function getExtendedHighlightGroups(): Promise<ExtendedHighlightGroup[]> {
  const url = process.env.EXTENDED_HIGHLIGHTS_API_URL;
  if (!url) return [];

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return (await res.json()) as ExtendedHighlightGroup[];
  } catch {
    return [];
  }
}

export async function getExtendedHighlightMatch(
  id: string,
): Promise<{ match: ExtendedHighlightMatch; group: ExtendedHighlightGroup } | null> {
  const groups = await getExtendedHighlightGroups();
  for (const group of groups) {
    const match = group.matches.find((m) => m.id === id);
    if (match) return { match, group };
  }
  return null;
}

/**
 * The source video renditions carry no baked-in audio track — audio only exists as
 * separate per-language .m3u8 streams. Approximate ladder metadata (bandwidth in
 * bits/sec, pixel dimensions) so the multivariant playlist we synthesize below gives
 * hls.js / native HLS enough to do real ABR switching; exact figures aren't published
 * by the source, so these are conservative industry-standard estimates per rung.
 */
const QUALITY_META: Record<string, { bandwidth: number; width: number; height: number }> = {
  '240p': { bandwidth: 400_000, width: 426, height: 240 },
  '360p': { bandwidth: 800_000, width: 640, height: 360 },
  '480p': { bandwidth: 1_200_000, width: 854, height: 480 },
  '576p': { bandwidth: 1_600_000, width: 1024, height: 576 },
  '720p': { bandwidth: 2_800_000, width: 1280, height: 720 },
  '720highp': { bandwidth: 2_800_000, width: 1280, height: 720 },
  '1080lowp': { bandwidth: 4_000_000, width: 1920, height: 1080 },
  '1080highp': { bandwidth: 6_000_000, width: 1920, height: 1080 },
};

/**
 * Video-only renditions carry no audio, so a plain single-file .m3u8 can't play sound.
 * Synthesize a proper HLS multivariant (master) playlist instead: one #EXT-X-STREAM-INF
 * per available video quality (so hls.js / native HLS do real network-based ABR), all
 * pointing at a shared #EXT-X-MEDIA AUDIO group so the player muxes audio + video itself
 * — this is the standard HLS pattern for alternate-audio VOD, not manual A/V sync.
 */
export function buildMasterPlaylist(match: ExtendedHighlightMatch): string | null {
  const videoEntries = Object.entries(match.video).filter(([, url]) => !!url);
  if (videoEntries.length === 0) return null;

  const audioEntries = Object.entries(match.audio).filter(([, url]) => !!url);
  const hasAudioGroup = audioEntries.length > 0;

  const lines = ['#EXTM3U', '#EXT-X-VERSION:6', '#EXT-X-INDEPENDENT-SEGMENTS'];

  audioEntries.forEach(([name, url], i) => {
    const language = name.toLowerCase() === 'english' ? ',LANGUAGE="en"' : '';
    lines.push(
      `#EXT-X-MEDIA:TYPE=AUDIO,GROUP-ID="aud",NAME="${name}",DEFAULT=${i === 0 ? 'YES' : 'NO'},AUTOSELECT=YES${language},URI="${url}"`,
    );
  });

  // Ascending bandwidth: on an unknown/slow connection the player's first pick (before
  // it has a throughput estimate) lands on the cheapest rung rather than the heaviest.
  const sorted = [...videoEntries].sort(
    ([a], [b]) => (QUALITY_META[a]?.bandwidth ?? 0) - (QUALITY_META[b]?.bandwidth ?? 0),
  );

  for (const [quality, url] of sorted) {
    const meta = QUALITY_META[quality];
    const audioAttr = hasAudioGroup ? ',AUDIO="aud"' : '';
    const resAttr = meta ? `,RESOLUTION=${meta.width}x${meta.height}` : '';
    const bandwidth = meta?.bandwidth ?? 1_000_000;
    lines.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth}${resAttr}${audioAttr}`);
    lines.push(url);
  }

  return lines.join('\n');
}

// Best-first quality order for picking a single rendition (fallback player link).
const QUALITY_ORDER = ['1080highp', '1080lowp', '720highp', '720p', '576p', '480p', '360p', '240p'];

function bestVideoUrl(match: ExtendedHighlightMatch): string | null {
  for (const quality of QUALITY_ORDER) {
    if (match.video[quality]) return match.video[quality];
  }
  return Object.values(match.video)[0] ?? null;
}

function bestAudioUrl(match: ExtendedHighlightMatch): string | null {
  return match.audio['English'] ?? Object.values(match.audio)[0] ?? null;
}

const FALLBACK_PLAYER_BASE = 'https://arshadakl.github.io/hls-stream-player/';

/**
 * Link to the standalone HLS player (a separate project) as an escape hatch for when
 * the in-page player can't recover — it takes raw video/audio .m3u8 URLs as query
 * params and muxes them itself, so no local playlist synthesis is needed here.
 */
export function buildFallbackPlayerUrl(match: ExtendedHighlightMatch): string | null {
  const video = bestVideoUrl(match);
  if (!video) return null;
  const audio = bestAudioUrl(match);

  const params = new URLSearchParams({ video });
  if (audio) params.set('audio', audio);
  return `${FALLBACK_PLAYER_BASE}?${params.toString()}`;
}

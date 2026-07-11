import rawGroups from '@/data/extendedHighlights.json';

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

const groups = rawGroups as unknown as ExtendedHighlightGroup[];

export function getExtendedHighlightGroups(): ExtendedHighlightGroup[] {
  return groups;
}

export function getExtendedHighlightMatch(
  id: string,
): { match: ExtendedHighlightMatch; group: ExtendedHighlightGroup } | null {
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

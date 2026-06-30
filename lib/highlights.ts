const API = 'https://cxm-api.fifa.com/fifaplusweb/api';

const HIGHLIGHTS_PAGE = `${API}/pages/en/tournaments/mens/worldcup/canadamexicousa2026/highlights/all-matches`;

export type HighlightImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type HighlightMatch = {
  videoId: string;
  title: string;
  description: string;
  image: HighlightImage | null;
  duration: number | null;
  /** Kickoff epoch (ms), parsed from the description prose; null if unparseable. */
  matchDate: number | null;
};

export type HighlightGroup = {
  id: string;
  title: string;
  matches: HighlightMatch[];
};

export type HighlightVideo = {
  videoId: string;
  title: string;
  description: string;
  poster: string | null;
  duration: number | null;
  requiresDRM: boolean;
};

type PageSection = {
  entryId: string;
  entryType: string;
  entryEndpoint: string;
};

type CarouselItem = {
  title?: string;
  description?: string;
  image?: { src?: string; alt?: string; width?: number; height?: number };
  watchDataDto?: { type?: string; videoEntryId?: string; videoDuration?: number };
};

/**
 * List every highlight group on the all-matches page (Group A–H today, semis /
 * final later) without hardcoding the groups. The page response is the source of
 * truth for which carousels exist; we fan out to each carousel for its matches.
 * Cached for an hour so all visitors share one upstream fetch cycle.
 */
export async function fetchHighlightGroups(): Promise<HighlightGroup[]> {
  const pageRes = await fetch(HIGHLIGHTS_PAGE, { next: { revalidate: 3600 } });
  if (!pageRes.ok) throw new Error(`Failed to fetch highlights page: ${pageRes.status}`);
  const page: { sections?: PageSection[] } = await pageRes.json();

  const carousels = (page.sections ?? []).filter((s) => s.entryType === 'sectionPromoCarousel' ||"news");
  const groups = await Promise.all(carousels.map((s) => fetchCarousel(s.entryEndpoint)));

  return groups.filter((g): g is HighlightGroup => g !== null && g.matches.length > 0);
}

async function fetchCarousel(entryEndpoint: string): Promise<HighlightGroup | null> {
  // One bad carousel must not sink the whole page, so swallow its errors and
  // return null — Promise.all then resolves and we just drop this group.
  try {
    // entryEndpoint is relative to …/api/ and may carry a leading slash — strip it.
    const path = entryEndpoint.replace(/^\/+/, '');
    const res = await fetch(`${API}/${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data: { entryId: string; title?: string; items?: CarouselItem[] } = await res.json();

    const matches: HighlightMatch[] = (data.items ?? [])
      .filter((i) => i.watchDataDto?.type === 'video' && i.watchDataDto.videoEntryId)
      .map((i) => ({
        videoId: i.watchDataDto!.videoEntryId!,
        title: i.title ?? '',
        description: i.description ?? '',
        image: i.image?.src
          ? {
              src: i.image.src,
              alt: i.image.alt ?? i.title ?? '',
              width: i.image.width ?? 1280,
              height: i.image.height ?? 720,
            }
          : null,
        duration: i.watchDataDto!.videoDuration ?? null,
        matchDate: parseMatchDate(i.description ?? ''),
      }));

    return { id: data.entryId, title: data.title ?? '', matches };
  } catch {
    return null;
  }
}

const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

/**
 * Kickoff time is not a structured field — it only appears in the description,
 * e.g. "…on Thursday 18 June at 19:00 (local time)". Parse it best-effort for
 * sorting. Times are venue-local (mixed US/MX/CA zones) and the year is omitted,
 * so this is naive: fine for ordering a "latest" shelf, not for exact timestamps.
 */
function parseMatchDate(description: string): number | null {
  const m = /\bon\s+\w+\s+(\d{1,2})\s+([A-Za-z]+)\s+at\s+(\d{1,2}):(\d{2})/.exec(description);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (month === undefined) return null;
  return Date.UTC(2026, month, Number(m[1]), Number(m[3]), Number(m[4]));
}

/** Every match across all groups, de-duplicated by video id (in page order). */
export function getAllMatches(groups: HighlightGroup[]): HighlightMatch[] {
  const seen = new Set<string>();
  const all: HighlightMatch[] = [];

  for (const group of groups) {
    for (const match of group.matches) {
      if (seen.has(match.videoId)) continue;
      seen.add(match.videoId);
      all.push(match);
    }
  }

  return all;
}

/** Newest matches across all groups, de-duplicated by video id. */
export function getLatestMatches(groups: HighlightGroup[], count = 4): HighlightMatch[] {
  return getAllMatches(groups)
    .filter((m) => m.matchDate != null)
    .sort((a, b) => b.matchDate! - a.matchDate!)
    .slice(0, count);
}

/** Lowercase, strip diacritics, and reduce to alphanumeric words — for searching. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip combining diacritic marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Normalized team-name text for a title, dropping the " v " connector so it
 * isn't searchable: "Mexico v Korea Republic | Group A | …" → "mexico korea republic".
 */
export function teamSearchText(title: string): string {
  return normalizeText(title.split('|')[0] ?? '')
    .split(' ')
    .filter((word) => word && word !== 'v')
    .join(' ');
}

/** Human-readable matchup from a title: "Mexico v Korea Republic". */
export function teamLabel(title: string): string {
  return (title.split('|')[0] ?? title).trim();
}

/**
 * Poster / title / description for one match. The response also mints a signed
 * playback token, but it expires in ~10 min — we intentionally ignore it here and
 * let the client re-mint a fresh one at play time. Safe to cache the metadata daily.
 */
export async function fetchHighlightVideo(videoId: string): Promise<HighlightVideo | null> {
  try {
    const res = await fetch(`${API}/videoPlayerData/${videoId}?locale=en&personalizedAds=true`, {
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const d = await res.json();

    return {
      videoId,
      title: d.title ?? '',
      description: d.description ?? '',
      poster: d.videoPosterImage?.src ?? null,
      duration: d.duration ?? null,
      requiresDRM: Boolean(d.requiresDRM),
    };
  } catch {
    return null;
  }
}

/** FIFA digitalhub host resizes on the fly; keep thumbnails small (no 4K downloads). */
export function highlightThumb(src: string, width: number): string {
  const sep = src.includes('?') ? '&' : '?';
  return `${src}${sep}io=transform:fill,aspectratio:16x9,width:${width}&quality=80`;
}

export function formatDuration(seconds: number): string {
  // Round to whole seconds first so e.g. 119.7s renders 2:00, never 1:60.
  const total = Math.max(0, Math.round(seconds));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

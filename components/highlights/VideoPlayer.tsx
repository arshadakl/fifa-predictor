'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

const API = 'https://cxm-api.fifa.com/fifaplusweb/api';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

/**
 * Resolve a fresh, playable .m3u8 entirely in the browser. The signed token from
 * videoPlayerData lives ~10 min, so this MUST run at play time, never at build.
 * Both FIFA and Uplynk send CORS `*`, so no server proxy is needed (and no Vercel cost).
 */
async function resolvePlayUrl(videoId: string): Promise<string> {
  // no-store: the signed token expires in ~10 min, so a replay must hit the
  // network for a fresh one — never let the browser serve a cached (stale) token.
  const metaRes = await fetch(`${API}/videoPlayerData/${videoId}?locale=en&personalizedAds=true`, {
    cache: 'no-store',
  });
  if (!metaRes.ok) throw new Error('Could not load this highlight.');
  const meta = await metaRes.json();

  if (meta.requiresDRM) throw new Error('This highlight is protected and cannot be played here.');

  const p = meta.preplayParameters;
  if (!p?.contentId) throw new Error('No playback data is available for this highlight.');

  const preRes = await fetch(
    `https://content.uplynk.com/preplay/${p.contentId}.json?${p.queryStr}&sig=${p.signature}`,
    { cache: 'no-store' },
  );
  if (!preRes.ok) throw new Error('Could not resolve the video stream.');
  const pre = await preRes.json();

  if (!pre.playURL) throw new Error('This highlight is unavailable right now.');
  return pre.playURL as string;
}

interface VideoPlayerProps {
  videoId: string;
  poster: string | null;
  title: string;
}

export default function VideoPlayer({ videoId, poster, title }: Readonly<VideoPlayerProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const usingHlsRef = useRef(false);
  const recoverRef = useRef(0);
  const [state, setState] = useState<PlayerState>('idle');
  const [error, setError] = useState('');

  // Tear down any hls.js instance when the page unmounts.
  useEffect(() => () => hlsRef.current?.destroy(), []);

  function fail(message: string) {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    setError(message);
    setState('error');
  }

  async function handlePlay() {
    // Clear any instance from a previous (failed) attempt before retrying.
    hlsRef.current?.destroy();
    hlsRef.current = null;
    usingHlsRef.current = false;
    recoverRef.current = 0;
    setState('loading');
    setError('');
    try {
      const url = await resolvePlayUrl(videoId);
      const video = videoRef.current;
      if (!video) return;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari / iOS play HLS natively.
        video.src = url;
      } else {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          usingHlsRef.current = true;
          const hls = new Hls();
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) return; // hls.js handles non-fatal errors itself
            console.error('[highlights] hls.js fatal:', data.type, data.details, data);
            // Try the recommended recovery (twice) before giving up.
            if (recoverRef.current < 2) {
              recoverRef.current += 1;
              if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                hls.startLoad();
                return;
              }
              if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                hls.recoverMediaError();
                return;
              }
            }
            fail('This highlight could not be played. Please try again.');
          });
          hls.loadSource(url);
          hls.attachMedia(video);
          hlsRef.current = hls;
        } else {
          video.src = url;
        }
      }

      setState('playing');
      // Autoplay may be blocked; the native controls let the user start it manually.
      await video.play().catch(() => {});
    } catch (e) {
      fail(e instanceof Error ? e.message : 'Playback failed. Please try again.');
    }
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
      <video
        ref={videoRef}
        controls={state === 'playing'}
        playsInline
        poster={poster ?? undefined}
        onError={() => {
          // Only the native-HLS (iOS) path: when hls.js drives playback it owns
          // error handling via its own ERROR event, so ignore the video element here.
          if (state === 'playing' && !usingHlsRef.current) {
            console.error('[highlights] native video error:', videoRef.current?.error);
            fail('This highlight could not be played. Please try again.');
          }
        }}
        className={cn('h-full w-full', state === 'playing' ? 'block' : 'hidden')}
      >
        <track kind="captions" />
      </video>

      {state !== 'playing' && (
        <>
          {poster && <Image src={poster} alt={title} fill priority unoptimized className="object-cover" />}

          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            {state === 'loading' ? (
              <div className="h-14 w-14 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            ) : (
              <button
                type="button"
                onClick={handlePlay}
                aria-label="Play highlights"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-(--color-gold-3) text-(--color-nav-dark) shadow-lg transition-transform hover:scale-105"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="ml-1 h-7 w-7">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>

          {state === 'error' && (
            <div className="absolute inset-x-0 bottom-0 bg-red-900/85 px-4 py-2 text-center text-sm text-white">
              {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

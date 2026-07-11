'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type PlayerState = 'idle' | 'loading' | 'playing' | 'error';

interface ExtendedVideoPlayerProps {
  /** Synthesized HLS multivariant playlist text (video renditions + AUDIO group). */
  playlist: string;
  poster: string | null;
  title: string;
  /** Standalone HLS-player escape hatch, offered when in-page playback can't recover. */
  fallbackUrl: string | null;
}

export default function ExtendedVideoPlayer({
  playlist,
  poster,
  title,
  fallbackUrl,
}: Readonly<ExtendedVideoPlayerProps>) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<{ destroy: () => void } | null>(null);
  const usingHlsRef = useRef(false);
  const recoverRef = useRef(0);
  const blobUrlRef = useRef<string | null>(null);
  const [state, setState] = useState<PlayerState>('idle');
  const [error, setError] = useState('');
  // True while the video element is genuinely waiting on network data — separate from
  // `state`, so the video stays visible (not swapped for the poster) while it recovers.
  const [stalling, setStalling] = useState(false);

  // Tear down any hls.js instance and the blob URL when the page unmounts.
  useEffect(
    () => () => {
      hlsRef.current?.destroy();
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    [],
  );

  // Surface real buffering (native `waiting`/`playing`) so a stall reads as "loading",
  // not a frozen frame with no explanation.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onWaiting = () => setStalling(true);
    const onResume = () => setStalling(false);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onResume);
    video.addEventListener('canplay', onResume);
    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onResume);
      video.removeEventListener('canplay', onResume);
    };
  }, []);

  // Edge case: with demuxed audio (separate AUDIO group from the video rendition),
  // hls.js/AVFoundation can independently buffer/flush each track. When the *video*
  // track alone stalls — most often right after an ABR level switch — the audio
  // SourceBuffer keeps feeding and playback carries on with the last video frame
  // frozen on screen while audio keeps going. There's no `waiting` event for this
  // (the media element isn't actually starved — audio has data), so detect it
  // directly: if presented-frame callbacks stop firing for >1.5s while video data is
  // buffered ahead of the current position, the video pipeline is stuck rather than
  // network-starved — nudge `currentTime` a touch to force it to re-render.
  useEffect(() => {
    if (state !== 'playing') return;
    const video = videoRef.current as (HTMLVideoElement & {
      requestVideoFrameCallback?: (cb: () => void) => number;
      cancelVideoFrameCallback?: (handle: number) => void;
    }) | null;
    if (!video || !video.requestVideoFrameCallback) return;

    let lastFrameAt = performance.now();
    let rvfcHandle: number;
    let cancelled = false;

    function onFrame() {
      if (cancelled) return;
      lastFrameAt = performance.now();
      rvfcHandle = video!.requestVideoFrameCallback!(onFrame);
    }
    rvfcHandle = video.requestVideoFrameCallback(onFrame);

    function hasBufferedAhead(v: HTMLVideoElement, lookaheadSec = 0.5) {
      const { buffered, currentTime } = v;
      for (let i = 0; i < buffered.length; i += 1) {
        if (buffered.start(i) <= currentTime && buffered.end(i) > currentTime + lookaheadSec) return true;
      }
      return false;
    }

    const watchdog = setInterval(() => {
      if (video.paused || video.ended) return;
      if (performance.now() - lastFrameAt < 1500) return;
      if (!hasBufferedAhead(video)) return; // genuinely waiting on the network — let `waiting` handle it
      console.warn('[extended-highlights] video frame stall detected with audio still buffered; nudging playback');
      video.currentTime = Math.max(0, video.currentTime - 0.08);
    }, 1000);

    return () => {
      cancelled = true;
      if (rvfcHandle != null) video.cancelVideoFrameCallback?.(rvfcHandle);
      clearInterval(watchdog);
    };
  }, [state]);

  function fail(message: string) {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    setError(message);
    setState('error');
  }

  async function handlePlay() {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    usingHlsRef.current = false;
    recoverRef.current = 0;
    setState('loading');
    setError('');
    setStalling(false);
    try {
      const video = videoRef.current;
      if (!video) return;

      // A fresh blob per attempt — the previous one (if any) is now unreferenced.
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const blobUrl = URL.createObjectURL(new Blob([playlist], { type: 'application/vnd.apple.mpegurl' }));
      blobUrlRef.current = blobUrl;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari / iOS parse multivariant playlists (incl. alternate-audio groups)
        // and do ABR natively — no hls.js needed.
        video.src = blobUrl;
      } else {
        const Hls = (await import('hls.js')).default;
        if (Hls.isSupported()) {
          usingHlsRef.current = true;
          const hls = new Hls({
            // Start on hls.js's own bandwidth estimate rather than pinning a rung;
            // -1 is the library default but set explicitly since ABR is the point here.
            startLevel: -1,
            // Never select a rendition larger than the actual player element —
            // avoids burning bandwidth on 1080p decoded into a 400px-wide card.
            capLevelToPlayerSize: true,
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (!data.fatal) return; // hls.js handles non-fatal errors itself
            console.error('[extended-highlights] hls.js fatal:', data.type, data.details, data);
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
          hls.loadSource(blobUrl);
          hls.attachMedia(video);
          hlsRef.current = hls;
        } else {
          video.src = blobUrl;
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
            console.error('[extended-highlights] native video error:', videoRef.current?.error);
            fail('This highlight could not be played. Please try again.');
          }
        }}
        className={cn('h-full w-full', state === 'playing' ? 'block' : 'hidden')}
      >
        <track kind="captions" />
      </video>

      {state === 'playing' && stalling && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        </div>
      )}

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
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1 bg-red-900/85 px-4 py-2 text-center text-sm text-white">
              <span>{error}</span>
              {fallbackUrl && (
                <a
                  href={fallbackUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-(--color-gold-3) underline underline-offset-2 hover:text-white"
                >
                  You can watch on another safe player, click here
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import animationData from './animations/football-lottie.json';

const DEFAULT_MESSAGES = [
  'Submitting your prediction…',
  'Sending your picks to the pitch…',
  'Almost there…',
  'Sit back & relax ⚽',
];

interface LoadingOverlayProps {
  messages?: string[];
}

// Full-screen "relax while we work" overlay shown during the few-second Apps
// Script round-trips (registration check / final submit). The Noto football
// Lottie loops while a calming message cycles. Lazy-loaded (ssr:false) so the
// lottie runtime + JSON never ship on a normal page load.
export default function LoadingOverlay({ messages = DEFAULT_MESSAGES }: Readonly<LoadingOverlayProps>) {
  const container = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!container.current) return;
    const anim = lottie.loadAnimation({
      container: container.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData,
    });
    return () => anim.destroy();
  }, []);

  useEffect(() => {
    if (messages.length <= 1) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % messages.length), 1700);
    return () => clearInterval(id);
  }, [messages.length]);

  return (
    <div className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-6 backdrop-blur-[6px] animate-fade-in">
      <div className="relative flex items-center justify-center">
        {/* Soft pulsing glow behind the ball (no solid box — just the ball animates) */}
        <span className="absolute h-44 w-44 rounded-full bg-(--color-accent-gold)/20 blur-3xl animate-glow-pulse" />
        <div ref={container} className="relative h-40 w-40 drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)]" aria-hidden="true" />
      </div>

      <div className="flex flex-col items-center gap-2 text-center px-6">
        <p
          key={index}
          className="animate-fade-in font-(family-name:--font-heading) text-lg sm:text-xl font-bold text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.6)]"
        >
          {messages[index]}
        </p>
        <p className="text-[0.85rem] text-white/60 [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
          Please keep this window open.
        </p>
      </div>
    </div>
  );
}

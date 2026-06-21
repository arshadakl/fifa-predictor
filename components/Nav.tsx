'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { btnSecondarySm } from './buttonStyles';
import { usePublicConfig } from './ConfigProvider';
import { cn } from '@/lib/utils';

const BASE_NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/teams', label: 'Teams' },
  { href: '/highlights', label: 'Highlights' },
];

const RESULTS_LINK = { href: '/results', label: 'Results' };

const LINK_BASE_CLASS =
  'font-(family-name:--font-display) font-semibold text-[13px] tracking-[0.1em] uppercase no-underline pb-1 transition-colors border-b-2';

interface NavProps {
  onReset?: () => void;
}

export default function Nav({ onReset }: Readonly<NavProps>) {
  const pathname = usePathname();
  const [confirmReset, setConfirmReset] = useState(false);
  const config = usePublicConfig();

  // Results link only shows once the admin has published results.
  const navLinks = config?.resultsPublished ? [...BASE_NAV_LINKS, RESULTS_LINK] : BASE_NAV_LINKS;

  const isPrediction = pathname === '/prediction';

  function handleConfirmReset() {
    setConfirmReset(false);
    onReset?.();
  }

  return (
    <>
    <header className="fixed top-0 inset-x-0 z-20 bg-(--color-nav-dark) border-b border-(--color-blue-3)/20">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo/fifa-world-cup-logo.png"
            alt="FIFA World Cup logo"
            width={76}
            height={76}
            className="h-12 w-12 object-contain"
          />
          <span className="font-(family-name:--font-display) font-extrabold text-sm sm:text-xl tracking-wide sm:tracking-wider text-white uppercase whitespace-nowrap">
           sports gallery <span className="text-(--color-gold-3)">26</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-8">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  LINK_BASE_CLASS,
                  link.href === '/' && 'hidden sm:inline-block',
                  isActive ? 'text-white border-(--color-gold-3)' : 'text-white/55 border-transparent hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {isPrediction && onReset && (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 h-9 px-4 sm:px-[22px] bg-transparent border border-red-400/60 text-red-300 font-(family-name:--font-display) font-extrabold text-xs tracking-[0.1em] uppercase whitespace-nowrap cursor-pointer transition-colors hover:bg-red-400/10 [clip-path:polygon(8%_0,100%_0,92%_100%,0%_100%)]"
          >
            <span aria-hidden="true">↺</span> Reset
          </button>
        )}
      </div>
    </header>

    {confirmReset && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-[10px] flex items-center justify-center z-100 p-5 animate-fade-in">
        <div className="glass-card max-w-[450px] w-full text-center p-9 px-6 border border-(--color-accent-gold)/25 shadow-[0_25px_50px_rgba(255,215,0,0.05)]">
          <div className="text-5xl mb-4">♻️</div>
          <h3 className="font-(family-name:--font-heading) font-bold text-2xl mb-3 text-(--color-accent-gold)">
            Reset Your Predictions?
          </h3>
          <p className="text-(--color-text-secondary) leading-relaxed mb-7">
            Your current selections will be cleared and you will start again from the first step. This cannot be
            undone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmReset(false)} className={`${btnSecondarySm} flex-1`}>
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="btn inline-flex flex-1 items-center justify-center font-(family-name:--font-heading) font-bold text-sm px-5 py-2 rounded-xl cursor-pointer transition-all relative overflow-hidden bg-gradient-to-br from-red-500 to-red-700 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(239,68,68,0.5)]"
            >
              Yes, Reset
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

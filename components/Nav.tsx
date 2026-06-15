'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/teams', label: 'Teams' },
];

const LINK_BASE_CLASS =
  'font-(family-name:--font-display) font-semibold text-[13px] tracking-[0.1em] uppercase no-underline pb-1 transition-colors border-b-2';

export default function Nav() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 inset-x-0 z-20 bg-(--color-nav-dark) border-b border-(--color-blue-3)/20">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 h-[60px] flex items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo/fifa-world-cup-logo.png"
            alt="FIFA World Cup logo"
            width={76}
            height={76}
            className="h-12 w-12 object-contain"
          />
          <span className="font-(family-name:--font-display) font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase whitespace-nowrap">
           sports gallery <span className="text-(--color-gold-3)">26</span>
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  LINK_BASE_CLASS,
                  isActive ? 'text-white border-(--color-gold-3)' : 'text-white/55 border-transparent hover:text-white'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/prediction"
          className="inline-flex items-center gap-1.5 h-9 px-[22px] bg-(--color-gold-3) text-(--color-nav-dark) font-(family-name:--font-display) font-extrabold text-xs tracking-[0.1em] uppercase no-underline whitespace-nowrap transition-opacity hover:opacity-85 [clip-path:polygon(8%_0,100%_0,92%_100%,0%_100%)]"
        >
          Predict Now <span aria-hidden="true">→</span>
        </Link>
      </div>
    </header>
  );
}

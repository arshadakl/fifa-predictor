import Image from 'next/image';
import Link from 'next/link';

export default function WelcomeStep() {
  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden animate-[fadeIn_0.5s_ease_forwards]">
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center scale-105 -translate-y-2.5 md:scale-100 md:translate-y-0"
        style={{ backgroundImage: "url('/images/hero-bg.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-black/60 " />

      <div className="flex-1 flex flex-col md:flex-row justify-center md:px-18 md:items-center pt-[60px]">
        {/* text + button section */}
        <div className="order-2 md:order-1 w-full md:w-[47%] px-5 sm:px-10 md:px-12 lg:px-16 py-10">
          <div className="flex flex-col items-start text-left max-w-[600px]">
            <span className="inline-flex items-center gap-2 mb-5 bg-(--color-badge-dark) border border-[#1e64ff]/50 px-[18px] py-[7px] font-(family-name:--font-display) font-bold text-xs tracking-[0.2em] uppercase text-(--color-gold-3) [clip-path:polygon(2%_0,100%_0,98%_100%,0%_100%)]">
              <span className="w-1.5 h-1.5 rounded-full bg-(--color-gold-3) shrink-0" aria-hidden="true" />
              Sports gallery
            </span>

            <span className="font-(family-name:--font-display) font-semibold uppercase tracking-[0.25em] text-[18px] text-white/60 mb-1">
              FIFA World Cup 2026
            </span>

            <h1 className="font-(family-name:--font-display) font-black italic uppercase leading-[0.9] mb-4">
              <span className="block text-white text-[2.6rem] sm:text-[3.5rem] md:text-[4.4rem] lg:text-[4.6rem]">
                Predict &amp; Win
              </span>
              <span className="block text-(--color-gold-3) text-[3.2rem] sm:text-[4.2rem] md:text-[5.4rem] lg:text-[5.6rem]">
                Contest
              </span>
            </h1>

            <p className="font-(family-name:--font-display) font-semibold italic text-[18px] text-(--color-blue-3) mb-4">
              Think you can predict the future of football?
            </p>

            <p className="max-w-[500px] text-[15px] leading-[1.65] text-white/55 mb-7">
              Submit your predictions for FIFA World Cup 2026 and stand a chance to win exciting prizes.
              From tournament winners to individual awards, test your football knowledge and compete
              against fans from the group.
            </p>

            <div className="flex  gap-1 mb-6">
              <Link
                href="/prediction"
                className="inline-flex items-center justify-center gap-2 h-[52px] min-w-[150px] px-7 font-(family-name:--font-display) font-extrabold text-sm tracking-[0.05em] uppercase whitespace-nowrap no-underline cursor-pointer transition-opacity [clip-path:polygon(6%_0,100%_0,94%_100%,0%_100%)] bg-(--color-gold-3) text-(--color-nav-dark) hover:opacity-85"
              >
                Predict Now <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/teams"
                className="inline-flex items-center justify-center gap-2 h-[52px] min-w-[150px] px-7 font-(family-name:--font-display) font-extrabold text-sm tracking-[0.05em] uppercase whitespace-nowrap no-underline cursor-pointer transition-colors [clip-path:polygon(6%_0,100%_0,94%_100%,0%_100%)] bg-transparent border-[1.5px] border-white text-white hover:bg-white/[0.08]"
              >
                View Teams &amp; Squad <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* image section */}
        <div className="order-1 md:order-2 relative w-full md:w-[52%] h-[320px] md:h-[640px]">
          <Image
            src="/images/hero-mobile.png"
            alt="FIFA World Cup 2026 players holding the trophy"
            fill
            className="object-contain object-bottom md:hidden"
            priority
          />
          <Image
            src="/images/hero-desk.png"
            alt="FIFA World Cup 2026 players holding the trophy"
            fill
            className="object-contain object-bottom hidden md:block"
            priority
          />
          <div className="absolute top-0 right-0 w-[220px] h-[140px] opacity-[0.08] pointer-events-none z-1" aria-hidden="true">
            <span className="absolute -top-[30px] right-[30px] w-px h-[180px] bg-(--color-blue-3) rotate-[20deg]" />
            <span className="absolute -top-[30px] right-[60px] w-px h-[180px] bg-(--color-blue-3) rotate-[20deg]" />
            <span className="absolute -top-[30px] right-[90px] w-px h-[180px] bg-(--color-blue-3) rotate-[20deg]" />
          </div>
          <div className="absolute bottom-[26px] right-[26px] w-12 h-12 opacity-30 pointer-events-none z-1" aria-hidden="true">
            <span className="absolute w-8 h-px bg-(--color-blue-3) -rotate-45 bottom-1.5 -right-1" />
            <span className="absolute w-8 h-px bg-(--color-blue-3) -rotate-45 bottom-4 right-1.5" />
          </div>
        </div>
      </div>

    </div>
  );
}

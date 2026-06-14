import Image from 'next/image';

export default function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="page-enter">
      <div className="text-center max-w-[700px] flex flex-col items-center justify-center">
        <div className="relative mb-6 flex justify-center items-center">
          <div className="trophy-glow absolute rounded-full" />
          <Image
            src="/images/trophy-2.png"
            alt="FIFA World Cup Trophy"
            width={420}
            height={480}
            className="max-w-full max-h-full object-contain relative z-[1] drop-shadow-[0_0_15px_rgba(245,194,68,0.3)]"
            priority
          />
        </div>

        <h1 className="font-(family-name:--font-display) font-extrabold uppercase leading-[1.05] tracking-[-1px] text-[2.6rem] sm:text-[3.4rem] md:text-[4.5rem] mb-4">
          <span className="block text-white">FIFA World Cup 2026</span>
          <span className="block text-(--color-accent-amber)">Predict &amp; Win Contest</span>
        </h1>

        <p className="font-(family-name:--font-heading) font-semibold italic text-[1.125rem] text-(--color-cyan) tracking-[0.15em] mb-4">
          Think you can predict the future of football?
        </p>

        <p className="max-w-[560px] text-[1rem] leading-[1.7] text-[#D1D5DB] mb-10">
          Submit your predictions for FIFA World Cup 2026 and stand a chance to win exciting prizes.
          From tournament winners to individual awards, test your football knowledge and compete against
          fans from the group.
        </p>

        <button
          onClick={onStart}
          className="inline-flex items-center justify-center gap-2 font-(family-name:--font-display) font-bold text-lg w-[180px] h-[52px] rounded-full cursor-pointer transition-all bg-(--color-accent-amber) text-[#1A1A2E] shadow-[0_4px_15px_rgba(245,194,68,0.3)] hover:scale-105 hover:shadow-[0_0_25px_rgba(245,194,68,0.5)]"
        >
          Predict Now <span aria-hidden="true">→</span>
        </button>
      </div>
    </div>
  );
}

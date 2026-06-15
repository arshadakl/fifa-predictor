import type { Submission } from '@/lib/fields';

interface MetricsGridProps {
  submissions: Submission[];
}

export default function MetricsGrid({ submissions }: Readonly<MetricsGridProps>) {
  const scores = submissions.map((s) => s.Total_Score || 0);
  const highest = scores.length ? Math.max(...scores) : 0;
  const lowest = scores.length ? Math.min(...scores) : 0;

  return (
    <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
      <div className="glass-card flex items-center p-6 gap-5">
        <div className="text-[2.8rem] bg-white/[0.03] w-[70px] h-[70px] rounded-2xl flex justify-center items-center border border-(--color-border-subtle)">
          👥
        </div>
        <div className="flex flex-col">
          <span className="text-[0.9rem] text-(--color-text-secondary) uppercase tracking-[1px]">Total Entries</span>
          <span className="font-(family-name:--font-heading) text-[2.2rem] font-extrabold text-white">
            {submissions.length}
          </span>
        </div>
      </div>

      <div className="glass-card flex items-center p-6 gap-5 border border-(--color-accent-gold)/30 shadow-[0_8px_32px_rgba(255,215,0,0.05)]">
        <div className="text-[2.8rem] bg-white/[0.03] w-[70px] h-[70px] rounded-2xl flex justify-center items-center border border-(--color-border-subtle)">
          🏆
        </div>
        <div className="flex flex-col">
          <span className="text-[0.9rem] text-(--color-text-secondary) uppercase tracking-[1px]">Highest Score</span>
          <span className="font-(family-name:--font-heading) text-[2.2rem] font-extrabold bg-gradient-to-br from-white to-(--color-accent-gold) bg-clip-text text-transparent">
            {highest}
          </span>
        </div>
      </div>

      <div className="glass-card flex items-center p-6 gap-5">
        <div className="text-[2.8rem] bg-white/[0.03] w-[70px] h-[70px] rounded-2xl flex justify-center items-center border border-(--color-border-subtle)">
          ⚽
        </div>
        <div className="flex flex-col">
          <span className="text-[0.9rem] text-(--color-text-secondary) uppercase tracking-[1px]">Lowest Score</span>
          <span className="font-(family-name:--font-heading) text-[2.2rem] font-extrabold text-white">
            {lowest}
          </span>
        </div>
      </div>
    </section>
  );
}

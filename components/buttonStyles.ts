export const btnBase =
  'btn inline-flex items-center justify-center font-(family-name:--font-heading) font-bold text-lg px-8 py-3.5 rounded-xl cursor-pointer transition-all relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed';

export const btnPrimary = `${btnBase} bg-gradient-to-br from-(--color-accent-blue) to-[#005F9E] text-white shadow-[0_4px_15px_rgba(0,191,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,191,255,0.5)]`;

export const btnSecondary = `${btnBase} bg-white/[0.08] border border-white/10 text-white hover:bg-white/[0.15] hover:-translate-y-0.5`;

export const btnGold = `${btnBase} btn-gold-pulse bg-gradient-to-br from-(--color-accent-gold) to-[#C5A000] text-black shadow-[0_4px_15px_rgba(255,215,0,0.3)] hover:scale-105 hover:-translate-y-0.5 hover:shadow-[0_0_25px_rgba(255,215,0,0.6)]`;

const btnBaseSm =
  'btn inline-flex items-center justify-center font-(family-name:--font-heading) font-bold text-sm px-5 py-2 rounded-xl cursor-pointer transition-all relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed';

export const btnPrimarySm = `${btnBaseSm} bg-gradient-to-br from-(--color-accent-blue) to-[#005F9E] text-white shadow-[0_4px_15px_rgba(0,191,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,191,255,0.5)]`;

export const btnSecondarySm = `${btnBaseSm} bg-white/[0.08] border border-white/10 text-white hover:bg-white/[0.15] hover:-translate-y-0.5`;

export const btnGoldSm = `${btnBaseSm} bg-gradient-to-br from-(--color-accent-gold) to-[#C5A000] text-black shadow-[0_4px_15px_rgba(255,215,0,0.3)] hover:scale-105 hover:-translate-y-0.5`;

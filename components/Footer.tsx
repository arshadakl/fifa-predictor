export default function Footer() {
  return (
    <footer className="w-full h-14 bg-black/85 backdrop-blur-[10px] border-t border-white/[0.08] grid grid-cols-3 items-center px-4 sm:px-10 z-10">
      <span className="justify-self-start text-xl" aria-hidden="true">⚽</span>
      <div className="justify-self-center truncate text-[11px] sm:text-[13px] text-(--color-text-secondary)">
        &copy; FIFA World Cup 2026 Predict &amp; Win Contest
      </div>
      <span className="justify-self-end font-(family-name:--font-display) font-bold tracking-wide text-(--color-accent-amber) whitespace-nowrap uppercase">
        FIFA World Cup 26
      </span>
    </footer>
  );
}

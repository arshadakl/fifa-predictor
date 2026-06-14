export default function Footer() {
  return (
    <footer className="w-full h-14 bg-[#0A0C14] border-t border-(--color-neon-green)/30 grid grid-cols-3 items-center px-4 sm:px-10 z-10">
      <span className="justify-self-start font-(family-name:--font-display) font-extrabold tracking-wider text-white uppercase text-sm">
        FWC <span className="text-(--color-neon-green)">26</span>
      </span>
      <div className="justify-self-center truncate text-[11px] text-[#4A5568]">
        &copy; FIFA World Cup 2026 Predict &amp; Win Contest
      </div>
      <span className="justify-self-end font-(family-name:--font-display) font-bold tracking-wide text-(--color-neon-green) whitespace-nowrap uppercase">
        FIFA World Cup 26
      </span>
    </footer>
  );
}

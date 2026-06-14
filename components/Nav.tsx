export default function Nav() {
  return (
    <header className="fixed top-0 inset-x-0 z-20 bg-transparent border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <span className="font-(family-name:--font-display) font-extrabold text-lg sm:text-xl tracking-wider text-white uppercase">
          FIFA World Cup <span className="text-(--color-accent-amber)">26</span>
        </span>
        <nav className="flex items-center gap-5 sm:gap-7 text-sm text-(--color-text-secondary)">
          <a href="#" className="hover:text-white transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Leaderboard</a>
          <a href="#" className="hover:text-white transition-colors">Rules</a>
        </nav>
      </div>
    </header>
  );
}

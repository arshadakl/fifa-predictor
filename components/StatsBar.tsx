import { PeopleIcon, BallIcon, GlobeIcon, CalendarIcon } from './icons';

const ICON_CLASS = 'w-[26px] h-[26px] text-(--color-blue-3) shrink-0';
const VALUE_CLASS = 'font-(family-name:--font-display) font-extrabold leading-none text-white';
const LABEL_CLASS = 'text-[11px] tracking-[0.15em] uppercase text-white/55 mt-0.5';
const BORDER_COLOR = 'border-[#1e50c8]/15';

export default function StatsBar() {
  return (
    <div className="w-full h-[78px] shrink-0 bg-(--color-nav-dark) border-t border-[#1e50c8]/30 grid grid-cols-2 md:grid-cols-4">
      <div className={`flex items-center justify-center gap-3.5 border-r border-b md:border-b-0 ${BORDER_COLOR}`}>
        <PeopleIcon className={ICON_CLASS} />
        <div>
          <div className={`${VALUE_CLASS} text-[28px]`}>48</div>
          <div className={LABEL_CLASS}>Teams</div>
        </div>
      </div>
      <div className={`flex items-center justify-center gap-3.5 border-b md:border-b-0 md:border-r ${BORDER_COLOR}`}>
        <BallIcon className={ICON_CLASS} />
        <div>
          <div className={`${VALUE_CLASS} text-[28px]`}>104</div>
          <div className={LABEL_CLASS}>Matches</div>
        </div>
      </div>
      <div className={`flex items-center justify-center gap-3.5 border-r ${BORDER_COLOR}`}>
        <GlobeIcon className={ICON_CLASS} />
        <div>
          <div className={`${VALUE_CLASS} text-[28px]`}>3</div>
          <div className={LABEL_CLASS}>Host Nations</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3.5">
        <CalendarIcon className={ICON_CLASS} />
        <div>
          <div className={`${VALUE_CLASS} text-(--color-gold-3) text-[20px] sm:text-[28px]`}>Jul &apos;26</div>
          <div className={LABEL_CLASS}>Final Date</div>
        </div>
      </div>
    </div>
  );
}

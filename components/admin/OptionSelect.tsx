import { ChevronDownIcon } from '../icons';

interface OptionSelectProps {
  id: string;
  label: string;
  options: { id: string; name: string }[];
  value: string;
  onChange: (value: string) => void;
}

// Constrained dropdown for the admin "actual results" form. Values are the exact
// option names used by the prediction pickers, so scoring's string comparison
// always lines up - no free-text typos can silently break matching.
export default function OptionSelect({ id, label, options, value, onChange }: Readonly<OptionSelectProps>) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.7rem] font-semibold tracking-[1px] uppercase text-(--color-text-secondary)">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border border-(--color-border-subtle) bg-[rgba(10,10,15,0.5)] px-4 py-3 pr-10 text-[0.95rem] text-white outline-none transition-all cursor-pointer focus:border-(--color-accent-blue) focus:bg-[rgba(10,10,15,0.8)]"
        >
          <option value="" className="bg-(--color-badge-dark) text-white">
            — Not decided —
          </option>
          {options.map((o) => (
            <option key={o.id} value={o.name} className="bg-(--color-badge-dark) text-white">
              {o.name}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-text-secondary)" />
      </div>
    </div>
  );
}

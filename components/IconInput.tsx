import type { ReactNode } from 'react';

export default function IconInput({
  id,
  label,
  icon,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block mb-2 text-[0.7rem] font-semibold tracking-[1.5px] uppercase text-(--color-text-secondary)">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-(--color-text-secondary) pointer-events-none">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-[rgba(10,10,15,0.5)] border border-(--color-border-subtle) rounded-xl outline-none font-(family-name:--font-body) text-[1rem] text-white transition-all placeholder:text-(--color-text-secondary) placeholder:opacity-60 focus:border-(--color-accent-blue) focus:shadow-[0_0_10px_rgba(0,191,255,0.15)] focus:bg-[rgba(10,10,15,0.8)]"
        />
      </div>
      {error && <span className="error-msg show">{error}</span>}
    </div>
  );
}

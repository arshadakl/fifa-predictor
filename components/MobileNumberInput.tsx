import { PhoneIcon } from './icons';

export default function MobileNumberInput({
  id,
  value,
  onChange,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="mb-5">
      <label htmlFor={id} className="block mb-2 text-[0.7rem] font-semibold tracking-[1.5px] uppercase text-(--color-text-secondary)">
        Mobile Number
      </label>
      <div className="flex items-center w-full bg-[rgba(10,10,15,0.5)] border border-(--color-border-subtle) rounded-xl transition-all focus-within:border-(--color-accent-blue) focus-within:shadow-[0_0_10px_rgba(0,191,255,0.15)] focus-within:bg-[rgba(10,10,15,0.8)]">
        <span className="flex items-center gap-2 pl-4 pr-3 py-4 text-(--color-text-secondary) select-none">
          <PhoneIcon className="w-5 h-5" />
          <span className="text-base leading-none">🇮🇳</span>
          <span className="text-white font-(family-name:--font-body) text-[1rem]">+91</span>
        </span>
        <span className="w-px h-6 bg-(--color-border-subtle)" />
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={10}
          placeholder="Enter your mobile number"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
          className="flex-1 w-full px-4 py-4 bg-transparent border-none outline-none font-(family-name:--font-body) text-[1rem] text-white placeholder:text-(--color-text-secondary) placeholder:opacity-60"
        />
      </div>
      {error && <span className="error-msg show">{error}</span>}
    </div>
  );
}

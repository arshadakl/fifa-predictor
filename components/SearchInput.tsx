export default function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent border-0 border-b border-white/15 outline-none text-white text-sm py-2 px-1 placeholder:text-white/35 transition-colors focus:border-(--color-gold-3)"
    />
  );
}

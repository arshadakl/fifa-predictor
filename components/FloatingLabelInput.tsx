interface FloatingLabelInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  pattern?: string;
  error?: string;
  className?: string;
  required?: boolean;
}

export default function FloatingLabelInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  pattern,
  error,
  className = '',
  required = true,
}: Readonly<FloatingLabelInputProps>) {
  return (
    <div className={`input-group mb-6 ${className}`}>
      <input
        id={id}
        type={type}
        placeholder=" "
        required={required}
        pattern={pattern}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <label htmlFor={id}>{label}</label>
      {error && <span className="error-msg show">{error}</span>}
    </div>
  );
}

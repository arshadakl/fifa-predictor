interface WarningModalProps {
  message: string | null;
  onClose: () => void;
}

export default function WarningModal({
  message,
  onClose,
}: Readonly<WarningModalProps>) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[10px] flex items-center justify-center z-100 p-5 animate-fade-in">
      <div className="glass-card max-w-[450px] w-full text-center p-9 px-6 border border-(--color-accent-gold)/25 shadow-[0_25px_50px_rgba(255,215,0,0.05)]">
        <div className="text-5xl mb-4">⚠️</div>
        <h3 className="font-(family-name:--font-heading) font-bold text-2xl mb-3 text-(--color-accent-gold)">
          Duplicate Submission Detected
        </h3>
        <p className="text-(--color-text-secondary) leading-relaxed mb-7">{message}</p>
        <button
          onClick={onClose}
          className="btn w-full inline-flex items-center justify-center font-(family-name:--font-heading) font-bold text-lg px-8 py-3.5 rounded-xl cursor-pointer transition-all relative overflow-hidden bg-gradient-to-br from-(--color-accent-blue) to-[#005F9E] text-white shadow-[0_4px_15px_rgba(0,191,255,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,191,255,0.5)]"
        >
          OK
          <span className="btn-shine" />
        </button>
      </div>
    </div>
  );
}

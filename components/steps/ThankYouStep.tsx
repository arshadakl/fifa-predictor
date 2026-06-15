import { btnSecondary } from '../buttonStyles';

interface ThankYouStepProps {
  submissionId: string;
  onReturnHome: () => void;
}

export default function ThankYouStep({
  submissionId,
  onReturnHome,
}: Readonly<ThankYouStepProps>) {
  return (
    <div className="page-enter">
      <div className="glass-card w-full max-w-[650px] p-10 text-center flex flex-col items-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-18 h-18 rounded-full bg-(--color-accent-blue)/10 border-2 border-(--color-accent-blue) flex justify-center items-center mb-3">
            <svg className="w-10 h-10" viewBox="0 0 52 52" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
            </svg>
          </div>
          <span className="font-(family-name:--font-heading) font-bold text-[0.9rem] text-(--color-accent-blue) uppercase tracking-[1.5px]">
            Prediction Submitted Successfully
          </span>
        </div>

        <h2 className="font-(family-name:--font-heading) font-bold text-2xl mb-2">Thank You for Your Prediction!</h2>

        <div className="bg-white/[0.04] border border-white/[0.05] rounded-xl px-6 py-2 my-3 font-(family-name:--font-heading) text-[1.1rem] font-semibold">
          <p>
            Submission ID: <span className="gold-text">{submissionId}</span>
          </p>
        </div>

        <p className="text-[1.1rem] font-medium mb-4 text-white">
          Your FIFA World Cup 2026 predictions have been successfully submitted.
        </p>
        <p className="text-[0.95rem] leading-relaxed text-(--color-text-secondary) mb-3">
          Thank you for taking part in the Predict &amp; Win Contest. We hope you enjoy every moment of the
          tournament and wish you the very best of luck with your predictions.
        </p>
        <p className="text-[0.95rem] leading-relaxed text-(--color-accent-gold) italic mt-3 mb-8">
          May the beautiful game bring unforgettable moments, incredible goals, and lasting memories throughout
          FIFA World Cup 2026.
        </p>

        <button onClick={onReturnHome} className={btnSecondary}>
          Return to Home
        </button>
      </div>
    </div>
  );
}

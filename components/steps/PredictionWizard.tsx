'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import OptionSelector from '../OptionSelector';

// Lazy + client-only: the lottie runtime and animation JSON only load when a
// submit is actually in flight, never on a normal page load.
const LoadingOverlay = dynamic(() => import('../LoadingOverlay'), { ssr: false });
import PredictionPreview from './PredictionPreview';
import { btnPrimarySm, btnSecondarySm, btnGoldSm } from '../buttonStyles';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';
import type { Predictions, PredictionField } from '@/lib/fields';
import { cn } from '@/lib/utils';
import { checkDuplicate, submitPrediction } from '@/lib/api';

type WizardField = { key: PredictionField; question: string; category: 0 | 1 };

const WIZARD_FIELDS: WizardField[] = [
  { key: 'World_Cup_Winner', question: 'Which team will lift the FIFA World Cup 2026 Trophy?', category: 0 },
  { key: 'Runner_Up', question: 'Which team will finish as Runner-Up?', category: 0 },
  { key: 'Third_Place', question: 'Which team will finish in Third Place?', category: 0 },
  { key: 'Fair_Play_Award', question: 'Which team will win the FIFA Fair Play Award?', category: 0 },
  { key: 'Most_Entertaining_Team', question: 'Which team will be the Most Entertaining?', category: 0 },
  { key: 'Dark_Horse', question: 'Which team will be the Dark Horse?', category: 0 },
  { key: 'Golden_Ball', question: 'Who will win the Golden Ball? (Best Player)', category: 1 },
  { key: 'Golden_Boot', question: 'Who will win the Golden Boot? (Top Scorer)', category: 1 },
  { key: 'Most_Assists', question: 'Who will provide the Most Assists?', category: 1 },
  { key: 'Golden_Glove', question: 'Who will win the Golden Glove? (Best Goalkeeper)', category: 1 },
  { key: 'Best_Young_Player', question: 'Who will win the Best Young Player Award? (≤ 21 years old)', category: 1 },
];

const CATEGORY_NAMES = ['Tournament Predictions', 'Player Awards Predictions'];
const CATEGORY_COUNTS = [6, 5];
const CATEGORY_START = [0, 6];

interface PredictionWizardProps {
  values: Predictions;
  onChange: (field: PredictionField, value: string) => void;
  questionIndex: number;
  onQuestionIndexChange: (index: number) => void;
  restFormData: Record<string, string>;
  onSubmit: (submissionId: string) => void;
  onBack: () => void;
  onWarning: (message: string) => void;
}

export default function PredictionWizard({
  values,
  onChange,
  questionIndex,
  onQuestionIndexChange,
  restFormData,
  onSubmit,
  onBack,
  onWarning,
}: Readonly<PredictionWizardProps>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const isSubmittingRef = useRef(false);

  const field = WIZARD_FIELDS[questionIndex];
  const category = field.category;
  const indexInCategory = questionIndex - CATEGORY_START[category];
  const value = values[field.key];
  const isLast = questionIndex === WIZARD_FIELDS.length - 1;
  const overallProgress = ((questionIndex + 1) / WIZARD_FIELDS.length) * 100;

  function goToCategory(cat: 0 | 1) {
    setShowPreview(false);
    onQuestionIndexChange(CATEGORY_START[cat]);
  }

  function handleBack() {
    if (showPreview) {
      setShowPreview(false);
      return;
    }
    if (questionIndex === 0) {
      onBack();
      return;
    }
    onQuestionIndexChange(questionIndex - 1);
  }

  function handleNext() {
    if (!value.trim()) {
      toast.error('Please select an answer before continuing.');
      return;
    }

    if (!isLast) {
      onQuestionIndexChange(questionIndex + 1);
      return;
    }

    // Category pills let the user jump around, so reaching the last question
    // does not guarantee every earlier answer is filled. Block the preview and
    // jump to the first blank one instead of submitting an incomplete entry.
    const missing = WIZARD_FIELDS.findIndex((f) => !values[f.key].trim());
    if (missing !== -1) {
      toast.error('Please answer all questions before submitting.');
      onQuestionIndexChange(missing);
      return;
    }

    setShowPreview(true);
  }

  async function handleSubmit() {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const dup = await checkDuplicate({
        Mobile_Number: restFormData.Mobile_Number,
        Email_Address: restFormData.Email_Address,
      });

      if (dup.status === 409) {
        onWarning(
          dup.result.message ||
            'You have already submitted a prediction. Only one entry per participant is permitted.'
        );
        return;
      }
      if (!dup.ok) {
        onWarning('Unable to verify your details right now. Please try again in a moment.');
        return;
      }

      const { status, result } = await submitPrediction({ ...restFormData, ...values });

      if (status === 201 && result.success) {
        onSubmit(result.Submission_ID);
      } else if (status === 409) {
        onWarning(
          result.message ||
            'You have already submitted a prediction. Only one entry per participant is permitted.'
        );
      } else {
        onWarning(result.message || 'Something went wrong while submitting your prediction. Please try again.');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      onWarning('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      {isSubmitting && <LoadingOverlay />}
      <div className="glass-card w-full max-w-[700px] py-8 px-3 sm:p-10">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            {CATEGORY_NAMES.map((name, i) => (
              <button
                key={name}
                type="button"
                onClick={() => goToCategory(i as 0 | 1)}
                className={cn('category-pill', category === i && 'active')}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleBack} disabled={isSubmitting} className={btnSecondarySm}>
              Back
            </button>
            {!showPreview && (
              <button onClick={handleNext} className={isLast ? btnGoldSm : btnPrimarySm}>
                {isLast ? 'Confirm and Submit' : 'Next'}
              </button>
            )}
          </div>
        </div>

        {showPreview ? (
          <PredictionPreview values={values} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        ) : (
          <>
            <p className="text-(--color-text-secondary) text-[0.85rem] mb-2">
              Question {indexInCategory + 1} of {CATEGORY_COUNTS[category]}
            </p>
            <div className="relative w-full h-1 bg-white/5 rounded-full mb-8">
              <div className="h-full rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-(--color-accent-blue) to-(--color-accent-gold) transition-[width] duration-400"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>
              <Image
                src="/images/football.png"
                alt=""
                width={20}
                height={20}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 transition-[left] duration-400"
                style={{ left: `${overallProgress}%` }}
              />
            </div>

            <h2 className="font-(family-name:--font-heading) font-bold text-2xl sm:text-3xl md:text-[2.2rem] leading-snug mb-6 text-white">
              {field.question}
            </h2>

            <OptionSelector
              key={field.key}
              options={category === 0 ? TEAM_OPTIONS : PLAYER_OPTIONS}
              kind={category === 0 ? 'team' : 'player'}
              value={value}
              onChange={(name) => onChange(field.key, name)}
            />
          </>
        )}
      </div>
    </div>
  );
}

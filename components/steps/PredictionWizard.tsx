'use client';

import { useRef, useState } from 'react';
import Spinner from '../Spinner';
import OptionSelector from '../OptionSelector';
import { btnPrimary, btnSecondary, btnGold } from '../buttonStyles';
import { TEAM_OPTIONS, PLAYER_OPTIONS } from '@/lib/predictionOptions';
import type { Predictions, PredictionField } from '@/lib/fields';

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

export default function PredictionWizard({
  values,
  onChange,
  questionIndex,
  onQuestionIndexChange,
  restFormData,
  onSubmit,
  onBack,
  onWarning,
}: {
  values: Predictions;
  onChange: (field: PredictionField, value: string) => void;
  questionIndex: number;
  onQuestionIndexChange: (index: number) => void;
  restFormData: Record<string, string>;
  onSubmit: (submissionId: string) => void;
  onBack: () => void;
  onWarning: (message: string) => void;
}) {
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const field = WIZARD_FIELDS[questionIndex];
  const category = field.category;
  const indexInCategory = questionIndex - CATEGORY_START[category];
  const value = values[field.key];
  const isLast = questionIndex === WIZARD_FIELDS.length - 1;
  const overallProgress = ((questionIndex + 1) / WIZARD_FIELDS.length) * 100;

  function goToCategory(cat: 0 | 1) {
    setError(false);
    onQuestionIndexChange(CATEGORY_START[cat]);
  }

  function handleBack() {
    setError(false);
    if (questionIndex === 0) {
      onBack();
      return;
    }
    onQuestionIndexChange(questionIndex - 1);
  }

  async function handleNext() {
    if (!value.trim()) {
      setError(true);
      return;
    }
    setError(false);

    if (!isLast) {
      onQuestionIndexChange(questionIndex + 1);
      return;
    }

    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    try {
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...restFormData, ...values }),
      });

      const result = await response.json();

      if (response.status === 201 && result.success) {
        onSubmit(result.Submission_ID);
      } else if (response.status === 409) {
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
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="page-enter">
      <div className="glass-card w-full max-w-[700px] p-8 sm:p-10">
        <div className="flex gap-3 mb-6 flex-wrap">
          {CATEGORY_NAMES.map((name, i) => (
            <button
              key={name}
              type="button"
              onClick={() => goToCategory(i as 0 | 1)}
              className={`category-pill ${category === i ? 'active' : ''}`}
            >
              {i + 1}. {name}
            </button>
          ))}
        </div>

        <p className="text-(--color-text-secondary) text-[0.85rem] mb-2">
          Question {indexInCategory + 1} of {CATEGORY_COUNTS[category]}
        </p>
        <div className="w-full h-1 bg-white/5 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-(--color-accent-blue) to-(--color-accent-gold) transition-[width] duration-400"
            style={{ width: `${overallProgress}%` }}
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

        {error && (
          <span className="error-msg-summary show block w-full bg-red-500/10 border border-red-500/25 text-red-300 px-4 py-3 rounded-[10px] text-[0.9rem] mt-4 text-center">
            Please select an answer before continuing.
          </span>
        )}

        <div className="flex justify-between w-full mt-10 gap-4">
          <button onClick={handleBack} disabled={submitting} className={`${btnSecondary} flex-1`}>
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={submitting}
            className={`${isLast ? btnGold : btnPrimary} flex-1`}
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <Spinner /> Submitting...
              </span>
            ) : isLast ? (
              <>
                Submit Prediction
                <span className="btn-shine" />
              </>
            ) : (
              'Next'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

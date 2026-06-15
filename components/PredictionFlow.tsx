'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BackgroundLayers from './BackgroundLayers';
import Nav from './Nav';
import Floodlights from './Floodlights';
import Footer from './Footer';
import WarningModal from './WarningModal';
import RegistrationStep, { type RegistrationValues } from './steps/RegistrationStep';
import PredictionWizard from './steps/PredictionWizard';
import ThankYouStep from './steps/ThankYouStep';
import { PREDICTION_FIELDS, type Predictions } from '@/lib/fields';

type FormData = RegistrationValues & Predictions;

const EMPTY_FORM_DATA: FormData = {
  Full_Name: '',
  Mobile_Number: '',
  Email_Address: '',
  World_Cup_Winner: '',
  Runner_Up: '',
  Third_Place: '',
  Fair_Play_Award: '',
  Most_Entertaining_Team: '',
  Dark_Horse: '',
  Golden_Ball: '',
  Golden_Boot: '',
  Most_Assists: '',
  Golden_Glove: '',
  Best_Young_Player: '',
};

const STORAGE_KEY = 'fwc26_contest_progress';

type StoredProgress = {
  currentStep: number;
  formData: FormData;
  questionIndex: number;
};

const INITIAL_PROGRESS: StoredProgress = { currentStep: 1, formData: EMPTY_FORM_DATA, questionIndex: 0 };

const MAX_QUESTION_INDEX = PREDICTION_FIELDS.length - 1;

function loadStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_PROGRESS;
    const parsed = JSON.parse(stored);
    const currentStep = typeof parsed.currentStep === 'number' ? parsed.currentStep : 1;

    // Step 3 (thank-you) is never persisted by current code, but older
    // sessions could still have it stored - treat as a completed,
    // non-resumable run rather than rendering a blank wizard.
    if (currentStep >= 3) return INITIAL_PROGRESS;

    const questionIndex = typeof parsed.questionIndex === 'number' ? parsed.questionIndex : 0;

    return {
      currentStep: Math.min(Math.max(currentStep, 1), 2),
      formData: { ...EMPTY_FORM_DATA, ...parsed.formData },
      questionIndex: Math.min(Math.max(questionIndex, 0), MAX_QUESTION_INDEX),
    };
  } catch (err) {
    console.error(err);
    return INITIAL_PROGRESS;
  }
}

function backgroundImageIndex(step: number, questionIndex: number): number {
  if (step === 1) return 1;
  if (step === 2) return questionIndex < 6 ? 2 : 3;
  return 4;
}

export default function PredictionFlow() {
  const router = useRouter();
  const [progress, setProgress] = useState<StoredProgress>(loadStoredProgress);
  const [submissionId, setSubmissionId] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  const { currentStep, formData, questionIndex } = progress;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      console.error(err);
    }
  }, [progress]);

  function resetProgress() {
    setProgress(INITIAL_PROGRESS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <BackgroundLayers activeImage={isSubmitted ? 4 : backgroundImageIndex(currentStep, questionIndex)} />
      <Nav />
      <Floodlights />

      <main className="flex-1 flex justify-center items-center w-full max-w-[1100px] mx-auto px-5 pt-24 pb-20">
        {!isSubmitted && currentStep === 1 && (
          <RegistrationStep
            initialValues={{
              Full_Name: formData.Full_Name,
              Mobile_Number: formData.Mobile_Number,
              Email_Address: formData.Email_Address,
            }}
            onNext={(values) =>
              setProgress((p) => ({
                ...p,
                formData: { ...p.formData, ...values },
                currentStep: 2,
                questionIndex: 0,
              }))
            }
            onWarning={setWarning}
          />
        )}

        {!isSubmitted && currentStep === 2 && (
          <PredictionWizard
            values={formData}
            onChange={(field, value) =>
              setProgress((p) => ({ ...p, formData: { ...p.formData, [field]: value } }))
            }
            questionIndex={questionIndex}
            onQuestionIndexChange={(index) => setProgress((p) => ({ ...p, questionIndex: index }))}
            restFormData={{
              Full_Name: formData.Full_Name,
              Mobile_Number: formData.Mobile_Number,
              Email_Address: formData.Email_Address,
            }}
            onSubmit={(newSubmissionId) => {
              setSubmissionId(newSubmissionId);
              setIsSubmitted(true);
              resetProgress();
            }}
            onBack={() => setProgress((p) => ({ ...p, currentStep: 1 }))}
            onWarning={setWarning}
          />
        )}

        {isSubmitted && (
          <ThankYouStep
            submissionId={submissionId}
            onReturnHome={() => router.push('/')}
          />
        )}
      </main>

      <WarningModal message={warning} onClose={() => setWarning(null)} />

      <Footer />
    </>
  );
}

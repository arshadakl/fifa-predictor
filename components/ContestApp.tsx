'use client';

import { useEffect, useState } from 'react';
import BackgroundLayers from './BackgroundLayers';
import Nav from './Nav';
import Floodlights from './Floodlights';
import EffectsCanvas, { type EffectType } from './EffectsCanvas';
import Footer from './Footer';
import WarningModal from './WarningModal';
import WelcomeStep from './steps/WelcomeStep';
import RegistrationStep, { type RegistrationValues } from './steps/RegistrationStep';
import PredictionWizard from './steps/PredictionWizard';
import ThankYouStep from './steps/ThankYouStep';
import type { Predictions } from '@/lib/fields';

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

function loadStoredProgress(): StoredProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return INITIAL_PROGRESS;
    const parsed = JSON.parse(stored);
    const currentStep = typeof parsed.currentStep === 'number' ? parsed.currentStep : 1;
    return {
      currentStep: Math.min(Math.max(currentStep, 1), 3),
      formData: { ...EMPTY_FORM_DATA, ...parsed.formData },
      questionIndex: typeof parsed.questionIndex === 'number' ? parsed.questionIndex : 0,
    };
  } catch (err) {
    console.error(err);
    return INITIAL_PROGRESS;
  }
}

function effectForStep(step: number): EffectType {
  if (step === 1) return 'confetti';
  if (step === 4) return 'fireworks';
  return 'none';
}

function backgroundImageIndex(step: number, questionIndex: number): number {
  if (step === 1) return 0;
  if (step === 2) return 1;
  if (step === 3) return questionIndex < 6 ? 2 : 3;
  return 4;
}

export default function ContestApp() {
  const [progress, setProgress] = useState<StoredProgress>(loadStoredProgress);
  const [submissionId, setSubmissionId] = useState('');
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
      <BackgroundLayers activeImage={backgroundImageIndex(currentStep, questionIndex)} />
      <Nav />
      <Floodlights />
      <EffectsCanvas effectType={effectForStep(currentStep)} />

      <main className="flex-1 flex justify-center items-center w-full max-w-[1100px] mx-auto px-5 pt-24 pb-20">
        {currentStep === 1 && (
          <WelcomeStep onStart={() => setProgress((p) => ({ ...p, currentStep: 2 }))} />
        )}

        {currentStep === 2 && (
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
                currentStep: 3,
                questionIndex: 0,
              }))
            }
            onWarning={setWarning}
          />
        )}

        {currentStep === 3 && (
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
              setProgress((p) => ({ ...p, currentStep: 4 }));
              try {
                localStorage.removeItem(STORAGE_KEY);
              } catch (err) {
                console.error(err);
              }
            }}
            onBack={() => setProgress((p) => ({ ...p, currentStep: 2 }))}
            onWarning={setWarning}
          />
        )}

        {currentStep === 4 && (
          <ThankYouStep
            submissionId={submissionId}
            onReturnHome={() => {
              setSubmissionId('');
              resetProgress();
            }}
          />
        )}
      </main>

      <WarningModal message={warning} onClose={() => setWarning(null)} />

      <Footer />
    </>
  );
}

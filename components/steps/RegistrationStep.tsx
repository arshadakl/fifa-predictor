'use client';

import { useState } from 'react';
import IconInput from '../IconInput';
import MobileNumberInput from '../MobileNumberInput';
import Spinner from '../Spinner';
import { UserIcon, MailIcon, ArrowRightIcon } from '../icons';
import { btnPrimary } from '../buttonStyles';
import Image from 'next/image';
import { checkDuplicate } from '@/lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIA_MOBILE_REGEX = /^[6-9]\d{9}$/;

export type RegistrationValues = {
  Full_Name: string;
  Mobile_Number: string;
  Email_Address: string;
};

interface RegistrationStepProps {
  initialValues: RegistrationValues;
  onNext: (values: RegistrationValues) => void;
  onWarning: (message: string) => void;
}

export default function RegistrationStep({
  initialValues,
  onNext,
  onWarning,
}: Readonly<RegistrationStepProps>) {
  const [fullName, setFullName] = useState(initialValues.Full_Name);
  const [mobile, setMobile] = useState(initialValues.Mobile_Number.replace(/^\+91/, ''));
  const [email, setEmail] = useState(initialValues.Email_Address);
  const [errors, setErrors] = useState({ name: false, mobile: false, email: false });
  const [submitting, setSubmitting] = useState(false);

  async function handleNext() {
    const nameValid = Boolean(fullName.trim());
    const mobileValid = INDIA_MOBILE_REGEX.test(mobile.trim());
    const emailValid = Boolean(email.trim()) && EMAIL_REGEX.test(email.trim());

    setErrors({ name: !nameValid, mobile: !mobileValid, email: !emailValid });
    if (!nameValid || !mobileValid || !emailValid) return;

    const fullMobile = '+91' + mobile.trim();

    setSubmitting(true);
    try {
      const { status, ok, result } = await checkDuplicate({ Mobile_Number: fullMobile, Email_Address: email.trim() });

      if (status === 409) {
        onWarning(
          result.message ||
            'You have already submitted a prediction. Only one entry per participant is permitted.'
        );
        return;
      }
      if (!ok) {
        onWarning('Unable to verify your details right now. Please try again in a moment.');
        return;
      }
    } catch (err) {
      console.error('Duplicate check failed:', err);
      onWarning('Unable to connect to the server. Please check your connection and try again.');
      return;
    } finally {
      setSubmitting(false);
    }

    onNext({ Full_Name: fullName.trim(), Mobile_Number: fullMobile, Email_Address: email.trim() });
  }

  return (
    <div className="page-enter">
      <div className="glass-card w-full max-w-[550px] md:px-10 px-4 py-5">
        <div className=" mx-auto mb-5 rounded-full flex items-center justify-center ">
          <Image  src="/logo/fifa-world-cup-logo.png" alt="Registration Icon" width={94} height={94} />
        </div>

        <div className="text-center mb-6">
          <h2 className="font-(family-name:--font-heading) font-bold text-[1.8rem] mb-1.5 text-white">
            Participant Registration
          </h2>
          <p className="text-(--color-text-secondary) text-[0.95rem]">
            Let&apos;s verify your identity before making predictions
          </p>
        </div>

        <div className="border-t border-(--color-border-subtle) mb-6" />

        <form onSubmit={(e) => e.preventDefault()}>
          <IconInput
            id="full-name"
            label="Full Name"
            icon={<UserIcon className="w-5 h-5" />}
            placeholder="Enter your full name"
            value={fullName}
            onChange={setFullName}
            error={errors.name ? 'Name is required' : undefined}
          />
          <MobileNumberInput
            id="mobile-number"
            value={mobile}
            onChange={setMobile}
            error={errors.mobile ? 'Enter a valid 10-digit Indian mobile number' : undefined}
          />
          <IconInput
            id="email-address"
            label="Email Address"
            icon={<MailIcon className="w-5 h-5" />}
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={setEmail}
            error={errors.email ? 'Valid email address is required' : undefined}
          />
        </form>

        <button onClick={handleNext} disabled={submitting} className={`${btnPrimary} w-full mt-2`}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Checking...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              Continue <ArrowRightIcon className="w-5 h-5" />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Floodlights from '@/components/Floodlights';
import IconInput from '@/components/IconInput';
import Spinner from '@/components/Spinner';
import { UserIcon, LockIcon, ArrowRightIcon } from '@/components/icons';
import { btnPrimary } from '@/components/buttonStyles';

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!username.trim() || !password) {
      setError('Enter both username and password.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (res.ok) {
        // Use a full navigation so the freshly set cookie is sent with the
        // request for the protected page.
        window.location.assign(next.startsWith('/admin') ? next : '/admin');
        return;
      }

      const data = await res.json().catch(() => null);
      setError(data?.message || 'Login failed. Please try again.');
    } catch {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="glass-card w-full max-w-[420px] px-6 py-8 sm:px-9">
      <div className="mx-auto mb-4 flex items-center justify-center">
        <Image src="/logo/fifa-world-cup-logo.png" alt="" width={80} height={80} />
      </div>

      <div className="text-center mb-6">
        <h1 className="font-(family-name:--font-heading) font-bold text-[1.6rem] text-white">Admin Sign In</h1>
        <p className="text-(--color-text-secondary) text-[0.9rem] mt-1">Restricted area &mdash; authorised staff only</p>
      </div>

      <div className="border-t border-(--color-border-subtle) mb-6" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <IconInput
          id="admin-username"
          label="Username"
          icon={<UserIcon className="w-5 h-5" />}
          placeholder="Enter username"
          value={username}
          onChange={(v) => {
            setUsername(v);
            setError('');
          }}
        />
        <IconInput
          id="admin-password"
          label="Password"
          icon={<LockIcon className="w-5 h-5" />}
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(v) => {
            setPassword(v);
            setError('');
          }}
        />

        {error && <p className="text-red-400 text-sm mb-3 -mt-2">{error}</p>}

        <button type="submit" disabled={submitting} className={`${btnPrimary} w-full mt-1`}>
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> Signing in...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2">
              Sign In <ArrowRightIcon className="w-5 h-5" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="admin-body flex flex-1 items-center justify-center px-5 py-16">
      <Floodlights />
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/app/context/AuthContext';

export default function SignupPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setLoading(true);

    const { error: signUpError } = await signUp(email, password);
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    router.push('/login?message=Check your email for confirmation');
  };

  return (
    <main className="section-wrap py-12">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="premium-card relative overflow-hidden px-6 py-12 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,17,0.95),rgba(35,32,29,0.86),rgba(185,106,60,0.18))]" />
          <div className="relative z-10 max-w-xl text-white">
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-sand)]">Create an account</p>
            <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">Unlock faster checkout and exclusive drops.</h1>
            <p className="mt-6 text-base leading-8 text-white/74">
              Join the LOKUS member list to save your details and stay close to the newest arrivals.
            </p>
          </div>
        </div>
        <div className="premium-card p-6 md:p-8">
          <h2 className="font-display text-5xl">Create account</h2>
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Confirm password</span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-2xl border border-[var(--color-border)] bg-white/80 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
          <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
            Already a member?{' '}
            <Link href="/login" className="text-[var(--color-foreground)] underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

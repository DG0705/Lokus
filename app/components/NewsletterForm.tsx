'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setStatus('loading');

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Newsletter signup:', email);
      setStatus('success');
      setEmail('');
      window.setTimeout(() => setStatus('idle'), 3000);
    } catch {
      setStatus('error');
      window.setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="min-w-0 flex-1 rounded-full border border-[var(--color-border)] bg-white/80 px-5 py-3 text-sm outline-none transition focus:border-[var(--color-ember)]"
          required
          disabled={status === 'loading'}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[var(--color-graphite)] disabled:opacity-50"
        >
          {status === 'loading' ? 'Joining...' : 'Join list'}
        </button>
      </form>
      {status === 'success' ? (
        <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--color-ember)]">
          You are on the list.
        </p>
      ) : null}
    </div>
  );
}

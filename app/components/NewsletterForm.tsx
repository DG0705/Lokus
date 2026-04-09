'use client';

import { useState } from 'react';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to join the list right now.');
      }
      setStatus('success');
      setMessage('You are on the LOKUS list.');
      setEmail('');
      window.setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Unable to join the list right now.');
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
      {message ? (
        <p className={`mt-3 text-xs uppercase tracking-[0.2em] ${status === 'error' ? 'text-red-600' : 'text-[var(--color-ember)]'}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}

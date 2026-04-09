'use client';

import { useState } from 'react';

type FormState = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

const initialState: FormState = {
  name: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
};

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const updateField = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }

      setFormState(initialState);
      setStatus('success');
    } catch (submissionError) {
      setStatus('error');
      setError(submissionError instanceof Error ? submissionError.message : 'Failed to send message.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[2rem] border border-[var(--color-border)] bg-white p-6 shadow-[var(--shadow)]">
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ['name', 'Name', 'text'],
          ['email', 'Email', 'email'],
          ['phone', 'Phone', 'tel'],
          ['subject', 'Subject', 'text'],
        ].map(([field, label, type]) => (
          <label key={field} className="text-sm">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
              {label}
            </span>
            <input
              type={type}
              required
              value={formState[field as keyof FormState]}
              onChange={(event) => updateField(field as keyof FormState, event.target.value)}
              className="w-full rounded-[1.25rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
            />
          </label>
        ))}
      </div>
      <label className="block text-sm">
        <span className="mb-2 block text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
          Message
        </span>
        <textarea
          required
          rows={6}
          value={formState.message}
          onChange={(event) => updateField('message', event.target.value)}
          className="w-full rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-3 outline-none transition focus:border-[var(--color-ember)]"
        />
      </label>

      {status === 'error' ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      {status === 'success' ? (
        <p className="text-sm text-[var(--color-ember)]">Your message is on its way to the LOKUS desk.</p>
      ) : null}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-full bg-[var(--color-foreground)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
      >
        {status === 'loading' ? 'Sending...' : 'Send to LOKUS'}
      </button>
    </form>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import type { UpcomingDrop } from '@/app/lib/types';

type DropCountdownProps = {
  drop: UpcomingDrop;
  compact?: boolean;
};

function getTimeParts(targetDate: string) {
  const diff = new Date(targetDate).getTime() - Date.now();
  const safe = Math.max(diff, 0);

  const days = Math.floor(safe / (1000 * 60 * 60 * 24));
  const hours = Math.floor((safe / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((safe / (1000 * 60)) % 60);
  const seconds = Math.floor((safe / 1000) % 60);

  return { days, hours, minutes, seconds, finished: diff <= 0 };
}

export function DropCountdown({ drop, compact = false }: DropCountdownProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(drop.releaseAt));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(getTimeParts(drop.releaseAt));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [drop.releaseAt]);

  const releaseLabel = useMemo(
    () =>
      new Date(drop.releaseAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [drop.releaseAt]
  );

  return (
    <div className={`relative overflow-hidden rounded-[2rem] border border-[var(--color-border)] ${compact ? 'bg-[var(--color-foreground)] text-white' : 'bg-white text-[var(--color-foreground)]'} p-6 shadow-[var(--shadow)]`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={`text-[11px] uppercase tracking-[0.3em] ${compact ? 'text-white/55' : 'text-[var(--color-muted-foreground)]'}`}>
            Next drop
          </p>
          <h3 className="mt-3 font-display text-4xl leading-none">
            {drop.brand} {drop.model}
          </h3>
          <p className={`mt-3 text-sm ${compact ? 'text-white/72' : 'text-[var(--color-muted-foreground)]'}`}>
            {drop.colorway} • {releaseLabel}
          </p>
        </div>
        <Link
          href={drop.href}
          className={`rounded-full border px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] ${compact ? 'border-white/20 text-white' : 'border-[var(--color-border)] text-[var(--color-foreground)]'}`}
        >
          Preview
        </Link>
      </div>
      <div className="mt-6 grid grid-cols-4 gap-3">
        {[
          ['Days', timeLeft.days],
          ['Hours', timeLeft.hours],
          ['Min', timeLeft.minutes],
          ['Sec', timeLeft.seconds],
        ].map(([label, value]) => (
          <div
            key={label}
            className={`rounded-[1.25rem] border px-3 py-4 text-center ${compact ? 'border-white/10 bg-white/8' : 'border-[var(--color-border)] bg-[var(--color-mist)]/55'}`}
          >
            <div className="font-display text-3xl leading-none">{String(value).padStart(2, '0')}</div>
            <div className={`mt-2 text-[10px] uppercase tracking-[0.22em] ${compact ? 'text-white/55' : 'text-[var(--color-muted-foreground)]'}`}>
              {label}
            </div>
          </div>
        ))}
      </div>
      <p className={`mt-5 text-sm leading-7 ${compact ? 'text-white/72' : 'text-[var(--color-muted-foreground)]'}`}>
        {timeLeft.finished ? 'This drop is live now.' : drop.tagline}
      </p>
    </div>
  );
}

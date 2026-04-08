import Link from 'next/link';

export default function ErrorPage() {
  return (
    <main className="section-wrap py-20">
      <div className="premium-card mx-auto max-w-3xl px-8 py-14 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Authentication</p>
        <h1 className="mt-4 font-display text-6xl">We could not complete that sign-in step.</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
          Please try signing in again or request a fresh confirmation link.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
        >
          Return to login
        </Link>
      </div>
    </main>
  );
}

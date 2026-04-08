import Link from 'next/link';

import { Reveal } from '@/app/components/storefront/Reveal';

export default function ContactPage() {
  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <Reveal className="premium-card px-6 py-12 md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Contact</p>
          <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">Need help before or after your order?</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--color-muted-foreground)]">
            Reach the LOKUS support desk for sizing help, order status questions, exchange requests, or product guidance.
          </p>
          <div className="mt-8 space-y-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            <p>Email: support@lokus.store</p>
            <p>Phone: +91 98765 43210</p>
            <p>Hours: Monday to Saturday, 10 AM to 7 PM IST</p>
          </div>
        </Reveal>
        <Reveal delay={0.08} className="premium-card p-6 md:p-8">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Quick links</p>
          <div className="mt-6 grid gap-4">
            {[
              ['/size-guide', 'Open size guide'],
              ['/returns', 'Read returns policy'],
              ['/account', 'Track your orders'],
            ].map(([href, label]) => (
              <Link key={href} href={href} className="rounded-[1.25rem] border border-[var(--color-border)] bg-white/70 px-4 py-4 text-sm">
                {label}
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </main>
  );
}

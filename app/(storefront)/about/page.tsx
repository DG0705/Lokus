import Link from 'next/link';

import { Reveal } from '@/app/components/storefront/Reveal';

export default function AboutPage() {
  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <Reveal className="premium-card px-6 py-12 md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">About LOKUS</p>
          <h1 className="mt-5 max-w-4xl font-display text-6xl leading-none md:text-7xl">
            A premium shoe destination built to feel like a brand, not just a store.
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted-foreground)]">
            LOKUS is a multi-brand retail concept with a sharp editorial lens. We bring the best of performance, luxury streetwear, and timeless sneaker design into one polished shopping environment.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap mt-12 grid gap-6 lg:grid-cols-3">
        {[
          ['Curated identity', 'We do not overwhelm the catalog. The store is filtered through mood, quality, and wearable appeal.'],
          ['India-first convenience', 'Rupee pricing, trusted checkout, and support language that matches local expectations.'],
          ['Premium storytelling', 'Every surface is designed to feel intentional, from typography to product presentation.'],
        ].map(([title, description], index) => (
          <Reveal key={title} delay={index * 0.05} className="premium-card p-6">
            <h2 className="font-display text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
          </Reveal>
        ))}
      </section>
      <section className="section-wrap mt-12">
        <Reveal className="premium-card flex flex-col items-start gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Start exploring</p>
            <h2 className="mt-3 font-display text-4xl">Ready to step into the catalog?</h2>
          </div>
          <Link href="/shop" className="rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white">
            Open the shop
          </Link>
        </Reveal>
      </section>
    </main>
  );
}

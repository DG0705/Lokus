import { Reveal } from '@/app/components/storefront/Reveal';

export default function ReturnsPage() {
  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <Reveal className="premium-card px-6 py-12 md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Returns policy</p>
          <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">Simple returns with clear conditions.</h1>
        </Reveal>
      </section>
      <section className="section-wrap mt-12 grid gap-6 lg:grid-cols-3">
        {[
          ['Return window', 'Request a return within 7 days of delivery for eligible unworn pairs.'],
          ['Condition', 'Shoes must be unused, in original packaging, and returned with all tags and accessories.'],
          ['Refund timing', 'Refunds begin after the quality check passes and usually reflect within 5 to 7 business days.'],
        ].map(([title, description], index) => (
          <Reveal key={title} delay={index * 0.05} className="premium-card p-6">
            <h2 className="font-display text-4xl">{title}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{description}</p>
          </Reveal>
        ))}
      </section>
    </main>
  );
}

import { Reveal } from '@/app/components/storefront/Reveal';

export default function SizeGuidePage() {
  const sizes = [
    ['UK 6', 'EU 40', 'Heel-to-toe: 24.5 cm'],
    ['UK 7', 'EU 41', 'Heel-to-toe: 25.4 cm'],
    ['UK 8', 'EU 42', 'Heel-to-toe: 26.2 cm'],
    ['UK 9', 'EU 43', 'Heel-to-toe: 27.1 cm'],
    ['UK 10', 'EU 44', 'Heel-to-toe: 27.9 cm'],
    ['UK 11', 'EU 45', 'Heel-to-toe: 28.8 cm'],
  ];

  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <Reveal className="premium-card px-6 py-12 md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Size guide</p>
          <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">Find your best fit before checkout.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted-foreground)]">
            Use this guide as a starting point. If a product fits larger or smaller than usual, we call that out on the product page when the brand provides it.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap mt-12">
        <div className="premium-card overflow-hidden">
          {sizes.map(([uk, eu, note]) => (
            <div key={uk} className="grid gap-2 border-b border-[var(--color-border)] px-6 py-5 text-sm last:border-b-0 md:grid-cols-[10rem_10rem_minmax(0,1fr)]">
              <span className="font-semibold">{uk}</span>
              <span>{eu}</span>
              <span className="text-[var(--color-muted-foreground)]">{note}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

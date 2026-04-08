import Link from 'next/link';

import { Reveal } from '@/app/components/storefront/Reveal';
import { featuredBrandNames } from '@/app/lib/constants';

export default function BrandsPage() {
  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <Reveal className="premium-card px-6 py-12 md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-muted-foreground)]">Brands at LOKUS</p>
          <h1 className="mt-5 font-display text-6xl leading-none md:text-7xl">Global labels. One premium point of view.</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--color-muted-foreground)]">
            Discover brand collections through one design-led lens. Shop by label when you know exactly what energy you want.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {featuredBrandNames.map((brand, index) => (
          <Reveal key={brand} delay={Math.min(index * 0.04, 0.16)} className="premium-card p-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Featured label</p>
            <h2 className="mt-4 font-display text-5xl">{brand}</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
              Browse the current edit and see how {brand} fits into the LOKUS mix of performance, fashion, and daily wear.
            </p>
            <Link href={`/shop?brand=${encodeURIComponent(brand)}`} className="mt-8 inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
              Shop {brand}
            </Link>
          </Reveal>
        ))}
      </section>
    </main>
  );
}

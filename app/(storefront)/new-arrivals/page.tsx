import Link from 'next/link';

import { DropCountdown } from '@/app/components/storefront/DropCountdown';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { upcomingDrops } from '@/app/lib/drops';
import { getProducts } from '@/app/lib/catalog';

export default async function NewArrivalsPage() {
  const previewPairs = await getProducts({ sort: 'newest' }).then((items) => items.slice(0, 3));
  const leadDrop = upcomingDrops[0];

  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <div className="lokus-panel bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(184,106,57,0.14))] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(18rem,26rem)]">
            <div className="hidden lg:flex lg:justify-center">
              <span className="lokus-rail text-[10px] text-white/34">Drop Clock</span>
            </div>
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Upcoming arrivals</p>
              <h1 className="mt-5 font-display text-6xl leading-[0.9] md:text-7xl">The next LOKUS release window.</h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72">
                Instead of a generic new arrivals list, LOKUS now highlights upcoming shoes with a live countdown, a release calendar, and a sharper launch ritual.
              </p>
            </Reveal>
            <Reveal delay={0.08}>
              <DropCountdown drop={leadDrop} compact />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-wrap mt-12 grid gap-6 lg:grid-cols-3">
        {upcomingDrops.map((drop, index) => (
          <Reveal key={drop.id} delay={Math.min(index * 0.05, 0.14)} className="lokus-panel bg-white px-6 py-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">{drop.brand}</p>
            <h2 className="mt-4 font-display text-4xl">{drop.model}</h2>
            <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">{drop.colorway}</p>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{drop.tagline}</p>
            <p className="mt-5 text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
              {new Date(drop.releaseAt).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </Reveal>
        ))}
      </section>

      <section className="section-wrap mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Preview before launch</p>
            <h2 className="mt-3 font-display text-5xl">Pairs already in orbit</h2>
          </div>
          <Link href="/shop" className="text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
            Open gallery
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {previewPairs.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index * 0.05, 0.14)}>
              <ProductCard product={product} priority={index === 0} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

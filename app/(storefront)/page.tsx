import Image from 'next/image';
import Link from 'next/link';

import NewsletterForm from '@/app/components/NewsletterForm';
import { DropCountdown } from '@/app/components/storefront/DropCountdown';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { collectionHighlights, featuredBrandNames } from '@/app/lib/constants';
import { upcomingDrops } from '@/app/lib/drops';
import { getFeaturedProducts, getProducts } from '@/app/lib/catalog';

export default async function HomePage() {
  const [featuredProducts, newPairs] = await Promise.all([
    getFeaturedProducts(4),
    getProducts({ sort: 'newest' }).then((items) => items.slice(0, 3)),
  ]);

  const leadDrop = upcomingDrops[0];

  return (
    <main className="pb-24">
      <section className="section-wrap pt-6">
        <div className="lokus-panel bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(184,106,57,0.16))] px-6 py-8 text-white md:px-10 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[4.2rem_minmax(0,1.05fr)_minmax(20rem,28rem)]">
            <div className="hidden lg:flex lg:justify-center">
              <span className="lokus-rail text-[10px] text-white/34">Lokus Edition 01</span>
            </div>

            <Reveal className="relative">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[var(--color-sand)]">India-first luxury sneaker house</p>
              <h1 className="mt-6 max-w-4xl font-display text-[4.2rem] leading-[0.88] md:text-[6.6rem]">
                The shoe gallery with its own pulse.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/74">
                LOKUS is not arranged like a marketplace. It feels like a drop journal, a fitting room, and a premium footwear archive in one place.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-[auto_auto] sm:items-center">
                <Link
                  href="/men"
                  className="rounded-full bg-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]"
                >
                  Enter the edit
                </Link>
                <Link
                  href="/new-arrivals"
                  className="rounded-full border border-white/18 px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white"
                >
                  Track next drop
                </Link>
              </div>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  ['Signal', 'Curated, not crowded.'],
                  ['Drop', 'Countdown-led launches.'],
                  ['Finish', 'Luxury layout, sharper commerce.'],
                ].map(([label, body]) => (
                  <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/7 px-4 py-5 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-sand)]">{label}</p>
                    <p className="mt-3 text-sm text-white/72">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.12} className="grid gap-4">
              <div className="relative min-h-[18rem] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20">
                <Image
                  src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1400&q=80"
                  alt="LOKUS footwear editorial"
                  fill
                  priority
                  className="object-cover opacity-86"
                  sizes="(max-width: 1024px) 100vw, 28rem"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/12 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">Brand signal</p>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-white/74">
                    Strong shapes, warm metal tones, and a controlled runway feel define every public page.
                  </p>
                </div>
              </div>
              <DropCountdown drop={leadDrop} compact />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-wrap mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.9fr)]">
        <Reveal className="lokus-panel bg-white px-6 py-8 md:px-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Brand circuit</p>
              <h2 className="mt-3 font-display text-5xl leading-none">Labels chosen for presence, not noise.</h2>
            </div>
            <Link href="/brands" className="text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
              Open brand edit
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {featuredBrandNames.map((brand) => (
              <Link
                key={brand}
                href={`/shop?brand=${encodeURIComponent(brand)}`}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-mist)]/55 px-4 py-3 text-xs uppercase tracking-[0.2em] text-[var(--color-foreground)]"
              >
                {brand}
              </Link>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="lokus-panel bg-[var(--color-foreground)] px-6 py-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-sand)]">Drop board</p>
          <div className="mt-5 space-y-4">
            {upcomingDrops.map((drop) => (
              <div key={drop.id} className="rounded-[1.5rem] border border-white/10 bg-white/7 px-4 py-4">
                <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-sand)]">{drop.brand}</p>
                <p className="mt-2 font-display text-3xl">{drop.model}</p>
                <p className="mt-2 text-sm text-white/68">{drop.colorway}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="section-wrap mt-18">
        <div className="grid gap-10 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <Reveal className="lokus-line pl-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Signature sections</p>
            <h2 className="mt-4 max-w-lg font-display text-6xl leading-[0.92]">Pages aligned like an editorial route map.</h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--color-muted-foreground)]">
              Instead of repeating symmetrical blocks, LOKUS now uses rails, staggered cards, and drop-led storytelling so the identity stays visible across the whole journey.
            </p>
          </Reveal>

          <div className="grid gap-5">
            {collectionHighlights.map((highlight, index) => (
              <Reveal
                key={highlight.title}
                delay={Math.min(index * 0.05, 0.14)}
                className={`lokus-panel px-6 py-8 md:px-8 ${index === 1 ? 'md:ml-12' : index === 2 ? 'md:mr-12' : ''} bg-white`}
              >
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">{highlight.eyebrow}</p>
                <h3 className="mt-4 font-display text-4xl">{highlight.title}</h3>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">{highlight.description}</p>
                <Link href={highlight.href} className="mt-7 inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
                  Explore
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section-wrap mt-20 grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Selected now</p>
              <h2 className="mt-3 font-display text-5xl">Spotlight pairs</h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
              See all
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featuredProducts.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 0.04, 0.16)}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <Reveal className="lokus-panel relative min-h-[19rem] overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=80"
              alt="LOKUS editorial rail"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 26rem"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/16 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">House note</p>
              <h3 className="mt-4 font-display text-5xl leading-none">A store you can recognize from the layout alone.</h3>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lokus-panel bg-white px-6 py-8 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Immediate arrivals</p>
            <div className="mt-5 space-y-4">
              {newPairs.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex items-center justify-between rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-4"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">{product.brand || 'LOKUS'}</p>
                    <p className="mt-1 text-base font-semibold">{product.name}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-ember)]">Open</span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lokus-panel bg-white px-6 py-8 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Private list</p>
            <h3 className="mt-3 font-display text-4xl">Receive official LOKUS notes before the crowd.</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
              We will use the official LOKUS sender for drop alerts, curated edits, and launch confirmations.
            </p>
            <div className="mt-6">
              <NewsletterForm />
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

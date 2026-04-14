import Image from 'next/image';
import Link from 'next/link';

import NewsletterForm from '@/app/components/NewsletterForm';
import { DropCountdown } from '@/app/components/storefront/DropCountdown';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { featuredBrandNames } from '@/app/lib/constants';
import { upcomingDrops } from '@/app/lib/drops';
import { formatPrice, normaliseLabel, productPrimaryImage } from '@/app/lib/format';
import { getFeaturedProducts, getProducts } from '@/app/lib/catalog';
import type { Product } from '@/app/lib/types';

function uniqueProducts(products: Product[]) {
  return Array.from(new Map(products.map((product) => [product.id, product])).values());
}

export default async function HomePage() {
  const [featuredProducts, newestProducts] = await Promise.all([
    getFeaturedProducts(8),
    getProducts({ sort: 'newest' }).then((items) => items.slice(0, 8)),
  ]);

  const catalogPool = uniqueProducts([...featuredProducts, ...newestProducts]);
  const heroProduct = catalogPool[0];
  const heroSideProducts = catalogPool.slice(1, 3);
  const frontRack = catalogPool.slice(0, 6);
  const freshPairs = newestProducts.slice(0, 4);
  const discoveryPairs = catalogPool.slice(2, 5);
  const leadDrop = upcomingDrops[0];

  return (
    <main className="pb-24">
      <section className="section-wrap pt-6">
        <div className="lokus-panel bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(184,106,57,0.16))] px-6 py-8 text-white md:px-10 md:py-10">
          <div className="grid gap-8 xl:grid-cols-[4.2rem_minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="hidden lg:flex lg:justify-center">
              <span className="lokus-rail text-[10px] text-white/34">Lokus Edition 01</span>
            </div>

            <Reveal className="relative xl:pr-4">
              <p className="text-[11px] uppercase tracking-[0.36em] text-[var(--color-sand)]">Premium footwear platform</p>
              <h1 className="mt-6 max-w-4xl font-display text-[4.2rem] leading-[0.88] md:text-[6.6rem]">
                Shoes first. Identity built into the frame.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/74">
                LOKUS is a multi-brand shoe floor designed like a signature gallery: sharper layouts, cleaner motion,
                and far more focus on the pairs people actually came to buy.
              </p>

              <div className="mt-10 grid gap-4 sm:grid-cols-[auto_auto] sm:items-center">
                <Link
                  href="/shop"
                  className="rounded-full bg-white px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]"
                >
                  Explore shoes
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
                  ['Pairs', `${catalogPool.length}+ styles surfaced upfront.`],
                  ['Drops', 'Countdown-led launches with real product previews.'],
                  ['Flow', 'Discovery and checkout tuned for smoother buying.'],
                ].map(([label, body]) => (
                  <div key={label} className="rounded-[1.5rem] border border-white/10 bg-white/7 px-4 py-5 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-sand)]">{label}</p>
                    <p className="mt-3 text-sm text-white/72">{body}</p>
                  </div>
                ))}
              </div>
            </Reveal>

            {heroProduct ? (
              <Reveal delay={0.12} className="grid gap-4">
                <Link
                  href={`/product/${heroProduct.id}`}
                  className="group relative min-h-[21rem] overflow-hidden rounded-[2rem] border border-white/10 bg-black/20"
                >
                  <Image
                    src={productPrimaryImage(heroProduct)}
                    alt={heroProduct.name}
                    fill
                    priority
                    className="object-cover transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 1280px) 100vw, 42rem"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/18 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">
                      {normaliseLabel(heroProduct.brand, 'LOKUS edit')}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <div>
                        <h2 className="font-display text-5xl leading-none">{heroProduct.name}</h2>
                        <p className="mt-3 max-w-sm text-sm leading-7 text-white/74">
                          {normaliseLabel(heroProduct.category, 'Signature footwear')} prepared for the front row of the storefront.
                        </p>
                      </div>
                      <span className="rounded-full border border-white/18 bg-black/28 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white">
                        {formatPrice(heroProduct.price)}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {heroSideProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="rounded-[1.6rem] border border-white/10 bg-white/7 p-4 transition duration-300 hover:bg-white/10"
                      >
                        <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--color-sand)]">
                          {normaliseLabel(product.brand, 'LOKUS')}
                        </p>
                        <p className="mt-3 font-display text-3xl leading-none">{product.name}</p>
                        <p className="mt-3 text-sm text-white/72">{formatPrice(product.price)}</p>
                      </Link>
                    ))}
                  </div>
                  <DropCountdown drop={leadDrop} compact />
                </div>
              </Reveal>
            ) : (
              <Reveal delay={0.12}>
                <DropCountdown drop={leadDrop} compact />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="section-wrap mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <Reveal className="lokus-panel bg-white px-6 py-8 md:px-8">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Front rack</p>
              <h2 className="mt-3 font-display text-5xl leading-none">The pairs shoppers should meet in the first thirty seconds.</h2>
            </div>
            <Link href="/shop" className="text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
              Open full floor
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {frontRack.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 0.04, 0.16)}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.05} className="lokus-panel bg-[var(--color-foreground)] px-6 py-8 text-white">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[var(--color-sand)]">Brand circuit</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {featuredBrandNames.map((brand) => (
              <Link
                key={brand}
                href={`/shop?brand=${encodeURIComponent(brand)}`}
                className="rounded-full border border-white/12 bg-white/7 px-4 py-3 text-xs uppercase tracking-[0.2em] text-white"
              >
                {brand}
              </Link>
            ))}
          </div>
          <div className="mt-8 space-y-4">
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

      <section className="section-wrap mt-18 grid gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="grid gap-6">
          <Reveal className="lokus-line pl-6">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Fresh pairs</p>
            <h2 className="mt-4 max-w-2xl font-display text-6xl leading-[0.92]">A homepage that sells shoes before it sells philosophy.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
              The LOKUS signature now comes from how the products are framed: staggered racks, dark rails, drop timing,
              and tighter visual rhythm across every section.
            </p>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2">
            {freshPairs.map((product, index) => (
              <Reveal key={product.id} delay={Math.min(index * 0.05, 0.15)} className={index % 2 === 1 ? 'md:translate-y-10' : ''}>
                <Link href={`/product/${product.id}`} className="lokus-panel block bg-white">
                  <div className="relative aspect-[5/4] overflow-hidden">
                    <Image
                      src={productPrimaryImage(product)}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1280px) 100vw, 32rem"
                    />
                  </div>
                  <div className="px-5 py-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                      {normaliseLabel(product.brand, 'LOKUS')} | {normaliseLabel(product.category, 'Footwear')}
                    </p>
                    <div className="mt-3 flex items-end justify-between gap-4">
                      <h3 className="font-display text-3xl leading-none">{product.name}</h3>
                      <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <Reveal className="lokus-panel bg-white px-6 py-8 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Discovery line</p>
            <div className="mt-5 space-y-4">
              {discoveryPairs.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-mist)]/45 px-4 py-4 transition duration-300 hover:bg-[var(--color-mist)]/72"
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                      {normaliseLabel(product.brand, 'LOKUS')}
                    </p>
                    <p className="mt-1 text-base font-semibold text-[var(--color-foreground)]">{product.name}</p>
                  </div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[var(--color-ember)]">{formatPrice(product.price)}</span>
                </Link>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lokus-panel bg-white px-6 py-8 md:px-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Private list</p>
            <h3 className="mt-3 font-display text-4xl">Receive official LOKUS notes before the crowd.</h3>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
              Drop alerts, curated edits, and launch confirmations stay tied to the official LOKUS sender once SMTP is connected.
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

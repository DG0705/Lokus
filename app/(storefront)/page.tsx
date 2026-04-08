import Image from 'next/image';
import Link from 'next/link';

import NewsletterForm from '@/app/components/NewsletterForm';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { collectionHighlights, featuredBrandNames } from '@/app/lib/constants';
import { getFeaturedProducts, getProducts } from '@/app/lib/catalog';

export default async function HomePage() {
  const [featuredProducts, newArrivals] = await Promise.all([
    getFeaturedProducts(4),
    getProducts({ sort: 'newest' }).then((items) => items.slice(0, 4)),
  ]);

  return (
    <main className="pb-24">
      <section className="section-wrap pt-6">
        <div className="premium-card relative overflow-hidden px-6 py-10 md:px-10 md:py-14">
          <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(17,17,17,0.95),rgba(35,32,29,0.82),rgba(185,106,60,0.18))]" />
          <div className="absolute inset-y-0 right-0 hidden w-1/2 md:block">
            <Image
              src="https://images.unsplash.com/photo-1543508282-6319a3e2621f?auto=format&fit=crop&w=1400&q=80"
              alt="Premium sneaker editorial"
              fill
              priority
              className="object-cover opacity-70"
              sizes="50vw"
            />
          </div>
          <div className="relative z-10 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(18rem,24rem)] md:items-end">
            <Reveal className="max-w-3xl">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[var(--color-sand)]">Premium multi-brand shoe house</p>
              <h1 className="mt-6 font-display text-6xl leading-[0.92] text-white md:text-[6.4rem]">
                Curated footwear for every part of your story.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/75">
                LOKUS brings together iconic sneakers, performance runners, and luxury street silhouettes in one refined destination built for India-first commerce.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href="/shop"
                  className="rounded-full bg-[var(--color-background)] px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-foreground)]"
                >
                  Shop all shoes
                </Link>
                <Link
                  href="/new-arrivals"
                  className="rounded-full border border-white/30 px-7 py-4 text-xs font-semibold uppercase tracking-[0.24em] text-white"
                >
                  Explore new arrivals
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.14} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/8 p-6 text-white backdrop-blur">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">Launch promise</p>
                <h2 className="mt-3 font-display text-4xl">Premium feeling at every step</h2>
              </div>
              <div className="grid gap-4 text-sm text-white/72">
                <p>Curated across Nike, Adidas, Puma, New Balance, Asics, and beyond.</p>
                <p>Luxury editorial presentation with fast, trusted checkout and India-friendly pricing.</p>
                <p>Designed to feel as elevated as the product itself.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-wrap mt-10">
        <Reveal className="premium-card premium-grid px-6 py-8 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Featured labels</p>
              <h2 className="mt-3 font-display text-4xl">Brands with presence</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {featuredBrandNames.map((brand) => (
                <Link
                  key={brand}
                  href={`/shop?brand=${encodeURIComponent(brand)}`}
                  className="rounded-full border border-[var(--color-border)] bg-white/70 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[var(--color-foreground)]"
                >
                  {brand}
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="section-wrap mt-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Featured now</p>
            <h2 className="mt-3 font-display text-5xl">Curated spotlight pairs</h2>
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-[0.22em] text-[var(--color-foreground)]">
            View catalog
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <Reveal key={product.id} delay={Math.min(index * 0.05, 0.2)}>
              <ProductCard product={product} priority={index < 2} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-wrap mt-20">
        <div className="grid gap-6 lg:grid-cols-3">
          {collectionHighlights.map((highlight, index) => (
            <Reveal key={highlight.title} delay={Math.min(index * 0.05, 0.15)} className="premium-card p-6 md:p-8">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">{highlight.eyebrow}</p>
              <h3 className="mt-4 font-display text-4xl">{highlight.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">{highlight.description}</p>
              <Link href={highlight.href} className="mt-8 inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-ember)]">
                Explore collection
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="section-wrap mt-20 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal className="premium-card relative min-h-[28rem] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1400&q=80"
            alt="Luxury footwear showroom"
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-8 text-white">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">Brand point of view</p>
            <h2 className="mt-4 font-display text-5xl leading-none">Editorial luxury meets real commerce utility.</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">
              We pair cinematic product storytelling with easy browsing, trusted payment, and a catalog structure built for daily shopping habits.
            </p>
          </div>
        </Reveal>
        <div className="grid gap-6">
          <Reveal className="premium-card p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">New arrivals</p>
            <h2 className="mt-4 font-display text-4xl">Fresh silhouettes landing now</h2>
            <div className="mt-6 grid gap-4">
              {newArrivals.map((product) => (
                <Link key={product.id} href={`/product/${product.id}`} className="flex items-center justify-between rounded-[1.25rem] border border-[var(--color-border)] bg-white/70 px-4 py-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">{product.brand || 'LOKUS'}</p>
                    <p className="mt-1 text-base font-semibold">{product.name}</p>
                  </div>
                  <span className="text-sm text-[var(--color-foreground)]">Open</span>
                </Link>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.08} className="premium-card p-6 md:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Private access</p>
            <h2 className="mt-4 font-display text-4xl">Join for early drops and launch notes</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
              Stay close to the latest releases, size restocks, styling notes, and invite-only promotions.
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

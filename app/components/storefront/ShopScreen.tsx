import Link from 'next/link';

import { CatalogFilters as CatalogFiltersPanel } from '@/app/components/storefront/CatalogFilters';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { upcomingDrops } from '@/app/lib/drops';
import { getFilterOptions, getProducts, parseCatalogFilters } from '@/app/lib/catalog';
import type { CatalogFilters } from '@/app/lib/types';

type ShopScreenProps = {
  title: string;
  description: string;
  filters?: CatalogFilters;
  searchParams?: Record<string, string | string[] | undefined>;
};

export async function ShopScreen({ title, description, filters = {}, searchParams = {} }: ShopScreenProps) {
  const mergedFilters = {
    ...parseCatalogFilters(searchParams),
    ...filters,
  };

  const [products, filterOptions] = await Promise.all([getProducts(mergedFilters), getFilterOptions()]);

  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <div className="lokus-panel bg-[linear-gradient(135deg,rgba(17,17,17,0.97),rgba(35,32,29,0.9),rgba(184,106,57,0.12))] px-6 py-10 text-white md:px-10 md:py-12">
          <div className="grid gap-8 lg:grid-cols-[4rem_minmax(0,1fr)_minmax(18rem,24rem)]">
            <div className="hidden lg:flex lg:justify-center">
              <span className="lokus-rail text-[10px] text-white/34">Gallery Route</span>
            </div>
            <Reveal>
              <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">The LOKUS gallery</p>
              <h1 className="mt-5 font-display text-6xl leading-[0.9] md:text-7xl">{title}</h1>
              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/72 md:text-base">{description}</p>
            </Reveal>
            <Reveal delay={0.08} className="rounded-[2rem] border border-white/10 bg-white/7 p-5 backdrop-blur">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-sand)]">Drop note</p>
              <h2 className="mt-3 font-display text-4xl">{upcomingDrops[0].model}</h2>
              <p className="mt-3 text-sm leading-7 text-white/72">{upcomingDrops[0].tagline}</p>
              <Link href="/new-arrivals" className="mt-5 inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-sand)]">
                View countdown
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-wrap mt-10 grid gap-10 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CatalogFiltersPanel currentFilters={mergedFilters} filterOptions={filterOptions} />
        </aside>

        <div>
          <div className="mb-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
            <div className="lokus-line pl-6">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Catalog result</p>
              <h2 className="mt-3 font-display text-5xl">{products.length} pairs selected</h2>
            </div>
            <div className="rounded-[1.75rem] border border-[var(--color-border)] bg-white px-5 py-5 text-sm leading-7 text-[var(--color-muted-foreground)] shadow-[var(--shadow)]">
              Filter by brand, gender, category, size, and price without losing the premium presentation.
            </div>
          </div>

          {products.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product, index) => (
                <Reveal key={product.id} delay={Math.min(index * 0.04, 0.2)}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="lokus-panel flex min-h-80 flex-col items-center justify-center bg-white px-8 text-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">No matches yet</p>
              <h3 className="mt-4 font-display text-4xl">Try a different filter mix</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-muted-foreground)]">
                Adjust the brand, category, or search query to broaden the collection. The full catalog is always available through the main gallery route.
              </p>
              <Link
                href="/shop"
                className="mt-8 rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white"
              >
                Reset gallery
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

import Link from 'next/link';

import { CatalogFilters as CatalogFiltersPanel } from '@/app/components/storefront/CatalogFilters';
import { ProductCard } from '@/app/components/storefront/ProductCard';
import { Reveal } from '@/app/components/storefront/Reveal';
import { getFilterOptions, getProducts } from '@/app/lib/catalog';
import { parseCatalogFilters } from '@/app/lib/catalog';
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
        <Reveal className="premium-card overflow-hidden border-white/30 bg-[linear-gradient(135deg,rgba(17,17,17,0.96),rgba(35,32,29,0.88))] px-6 py-12 text-white md:px-10 md:py-14">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">The LOKUS gallery</p>
          <div className="mt-5 max-w-3xl">
            <h1 className="font-display text-5xl leading-none md:text-7xl">{title}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/72 md:text-base">{description}</p>
          </div>
        </Reveal>
      </section>

      <section className="section-wrap mt-10 grid gap-10 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <aside>
          <CatalogFiltersPanel currentFilters={mergedFilters} filterOptions={filterOptions} />
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Catalog result</p>
              <h2 className="mt-2 font-display text-4xl">{products.length} pairs selected</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[var(--color-muted-foreground)]">
              Every pair is styled for premium discovery, from everyday rotation staples to limited-edition statement drops.
            </p>
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
            <div className="premium-card flex min-h-80 flex-col items-center justify-center px-8 text-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">No matches yet</p>
              <h3 className="mt-4 font-display text-4xl">Try a different filter mix</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[var(--color-muted-foreground)]">
                Adjust the brand, category, or search query to broaden the collection. The full catalog is always available in the main shop view.
              </p>
              <Link
                href="/shop"
                className="mt-8 rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-white"
              >
                Reset catalog
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

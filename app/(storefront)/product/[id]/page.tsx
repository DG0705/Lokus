import Link from 'next/link';
import { notFound } from 'next/navigation';

import { ProductCard } from '@/app/components/storefront/ProductCard';
import { ProductGallery } from '@/app/components/storefront/ProductGallery';
import { ProductPurchasePanel } from '@/app/components/storefront/ProductPurchasePanel';
import { Reveal } from '@/app/components/storefront/Reveal';
import { getProductById, getRelatedProducts } from '@/app/lib/catalog';
import { productGallery } from '@/app/lib/format';

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(Number(id));

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProducts(product);

  return (
    <main className="pb-20 pt-10">
      <section className="section-wrap">
        <div className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <span>{product.brand || 'Curated label'}</span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)]">
          <Reveal>
            <ProductGallery images={productGallery(product)} alt={product.name} />
          </Reveal>
          <Reveal delay={0.08}>
            <ProductPurchasePanel product={product} />
          </Reveal>
        </div>
      </section>

      <section className="section-wrap mt-16 grid gap-6 lg:grid-cols-3">
        <Reveal className="premium-card p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Craft notes</p>
          <h2 className="mt-4 font-display text-4xl">Premium materials, easy rotation</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            Every featured pair is selected for comfort, silhouette quality, and its ability to elevate the everyday wardrobe.
          </p>
        </Reveal>
        <Reveal delay={0.05} className="premium-card p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Delivery</p>
          <h2 className="mt-4 font-display text-4xl">Fast dispatch across India</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            Secure prepaid checkout, premium packaging, and status updates once your order is confirmed.
          </p>
        </Reveal>
        <Reveal delay={0.1} className="premium-card p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Returns</p>
          <h2 className="mt-4 font-display text-4xl">Simple exchange support</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--color-muted-foreground)]">
            Need a better size? Eligible pairs can be returned or exchanged within 7 days in unworn condition.
          </p>
        </Reveal>
      </section>

      <section className="section-wrap mt-18">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Related edit</p>
            <h2 className="mt-3 font-display text-5xl">Pairs with similar energy</h2>
          </div>
          <Link href="/shop" className="text-sm uppercase tracking-[0.2em] text-[var(--color-foreground)]">
            Browse all
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item, index) => (
            <Reveal key={item.id} delay={Math.min(index * 0.05, 0.15)}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  );
}

import Image from 'next/image';
import Link from 'next/link';

import { formatPrice, normaliseLabel, productPrimaryImage } from '@/app/lib/format';
import type { Product } from '@/app/lib/types';

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="group premium-card overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-mist)]">
        {product.badge ? (
          <span className="absolute left-4 top-4 z-10 rounded-full border border-white/30 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-white backdrop-blur">
            {product.badge}
          </span>
        ) : null}
        <Image
          src={productPrimaryImage(product)}
          alt={product.name}
          fill
          priority={priority}
          className="object-cover transition duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
        />
      </div>
      <div className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
              {normaliseLabel(product.brand, 'LOKUS Edit')}
            </p>
            <h3 className="mt-2 font-display text-2xl text-[var(--color-foreground)]">
              {product.name}
            </h3>
          </div>
          <span className="text-sm font-medium text-[var(--color-foreground)]">
            {formatPrice(product.price)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)]">
          <span>{normaliseLabel(product.category, 'Signature footwear')}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">View</span>
        </div>
      </div>
    </Link>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

import { formatPrice } from '@/app/lib/format';
import type { Product } from '@/app/lib/types';
import { useCart } from '@/app/context/CartContext';

type ProductPurchasePanelProps = {
  product: Product;
};

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const sizes = product.sizes ?? [];
  const colors = product.colors ?? [];
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<number | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (sizes.length > 0 && !selectedSize) return;
    if (colors.length > 0 && !selectedColor) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      size: selectedSize ?? 0,
      color: selectedColor ?? 'Default',
      image_url: product.image_url,
      quantity: 1,
      brand: product.brand,
      badge: product.badge,
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="premium-card p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">
            {product.brand || 'Curated Label'}
          </p>
          <h1 className="mt-3 font-display text-5xl leading-none">{product.name}</h1>
        </div>
        <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
        {product.category ? <span>{product.category}</span> : null}
        {product.gender ? <span>{product.gender}</span> : null}
        {product.badge ? <span>{product.badge}</span> : null}
      </div>

      <p className="mt-6 text-sm leading-7 text-[var(--color-muted-foreground)]">
        {product.description || 'A premium pair selected for comfort, identity, and daily rotation appeal.'}
      </p>

      {sizes.length ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Select size</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                type="button"
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedSize === size
                    ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-foreground)]'
                }`}
              >
                UK {size}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {colors.length ? (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Colorway</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                type="button"
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  selectedColor === color
                    ? 'border-[var(--color-foreground)] bg-[var(--color-foreground)] text-white'
                    : 'border-[var(--color-border)] text-[var(--color-foreground)]'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-full bg-[var(--color-foreground)] px-6 py-4 text-sm font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[var(--color-graphite)]"
        >
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
        <Link
          href="/cart"
          className="rounded-full border border-[var(--color-border)] px-6 py-4 text-center text-sm font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]"
        >
          View cart
        </Link>
      </div>

      <div className="mt-8 grid gap-3 rounded-[1.5rem] bg-white/70 p-5 text-sm text-[var(--color-muted-foreground)]">
        <p>Free premium delivery on prepaid orders above Rs. 5,000.</p>
        <p>Easy returns within 7 days for unworn pairs.</p>
        <p>Secure checkout powered by Razorpay.</p>
      </div>
    </div>
  );
}

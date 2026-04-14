'use client';

import Image from 'next/image';
import Link from 'next/link';

import { formatPrice } from '@/app/lib/format';
import { useHydrated } from '@/app/lib/use-hydrated';
import { useCart } from '@/app/context/CartContext';

export default function CartPage() {
  const hydrated = useHydrated();
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart();

  if (!hydrated) {
    return (
      <main className="section-wrap py-20">
        <div className="premium-card flex min-h-[28rem] flex-col items-center justify-center px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Cart</p>
          <h1 className="mt-4 font-display text-6xl">Loading your cart...</h1>
        </div>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="section-wrap py-20">
        <div className="premium-card flex min-h-[28rem] flex-col items-center justify-center px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Cart</p>
          <h1 className="mt-4 font-display text-6xl">Your cart is empty.</h1>
          <p className="mt-5 max-w-lg text-sm leading-7 text-[var(--color-muted-foreground)]">
            The next statement pair is waiting. Browse the full catalog and add a few standout options to your rotation.
          </p>
          <Link
            href="/shop"
            className="mt-8 rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="section-wrap py-12">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Cart overview</p>
          <h1 className="mt-3 font-display text-6xl">Your selected pairs</h1>
        </div>
        <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">{totalItems} items ready for checkout</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="premium-card grid gap-4 p-4 md:grid-cols-[7rem_minmax(0,1fr)_auto] md:p-5">
              <div className="relative aspect-square overflow-hidden rounded-[1.25rem] bg-[var(--color-mist)]">
                <Image
                  src={item.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="112px"
                />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  {item.brand || 'LOKUS'}
                </p>
                <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">Size UK {item.size} | {item.color}</p>
                <div className="mt-4 flex items-center gap-3">
                  <select
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                    className="rounded-full border border-[var(--color-border)] bg-white/80 px-4 py-2 text-sm outline-none"
                  >
                    {[1, 2, 3, 4, 5].map((quantity) => (
                      <option key={quantity} value={quantity}>
                        Qty {quantity}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="text-xs uppercase tracking-[0.18em] text-[var(--color-ember)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="flex items-start justify-between gap-2 md:flex-col md:items-end">
                <span className="text-base font-semibold">{formatPrice(item.price * item.quantity)}</span>
                {item.badge ? (
                  <span className="rounded-full border border-[var(--color-border)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                    {item.badge}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <aside className="premium-card h-fit p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Order summary</p>
          <div className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted-foreground)]">Subtotal</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-muted-foreground)]">Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="border-t border-[var(--color-border)] pt-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-8 block rounded-full bg-[var(--color-foreground)] px-6 py-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white"
          >
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </main>
  );
}

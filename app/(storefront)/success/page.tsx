'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const orderId = searchParams.get('order_id');

  return (
    <main className="section-wrap py-20">
      <div className="premium-card mx-auto max-w-3xl px-8 py-14 text-center">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Payment successful</p>
        <h1 className="mt-4 font-display text-6xl">Your order is confirmed.</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[var(--color-muted-foreground)]">
          We have received your payment and started preparing the order. A confirmation email and shipment updates will follow.
        </p>
        <div className="mx-auto mt-8 grid max-w-xl gap-4 rounded-[1.5rem] bg-white/80 p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted-foreground)]">Order reference</span>
            <span>{orderId || 'Generated after save'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-muted-foreground)]">Payment ID</span>
            <span>{paymentId || 'Available in Razorpay'}</span>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            className="rounded-full bg-[var(--color-foreground)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
          >
            Continue shopping
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-[var(--color-border)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-foreground)]"
          >
            View account
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<main className="section-wrap py-20 text-center">Loading confirmation...</main>}>
      <SuccessContent />
    </Suspense>
  );
}

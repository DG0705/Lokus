'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { LiveMapCard } from '@/app/components/delivery/LiveMapCard';
import { DeliveryTimeline } from '@/app/components/delivery/DeliveryTimeline';
import { deliveryStatusLabels } from '@/app/lib/delivery';
import { formatPrice } from '@/app/lib/format';
import type { OrderTrackingResponse } from '@/app/lib/types';

async function fetchTracking(orderId: string) {
  const response = await fetch(`/api/orders/${orderId}/tracking`, {
    cache: 'no-store',
  });
  const data = (await response.json()) as OrderTrackingResponse & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || 'Failed to load order tracking.');
  }

  return data;
}

export function OrderTrackingClient({ orderId }: { orderId: string }) {
  const [data, setData] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const tracking = await fetchTracking(orderId);
        if (!active) return;
        setData(tracking);
      } catch (error) {
        if (!active) return;
        setError(error instanceof Error ? error.message : 'Failed to load tracking.');
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    void load();
    const intervalId = window.setInterval(() => {
      void load();
    }, 20_000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [orderId]);

  if (loading) {
    return (
      <main className="section-wrap py-16">
        <div className="premium-card px-6 py-12 text-center text-sm text-[var(--color-muted-foreground)]">
          Loading order tracking...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="section-wrap py-16">
        <div className="premium-card px-6 py-12 text-center text-sm text-[var(--color-ember)]">{error || 'Tracking was unavailable.'}</div>
      </main>
    );
  }

  return (
    <main className="section-wrap py-12">
      <div className="mb-8">
        <Link href="/account" className="text-sm text-[var(--color-muted-foreground)] underline-offset-4 hover:underline">
          Back to account
        </Link>
      </div>
      <section className="overflow-hidden rounded-[2.25rem] border border-[var(--color-border)] bg-[linear-gradient(135deg,rgba(17,17,17,0.98),rgba(35,32,29,0.92),rgba(185,106,60,0.18))] px-6 py-10 text-white shadow-[var(--shadow)] md:px-8">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--color-sand)]">Track order</p>
        <h1 className="mt-5 font-display text-6xl leading-[0.92] md:text-7xl">{data.order.order_number}</h1>
        <p className="mt-5 text-sm leading-7 text-white/72">
          Payment captured for {formatPrice(data.order.total_amount / 100)}. Delivery updates appear here as soon as your pair moves through dispatch.
        </p>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="premium-card p-6">
            <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Order status</p>
            <h2 className="mt-3 text-3xl font-semibold capitalize">{data.deliveryJob ? deliveryStatusLabels[data.deliveryJob.status] : data.order.status.replaceAll('_', ' ')}</h2>
            <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
              {new Date(data.order.created_at).toLocaleString('en-IN')}
            </p>
            {data.customerOtp ? (
              <div className="mt-6 rounded-[1.5rem] border border-[var(--color-sand)]/30 bg-[var(--color-sand)]/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-ember)]">Delivery OTP</p>
                <p className="mt-3 text-4xl font-semibold tracking-[0.22em]">{data.customerOtp}</p>
                <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
                  Share this code only when your rider is physically handing over the order.
                </p>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[var(--color-muted-foreground)]">
                Your OTP appears here automatically once the rider marks the order out for delivery.
              </p>
            )}
          </div>
          {data.deliveryJob ? <DeliveryTimeline job={data.deliveryJob} /> : null}
        </div>

        <div>
          {data.deliveryJob ? (
            <LiveMapCard job={data.deliveryJob} title="Rider tracking" />
          ) : (
            <div className="premium-card px-6 py-10 text-sm text-[var(--color-muted-foreground)]">
              A live delivery job will appear here once the order is ready for dispatch.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

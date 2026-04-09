'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { formatPrice } from '@/app/lib/format';
import type { OrderRecord } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/app/context/AuthContext';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<OrderRecord[] | null>(null);

  useEffect(() => {
    if (!user || loading) {
      return;
    }

    let active = true;

    const fetchOrders = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!active) return;
      if (!error && data) {
        setOrders(data as OrderRecord[]);
      } else {
        setOrders([]);
      }
    };

    void fetchOrders();

    return () => {
      active = false;
    };
  }, [loading, user]);

  if (loading || (user && orders === null)) {
    return (
      <main className="section-wrap py-20 text-center text-sm text-[var(--color-muted-foreground)]">
        Loading your account...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="section-wrap py-12">
      <div className="premium-card px-6 py-8 md:px-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">My account</p>
        <h1 className="mt-3 font-display text-5xl">Welcome back</h1>
        <p className="mt-3 text-sm leading-7 text-[var(--color-muted-foreground)]">{user.email}</p>
      </div>

      <section className="mt-10">
        <div className="mb-5">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted-foreground)]">Order history</p>
          <h2 className="mt-3 font-display text-5xl">Your recent purchases</h2>
        </div>
        {!orders?.length ? (
          <div className="premium-card px-6 py-10 text-sm text-[var(--color-muted-foreground)]">
            You have not placed any orders yet.
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div key={order.id} className="premium-card p-6">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                      Order #{order.order_number}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold capitalize">{order.status}</h3>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                      {new Date(order.created_at).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatPrice(order.total_amount / 100)}</p>
                    <Link
                      href={`/account/orders/${order.id}/track`}
                      className="mt-3 inline-block text-xs uppercase tracking-[0.22em] text-[var(--color-ember)] underline-offset-4 hover:underline"
                    >
                      Track delivery
                    </Link>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  {order.order_items?.map((item, index) => (
                    <div
                      key={`${order.id}-${index}`}
                      className="flex items-center justify-between rounded-[1.25rem] border border-[var(--color-border)] bg-white/70 px-4 py-4 text-sm"
                    >
                      <span>
                        {item.product_name} | Size {item.size} | {item.color} | Qty {item.quantity}
                      </span>
                      <span>{formatPrice((item.price * item.quantity) / 100)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

'use client';

import { useEffect, useState } from 'react';

import { formatPrice } from '@/app/lib/format';
import type { OrderRecord } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/client';

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let active = true;

    const fetchOrders = async () => {
      const supabase = createClient();
      let query = supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data } = await query;
      if (!active) return;

      setOrders((data as OrderRecord[] | null) ?? []);
      setLoading(false);
    };

    void fetchOrders();

    return () => {
      active = false;
    };
  }, [filter]);

  const updateStatus = async (id: number, newStatus: string) => {
    const supabase = createClient();
    await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status: newStatus } : order)));
  };

  if (loading) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500">Loading orders...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Operations</p>
          <h1 className="mt-2 font-display text-6xl">Orders</h1>
        </div>
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-full border border-stone-200 bg-white px-4 py-3 text-sm outline-none"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Order #{order.order_number}</p>
                <h2 className="mt-3 text-2xl font-semibold capitalize">{order.status}</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {new Date(order.created_at).toLocaleString('en-IN')}
                </p>
                <p className="mt-3 text-sm">Total: {formatPrice(order.total_amount / 100)}</p>
                <p className="mt-1 text-sm text-stone-500">Payment ID: {order.payment_id || 'Unavailable'}</p>
              </div>
              <select
                value={order.status}
                onChange={(event) => updateStatus(order.id, event.target.value)}
                className="rounded-full border border-stone-200 bg-stone-50 px-4 py-3 text-sm outline-none"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="mt-5 space-y-3">
              {order.order_items?.map((item, index) => (
                <div key={`${order.id}-${index}`} className="rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-4 text-sm">
                  {item.product_name} | Size {item.size} | {item.color} | Qty {item.quantity} |{' '}
                  {formatPrice((item.price * item.quantity) / 100)}
                </div>
              ))}
            </div>
          </div>
        ))}
        {!orders.length ? (
          <p className="rounded-[2rem] border border-dashed border-stone-300 px-6 py-10 text-center text-sm text-stone-500">
            No orders found.
          </p>
        ) : null}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

import { formatPrice } from '@/app/lib/format';
import { createClient } from '@/utils/supabase/client';

type DashboardStats = {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  activeDeliveries: number;
};

type OrderSummary = {
  total_amount: number | null;
  status: string | null;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchStats = async () => {
      const supabase = createClient();
      const [{ count: productCount }, { data: orders }] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount, status'),
      ]);

      if (!active) return;

      const typedOrders = (orders as OrderSummary[] | null) ?? [];
      const totalRevenue = typedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
      const activeDeliveries = typedOrders.filter((order) =>
        ['ready_to_dispatch', 'assigned', 'accepted', 'picked_up', 'out_for_delivery'].includes(order.status || '')
      ).length;

      setStats({
        totalProducts: productCount || 0,
        totalOrders: typedOrders.length,
        totalRevenue: totalRevenue / 100,
        activeDeliveries,
      });
      setLoading(false);
    };

    void fetchStats();

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500">Loading dashboard...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Store overview</p>
        <h1 className="mt-2 font-display text-6xl">Dashboard</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total products" value={String(stats.totalProducts)} />
        <StatCard title="Total orders" value={String(stats.totalOrders)} />
        <StatCard title="Revenue" value={formatPrice(stats.totalRevenue)} />
        <StatCard title="Active deliveries" value={String(stats.activeDeliveries)} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{title}</p>
      <p className="mt-5 font-display text-5xl">{value}</p>
    </div>
  );
}

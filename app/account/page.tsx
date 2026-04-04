'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user) return;
      const supabase = createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data);
      setOrdersLoading(false);
    }
    fetchOrders();
  }, [user]);

  if (loading || ordersLoading) return <div className="text-center py-20">Loading...</div>;
  if (!user) return null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <div className="bg-gray-50 rounded-2xl p-8 mb-8">
        <p className="text-gray-600">Welcome, <span className="font-semibold">{user.email}</span></p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Order #{order.order_number}</span>
                <span className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-gray-600 mb-2">Status: {order.status}</div>
              <div className="text-sm">Total: ₹{(order.total_amount / 100).toFixed(2)}</div>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-black">View items</summary>
                <div className="mt-2 space-y-1 pl-4">
                  {order.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      {item.product_name} (Size {item.size}, {item.color}) x{item.quantity} – ₹{(item.price * item.quantity / 100).toFixed(2)}
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
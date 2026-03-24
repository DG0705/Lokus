"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DetailedOrder {
  order_id: number;
  status: string;
  size: string;
  shoe: {
    brand: string;
    model_name: string;
    image_url: string;
    price_inr: number;
  };
}

export default function VaultPage() {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/users/1/orders');
        const data = await res.json();
        setOrders(data.order_history || []);
      } catch (error) {
        console.error("Failed to fetch vault history");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <main className="min-h-screen bg-neutral-100 text-stone-800 p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-8">
        <div className="mb-10">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-stone-900 mb-2">Your Collection</h1>
          <p className="text-stone-500 font-medium">Manage your secured drops and track incoming orders.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-stone-500 font-bold uppercase tracking-widest">Unlocking Vault...</div>
        ) : orders.length === 0 ? (
          <div className="bg-neutral-50 border border-stone-200 rounded-3xl p-16 text-center shadow-sm">
            <h3 className="text-2xl font-black uppercase tracking-tight text-stone-400 mb-4">Vault is Empty</h3>
            <p className="text-stone-500 mb-8">You haven't copped any drops yet.</p>
            <Link href="/" className="bg-stone-900 text-white font-bold uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-stone-800 transition-colors">
              Browse Live Drops
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.order_id} className="bg-white border border-stone-200 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm">
                <div className="w-full md:w-40 h-40 bg-neutral-100 rounded-2xl p-4 flex-shrink-0 flex items-center justify-center">
                  <img src={order.shoe.image_url} alt={order.shoe.model_name} className="object-contain w-full h-full mix-blend-darken" />
                </div>
                <div className="flex-grow w-full">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-stone-400">{order.shoe.brand}</p>
                      <h4 className="text-2xl font-black text-stone-900">{order.shoe.model_name}</h4>
                    </div>
                    <p className="text-xl font-bold text-stone-900">₹{order.shoe.price_inr.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-stone-100 px-4 py-2 rounded-lg">
                      <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Size</p>
                      <p className="font-bold text-stone-800">{order.size}</p>
                    </div>
                    <div className="bg-stone-100 px-4 py-2 rounded-lg">
                      <p className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">Order ID</p>
                      <p className="font-bold text-stone-800">#{order.order_id.toString().padStart(5, '0')}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-auto text-right">
                  <span className="inline-block bg-green-50 text-green-700 border border-green-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full">
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
"use client";

import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_shoes_tracked: 0, active_locks: 0, expired_violators: 0, sold_out_count: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepLog, setSweepLog] = useState<string | null>(null);

  const [newProduct, setNewProduct] = useState({
    brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: '', delay_minutes: '0', duration_hours: '24'
  });
  const [isAdding, setIsAdding] = useState(false);
  const [addMessage, setAddMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const fetchStatsAndOrders = async () => {
      try {
        const statsRes = await fetch('http://127.0.0.1:8000/api/v1/admin/stats');
        setStats(await statsRes.json());
        
        const ordersRes = await fetch('http://127.0.0.1:8000/api/v1/admin/orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
      } catch (err) {
        console.error("Engine disconnected.");
      }
    };
    fetchStatsAndOrders();
    const interval = setInterval(fetchStatsAndOrders, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleForceSweep = async () => {
    setIsSweeping(true);
    setSweepLog(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/admin/force-sweep', { method: 'POST' });
      const data = await res.json();
      if (data.swept_count > 0) setSweepLog(`Reclaimed ${data.swept_count} carts. Restocked: ${data.restocked.join(', ')}`);
      else setSweepLog("System Optimal. No expired carts found.");
    } catch (err) {
      setSweepLog("Error communicating with State Engine.");
    } finally {
      setIsSweeping(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    setAddMessage(null);
    try {
      const payload = {
        ...newProduct,
        price_inr: parseInt(newProduct.price_inr), total_stock: parseInt(newProduct.total_stock),
        delay_minutes: parseInt(newProduct.delay_minutes) || 0, duration_hours: parseInt(newProduct.duration_hours) || 24
      };
      const res = await fetch('http://127.0.0.1:8000/api/v1/admin/products', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Failed to add product");
      
      setAddMessage({ 
        text: payload.delay_minutes > 0 ? `Scheduled to go LIVE in ${payload.delay_minutes} minute(s).` : "Product is now LIVE.", 
        type: 'success' 
      });
      setNewProduct({ brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: '', delay_minutes: '0', duration_hours: '24' });
    } catch (err) {
      setAddMessage({ text: "Error injecting product. Check constraints.", type: 'error' });
    } finally {
      setIsAdding(false);
      setTimeout(() => setAddMessage(null), 8000);
    }
  };

  const handleStateTransition = async (orderId: number, newState: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/orders/${orderId}/transition`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_state: newState })
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.detail);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <main className="min-h-screen bg-stone-900 text-neutral-100 p-8 font-sans selection:bg-red-800 selection:text-white pb-20">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 border-b border-stone-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2">Restricted Access</h1>
            <h2 className="text-5xl font-black uppercase tracking-tighter">Command Center</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>
            <span className="text-xs font-bold uppercase tracking-widest text-green-500">Engine Online</span>
          </div>
        </header>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Total Products</h3>
            <p className="text-5xl font-black">{stats.total_shoes_tracked}</p>
          </div>
          <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Active DB Locks</h3>
            <p className="text-5xl font-black text-blue-400">{stats.active_locks}</p>
          </div>
          <div className="bg-stone-800 p-6 rounded-2xl border border-red-900/50 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">Expired Violations</h3>
            <p className="text-5xl font-black text-red-500">{stats.expired_violators}</p>
          </div>
          <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700">
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Sold Out Items</h3>
            <p className="text-5xl font-black text-stone-500">{stats.sold_out_count}</p>
          </div>
        </div>

        {/* SWEEPER */}
        <section className="bg-stone-800 border border-stone-700 rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Cart Integrity Engine</h3>
              <p className="text-stone-400 text-sm font-medium max-w-xl">Reclaim inventory from users who failed constraints. Checks Temporal Drop Windows.</p>
            </div>
            <button onClick={handleForceSweep} disabled={isSweeping} className="bg-red-700 hover:bg-red-600 text-white font-black uppercase tracking-widest px-8 py-5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(185,28,28,0.4)] whitespace-nowrap">
              {isSweeping ? "Executing..." : "Force Sweep & Update States"}
            </button>
          </div>
          {sweepLog && <div className="mt-6 p-4 bg-stone-900 border border-stone-700 rounded-lg font-mono text-sm text-green-400">{">"} {sweepLog}</div>}
        </section>

        {/* INJECTION */}
        <section className="bg-stone-800 border border-stone-700 rounded-3xl p-8 mb-8">
          <div className="mb-8"><h3 className="text-2xl font-black uppercase tracking-tight mb-2">Inventory Injection & Scheduling</h3></div>
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="text" placeholder="Brand" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            <input required type="text" placeholder="Model Name" value={newProduct.model_name} onChange={e => setNewProduct({...newProduct, model_name: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            <input required type="text" placeholder="Colorway" value={newProduct.colorway} onChange={e => setNewProduct({...newProduct, colorway: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            <input required type="number" placeholder="Price (INR)" value={newProduct.price_inr} onChange={e => setNewProduct({...newProduct, price_inr: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            <input required type="number" placeholder="Total Stock" value={newProduct.total_stock} onChange={e => setNewProduct({...newProduct, total_stock: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            <input required type="url" placeholder="Image URL" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="bg-stone-900 border border-stone-700 p-4 rounded-xl focus:outline-none focus:border-stone-500 text-white font-bold" />
            
            <div className="bg-stone-900/50 border border-stone-700 p-4 rounded-xl flex flex-col justify-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Launch Delay (Minutes)</label>
              <input required type="number" min="0" value={newProduct.delay_minutes} onChange={e => setNewProduct({...newProduct, delay_minutes: e.target.value})} className="bg-transparent border-none p-0 focus:outline-none text-white font-black text-xl w-full" />
              <p className="text-xs text-stone-500 mt-1">Set to 0 for instant LIVE drop.</p>
            </div>
            <div className="bg-stone-900/50 border border-stone-700 p-4 rounded-xl flex flex-col justify-center">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-500 mb-2">Drop Duration (Hours)</label>
              <input required type="number" min="1" value={newProduct.duration_hours} onChange={e => setNewProduct({...newProduct, duration_hours: e.target.value})} className="bg-transparent border-none p-0 focus:outline-none text-white font-black text-xl w-full" />
              <p className="text-xs text-stone-500 mt-1">Time before asset shifts to SOLD OUT.</p>
            </div>
            
            <div className="md:col-span-2 mt-4">
              <button disabled={isAdding} type="submit" className="w-full bg-stone-100 text-stone-900 font-black uppercase tracking-widest py-5 rounded-xl hover:bg-white transition-all disabled:opacity-50">
                {isAdding ? 'Scheduling Asset...' : 'Deploy to State Machine'}
              </button>
            </div>
            {addMessage && <div className={`md:col-span-2 p-4 rounded-lg font-bold text-center uppercase tracking-widest text-sm ${addMessage.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>{addMessage.text}</div>}
          </form>
        </section>

        {/* FULFILLMENT PIPELINE */}
        <section className="bg-stone-800 border border-stone-700 rounded-3xl p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight mb-2">Fulfillment Pipeline</h3>
              <p className="text-stone-400 text-sm font-medium">Strict Directed Graph transitions for order lifecycles.</p>
            </div>
            <div className="bg-stone-900 px-4 py-2 rounded-lg border border-stone-700">
              <span className="text-sm font-bold text-stone-400">Total Orders: <span className="text-white">{orders.length}</span></span>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="text-center p-8 bg-stone-900/50 rounded-2xl border border-stone-700/50 border-dashed"><p className="text-stone-500 font-bold uppercase tracking-widest text-sm">No Active Orders</p></div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.order_id} className="bg-stone-900 p-5 rounded-2xl border border-stone-700 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-stone-500 mb-1">Order #{String(order.order_id).padStart(5, '0')} - {order.size}</p>
                    <h4 className="text-lg font-bold text-white">{order.shoe}</h4>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <span className="bg-stone-800 text-stone-300 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-stone-600 whitespace-nowrap">{order.current_state}</span>
                    {order.allowed_next_states.length > 0 && (
                      <><span className="text-stone-600">→</span>
                        <div className="flex gap-2">
                          {order.allowed_next_states.map((nextState: string) => (
                            <button key={nextState} onClick={() => handleStateTransition(order.order_id, nextState)} className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all whitespace-nowrap ${nextState === 'CANCELLED' ? 'bg-red-900/30 text-red-400 border-red-800' : 'bg-green-900/30 text-green-400 border-green-800'}`}>
                              Push to {nextState.split('_')[0]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {order.allowed_next_states.length === 0 && <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800">End State Reached</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
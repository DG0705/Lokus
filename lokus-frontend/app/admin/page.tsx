"use client";

import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, PackageSearch, DatabaseZap, Clock, Layers, ShieldCheck, XCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_shoes_tracked: 0, active_locks: 0, expired_violators: 0, sold_out_count: 0 });
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingProducts, setPendingProducts] = useState<any[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepLog, setSweepLog] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsRes = await fetch('http://127.0.0.1:8000/api/v1/admin/stats');
        setStats(await statsRes.json());
        
        const ordersRes = await fetch('http://127.0.0.1:8000/api/v1/admin/orders');
        const ordersData = await ordersRes.json();
        setOrders(ordersData.orders || []);
        
        const pendingRes = await fetch('http://127.0.0.1:8000/api/v1/admin/pending-products');
        const pendingData = await pendingRes.json();
        setPendingProducts(pendingData.pending_products || []);
      } catch (err) { 
        console.error("CRITICAL BACKEND ERROR:", err); 
      }
    };
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 2000);
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
    } catch (err) { setSweepLog("Error communicating with State Engine."); } finally { setIsSweeping(false); }
  };

  const handleApproveProduct = async (productId: number) => {
    const delay = prompt("Launch Delay in minutes? (0 for instant live)", "0");
    if (delay === null) return; 
    const duration = prompt("Drop Duration in hours? (0 for infinite)", "24");
    if (duration === null) return; 
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/products/${productId}/approve`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delay_minutes: parseInt(delay), duration_hours: parseInt(duration) })
      });
      if (res.ok) alert("Asset Approved & Scheduled!");
    } catch (err) { alert("Error connecting to Engine."); }
  };

  const handleStateTransition = async (orderId: number, newState: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/admin/orders/${orderId}/transition`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ new_state: newState })
      });
      if (!res.ok) { const data = await res.json(); alert(data.detail); }
    } catch (err) { console.error(err); }
  };

  // Filter orders
  const pendingVerifications = orders.filter(o => o.current_state === 'PENDING_VERIFICATION');
  const pipelineOrders = orders.filter(o => o.current_state !== 'PENDING_VERIFICATION');

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-8 font-sans pb-20">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12 border-b border-gray-200 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-red-600 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Restricted Access</h1>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-black">Command Center</h2>
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 flex items-center gap-2 shadow-sm">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span></span>
            <span className="text-xs font-bold uppercase tracking-widest">Engine Online</span>
          </div>
        </header>

        {/* 1. METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-gray-100 p-4 rounded-2xl"><Layers className="w-8 h-8 text-gray-600" /></div>
            <div><h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Products</h3><p className="text-4xl font-black">{stats.total_shoes_tracked}</p></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-2xl"><Activity className="w-8 h-8 text-blue-600" /></div>
            <div><h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Active Locks</h3><p className="text-4xl font-black text-blue-600">{stats.active_locks}</p></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm flex items-center gap-4">
            <div className="bg-red-50 p-4 rounded-2xl"><Clock className="w-8 h-8 text-red-600" /></div>
            <div><h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Violations</h3><p className="text-4xl font-black text-red-600">{stats.expired_violators}</p></div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="bg-stone-100 p-4 rounded-2xl"><PackageSearch className="w-8 h-8 text-stone-600" /></div>
            <div><h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Sold Out</h3><p className="text-4xl font-black text-stone-600">{stats.sold_out_count}</p></div>
          </div>
        </div>

        {/* 2. SWEEPER */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2 text-gray-900 flex items-center gap-2"><DatabaseZap className="w-6 h-6 text-black" /> Cart Integrity Engine</h3>
              <p className="text-gray-500 text-sm font-medium max-w-xl">Reclaim inventory from users who failed constraints. Evaluates Temporal Windows.</p>
            </div>
            <button onClick={handleForceSweep} disabled={isSweeping} className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl transition-all disabled:opacity-50 shadow-md">
              {isSweeping ? "Executing..." : "Force Sweep & Update States"}
            </button>
          </div>
          {sweepLog && <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm text-green-700 font-bold">{">"} {sweepLog}</div>}
        </section>

        {/* 3. VENDOR ESCROW QUEUE */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8 mb-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2 text-blue-600">Escrow Review Queue</h3>
              <p className="text-gray-500 text-sm font-medium">Supplier assets awaiting authentication & scheduling.</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 font-bold text-blue-700">Pending: {pendingProducts.length}</div>
          </div>

          {pendingProducts.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-200 border-dashed"><p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Queue Empty</p></div>
          ) : (
            <div className="space-y-4">
              {pendingProducts.map((product) => (
                <div key={product.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:border-blue-300 hover:shadow-sm">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <img src={product.image_url} alt="shoe" className="w-16 h-16 object-cover rounded-xl bg-white shadow-sm" />
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-blue-600 mb-1">Vendor ID: {product.supplier_id || 'Unknown'}</p>
                      <h4 className="text-lg font-bold text-gray-900">{product.brand} {product.model_name}</h4>
                      <p className="text-sm font-medium text-gray-500">₹{product.price_inr.toLocaleString()} • Stock: {product.total_stock}</p>
                    </div>
                  </div>
                  <button onClick={() => handleApproveProduct(product.id)} className="w-full md:w-auto bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md">
                    Review & Approve
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 4. UTR SECURITY QUEUE */}
        {pendingVerifications.length > 0 && (
          <section className="bg-white border-2 border-amber-200 shadow-xl rounded-3xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 animate-pulse"></div>
            <div className="mb-6 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tight mb-2 text-amber-600 flex items-center gap-2"><ShieldAlert className="w-6 h-6" /> UTR Verification Required</h3>
                <p className="text-gray-600 text-sm font-medium">Verify these UTR numbers against your bank app before releasing inventory.</p>
              </div>
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-xl font-bold">Action Required: {pendingVerifications.length}</div>
            </div>

            <div className="space-y-4">
              {pendingVerifications.map((order) => (
                <div key={order.order_id} className="bg-amber-50 p-5 rounded-2xl border border-amber-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-amber-700 mb-1">Order #{String(order.order_id).padStart(5, '0')} • {order.shoe}</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-mono font-black bg-white px-3 py-1 rounded-lg border border-amber-200 select-all">UTR: {order.utr || "MISSING"}</span>
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button onClick={() => handleStateTransition(order.order_id, 'CANCELLED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 transition-all">
                      <XCircle className="w-5 h-5" /> Reject Fraud
                    </button>
                    <button onClick={() => handleStateTransition(order.order_id, 'CONFIRMED')} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-all shadow-md">
                      <ShieldCheck className="w-5 h-5" /> Verify Payment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 5. FULFILLMENT PIPELINE */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-3xl p-8">
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black tracking-tight mb-2 text-gray-900">Fulfillment Pipeline</h3>
              <p className="text-gray-500 text-sm font-medium">Strict Directed Graph transitions for verified orders.</p>
            </div>
          </div>
          {pipelineOrders.length === 0 ? (
            <div className="text-center p-12 bg-gray-50 rounded-2xl border border-gray-200 border-dashed"><p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No Active Orders</p></div>
          ) : (
            <div className="space-y-4">
              {pipelineOrders.map((order) => (
                <div key={order.order_id} className="bg-gray-50 p-5 rounded-2xl border border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 mb-1">Order #{String(order.order_id).padStart(5, '0')} - Size {order.size}</p>
                    <h4 className="text-lg font-bold text-gray-900">{order.shoe}</h4>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                    <span className="bg-white text-gray-600 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full border border-gray-200 whitespace-nowrap">{order.current_state}</span>
                    {order.allowed_next_states.length > 0 && (
                      <><span className="text-gray-400">→</span>
                        <div className="flex gap-2">
                          {order.allowed_next_states.map((nextState: string) => (
                            <button key={nextState} onClick={() => handleStateTransition(order.order_id, nextState)} className={`text-xs font-bold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${nextState === 'CANCELLED' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-black text-white hover:bg-gray-800'}`}>
                              Push to {nextState.split('_')[0]}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
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
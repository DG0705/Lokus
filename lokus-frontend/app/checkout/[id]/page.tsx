"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const sizes = ["US 7", "US 8", "US 9", "US 10", "US 11", "US 12"];

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/v1/reservations/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.detail) setError(data.detail);
        else setData(data);
      })
      .catch(() => setError("Failed to load secure checkout room."));
  }, [id]);

  useEffect(() => {
    if (!data) return;

    const interval = setInterval(() => {
      // THE FIX: Force JavaScript to treat the SQLite timestamp as UTC by appending 'Z'
      let expTimeStr = data.reservation.expires_at;
      if (!expTimeStr.endsWith('Z')) {
        expTimeStr += 'Z'; 
      }

      const distance = new Date(expTimeStr).getTime() - new Date().getTime();
      
      if (distance <= 0) {
        clearInterval(interval);
        setError("Time Expired. Your pair was released back to the global pool.");
        return;
      }

      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [data]);

  const handleCheckout = async () => {
    if (!selectedSize) return;
    setIsProcessing(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/checkout/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ size: selectedSize })
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.detail);
      
      // Atomic Purchase Successful! Send to Vault
      router.push(`/success/${result.order_id}`);
      
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 p-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border-2 border-red-100">
          <h2 className="text-2xl font-black text-red-600 uppercase tracking-tighter mb-4">Cart Lost</h2>
          <p className="text-stone-500 font-medium mb-8">{error}</p>
          <Link href="/" className="bg-stone-900 text-white font-bold uppercase px-8 py-4 rounded-xl hover:bg-stone-800">Back to Drops</Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="min-h-screen flex justify-center items-center bg-neutral-100 uppercase font-black tracking-widest text-stone-400">Loading Vault Secure Link...</div>;

  return (
    <main className="min-h-screen bg-neutral-100 text-stone-800 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto mt-12">
        <div className="bg-red-800 text-white p-6 rounded-3xl flex justify-between items-center mb-8 shadow-lg shadow-red-900/20">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-300">Inventory Locked</h2>
            <p className="text-xl md:text-2xl font-black uppercase tracking-tighter">Complete Checkout</p>
          </div>
          <div className="text-right">
            <h2 className="text-xs font-bold uppercase tracking-widest text-red-300">Releasing In</h2>
            <p className="text-3xl md:text-4xl font-mono font-light">{timeLeft || "00:00"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
            <div className="bg-neutral-100 rounded-2xl h-64 mb-6 flex items-center justify-center p-4">
              <img src={data.shoe.image_url} alt={data.shoe.model_name} className="object-contain h-full mix-blend-darken" />
            </div>
            <p className="text-stone-500 text-xs font-black uppercase tracking-widest">{data.shoe.brand}</p>
            <h1 className="text-3xl font-black tracking-tighter text-stone-900 mb-2">{data.shoe.model_name}</h1>
            <p className="text-xl font-bold text-stone-900">₹{data.shoe.price_inr.toLocaleString('en-IN')}</p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col">
            <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-4">Select Size</h3>
            <div className="grid grid-cols-3 gap-3 mb-auto">
              {sizes.map(size => (
                <button 
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-4 rounded-xl font-bold uppercase transition-all ${
                    selectedSize === size ? 'bg-stone-900 text-white shadow-md scale-105' : 'bg-neutral-100 text-stone-500 hover:bg-neutral-200'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <button 
              onClick={handleCheckout}
              disabled={!selectedSize || isProcessing}
              className={`w-full mt-8 font-black uppercase tracking-widest py-5 rounded-xl transition-all ${
                !selectedSize ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
              }`}
            >
              {isProcessing ? 'Processing Transaction...' : 'Confirm & Pay'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
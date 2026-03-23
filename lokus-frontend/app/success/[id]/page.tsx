"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti'; // Run: npm install canvas-confetti @types/canvas-confetti

export default function SuccessPage() {
  const { id } = useParams();

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#16a34a', '#000000', '#ffffff']
    });
  }, []);

  return (
    <main className="min-h-screen bg-stone-900 flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="max-w-xl w-full bg-stone-800 rounded-3xl p-8 md:p-12 text-center border border-stone-700 shadow-2xl relative overflow-hidden">
        
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500">
          <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter mb-4">
          Drop Secured
        </h1>
        
        <p className="text-stone-400 font-medium mb-8">
          Your transaction was successful. The asset has been transferred to your vault and is awaiting authentication.
        </p>

        <div className="bg-stone-900 rounded-2xl p-6 mb-10 border border-stone-800 flex justify-between items-center">
          <div className="text-left">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Order Number</p>
            <p className="text-white font-mono text-xl">#{String(id).padStart(6, '0')}</p>
          </div>
          <div className="text-right">
            <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Status</p>
            <p className="text-green-500 font-bold uppercase">Confirmed</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/vault" className="bg-white text-stone-900 hover:bg-stone-200 font-black uppercase tracking-widest px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-white/10">
            View My Vault
          </Link>
          <Link href="/" className="bg-stone-700 text-white hover:bg-stone-600 font-bold uppercase tracking-widest px-8 py-4 rounded-xl transition-all">
            Back to Drops
          </Link>
        </div>

      </div>
    </main>
  );
}   
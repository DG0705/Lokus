"use client";

import { useState, useEffect } from 'react';

interface UpcomingShoe {
  id: number;
  brand: string;
  model_name: string;
  image_url: string;
  drop_start: string;
}

// Sub-component for individual shoe countdowns
const CountdownCard = ({ shoe }: { shoe: UpcomingShoe }) => {
  const [timeLeft, setTimeLeft] = useState({ d: '00', h: '00', m: '00', s: '00' });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      // Timezone Trap Fix
      let startTimeStr = shoe.drop_start;
      if (!startTimeStr.endsWith('Z')) startTimeStr += 'Z';

      const distance = new Date(startTimeStr).getTime() - new Date().getTime();

      if (distance <= 0) {
        clearInterval(interval);
        setIsLive(true);
      } else {
        const d = Math.floor(distance / (1000 * 60 * 60 * 24));
        const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({
          d: String(d).padStart(2, '0'),
          h: String(h).padStart(2, '0'),
          m: String(m).padStart(2, '0'),
          s: String(s).padStart(2, '0')
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [shoe.drop_start]);

  return (
    <div className="bg-[#111] border border-stone-800 rounded-[2rem] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 w-full max-w-5xl mx-auto mb-8 shadow-2xl overflow-hidden relative">
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-900/10 blur-[100px] rounded-full pointer-events-none"></div>

      {/* Left: Shoe Image & Details */}
      <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 w-full md:w-1/2">
        <div className="w-40 h-40 bg-stone-900 rounded-2xl p-4 flex items-center justify-center flex-shrink-0">
          <img src={shoe.image_url} alt={shoe.model_name} className="object-contain w-full h-full drop-shadow-2xl" />
        </div>
        <div className="text-center md:text-left">
          <h3 className="text-stone-500 text-xs font-bold uppercase tracking-[0.2em] mb-2">Next Vault Unlock</h3>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">{shoe.brand} x {shoe.model_name}</h2>
        </div>
      </div>

      {/* Right: The Live Countdown Timer */}
      <div className="relative z-10 flex flex-col items-center">
        {isLive ? (
          <div className="animate-pulse flex flex-col items-center">
            <h2 className="text-4xl font-black text-green-500 uppercase tracking-tighter mb-2">Drop is Live</h2>
            <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Refresh page to view</p>
          </div>
        ) : (
          <div className="flex items-start gap-3 md:gap-6 text-white font-black text-4xl md:text-6xl tracking-tighter">
            <div className="flex flex-col items-center">
              <span>{timeLeft.d}</span>
              <span className="text-[10px] text-stone-500 tracking-[0.2em] uppercase mt-2">Days</span>
            </div>
            <span className="text-stone-700 -mt-2">:</span>
            
            <div className="flex flex-col items-center">
              <span>{timeLeft.h}</span>
              <span className="text-[10px] text-stone-500 tracking-[0.2em] uppercase mt-2">Hrs</span>
            </div>
            <span className="text-stone-700 -mt-2">:</span>
            
            <div className="flex flex-col items-center">
              <span>{timeLeft.m}</span>
              <span className="text-[10px] text-stone-500 tracking-[0.2em] uppercase mt-2">Min</span>
            </div>
            <span className="text-stone-700 -mt-2">:</span>
            
            <div className="flex flex-col items-center">
              <span className="text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">{timeLeft.s}</span>
              <span className="text-[10px] text-red-900 tracking-[0.2em] uppercase mt-2">Sec</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Exported Component
export default function UpcomingVault() {
  const [upcoming, setUpcoming] = useState<UpcomingShoe[]>([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/v1/upcoming')
      .then(res => res.json())
      .then(data => setUpcoming(data.upcoming_drops || []))
      .catch(err => console.error("Failed to fetch upcoming drops"));
  }, []);

  if (upcoming.length === 0) return null; // Don't show anything if no drops are scheduled

  return (
    <section className="py-12 px-4">
      {upcoming.map(shoe => (
        <CountdownCard key={shoe.id} shoe={shoe} />
      ))}
    </section>
  );
}
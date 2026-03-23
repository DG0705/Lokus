"use client";

import { useState, useEffect } from 'react';

export default function UpcomingDropTimer({ dropDate, dropName }: { dropDate: string, dropName: string }) {
  const [isMounted, setIsMounted] = useState(false);

  const calculateTimeLeft = () => {
    const difference = new Date(dropDate).getTime() - new Date().getTime();
    if (difference <= 0) return null; 

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    setIsMounted(true);
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (!newTimeLeft) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [dropDate]);

  if (!isMounted) return <div className="h-32 bg-stone-200 animate-pulse rounded-3xl mb-12"></div>;

  if (!timeLeft) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-8 rounded-3xl text-center mb-12 shadow-sm">
        <h3 className="text-3xl font-black uppercase tracking-tighter animate-pulse">
          {dropName} is LIVE!
        </h3>
        <p className="mt-2 font-bold uppercase tracking-widest text-sm">Quantities are limited. Cop now.</p>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 text-neutral-100 p-8 rounded-3xl text-center mb-12 shadow-xl border border-stone-800">
      <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
        Next Vault Unlock
      </h3>
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-6">{dropName}</h2>
      
      <div className="flex justify-center space-x-6 md:space-x-12 text-4xl md:text-6xl font-black tracking-tighter">
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="text-xs text-stone-400 uppercase tracking-widest mt-2 font-bold">Days</span>
        </div>
        <span className="text-stone-700">:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-xs text-stone-400 uppercase tracking-widest mt-2 font-bold">Hrs</span>
        </div>
        <span className="text-stone-700">:</span>
        <div className="flex flex-col items-center">
          <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-xs text-stone-400 uppercase tracking-widest mt-2 font-bold">Min</span>
        </div>
        <span className="text-stone-700">:</span>
        <div className="flex flex-col items-center text-red-600">
          <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-xs text-red-800 uppercase tracking-widest mt-2 font-bold">Sec</span>
        </div>
      </div>
    </div>
  );
}
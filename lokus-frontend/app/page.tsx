import StorefrontGrid from '@/components/StorefrontGrid';
import UpcomingVault from '@/components/UpcomingVault';

// Force Next.js to always fetch fresh data (Crucial for Hackathon Demos!)
export const revalidate = 0;

export default async function Home() {
  let liveDrops = [];

  // Fetch the LIVE drops from our State Engine
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/drops', { 
      cache: 'no-store' // Bypasses Next.js static caching
    });
    
    if (res.ok) {
      const data = await res.json();
      liveDrops = data.live_drops || [];
    }
  } catch (error) {
    console.error("FastAPI Engine disconnected.");
  }

  return (
    <main className="min-h-screen bg-neutral-100 text-stone-800 font-sans selection:bg-red-800 selection:text-white pb-24">
      
      {/* 1. HERO SECTION */}
      <section className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-sm font-bold uppercase tracking-[0.3em] text-red-600 mb-4 flex items-center justify-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
          </span>
          Lokus State Engine
        </h1>
        <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-stone-900 mb-6 leading-[0.9]">
          Secured <br /> Drops Only.
        </h2>
        <p className="text-stone-500 font-medium max-w-xl mx-auto text-sm md:text-base">
          A high-frequency state machine for hyped commerce. Experience atomic transactions, temporal constraints, and absolute inventory integrity.
        </p>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* 2. THE TEMPORAL SCHEDULER (Upcoming Drops) */}
        <UpcomingVault />

        {/* 3. THE TRANSACTION ORCHESTRATOR (Live Drops Grid) */}
        <StorefrontGrid initialDrops={liveDrops} />

      </div>
    </main>
  );
}
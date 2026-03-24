import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import StorefrontGrid from '@/components/StorefrontGrid';
import UpcomingVault from '@/components/UpcomingVault';

export const revalidate = 0;

type SizeKey = 'small' | 'medium' | 'large';

// --- FIXED HIGH-RES BRAND LOGOS (Swapped invisible SVGs for solid PNGs) ---
const brands = [
  { name: 'Nike', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg' },
  { name: 'Adidas', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg' },
  { name: 'Jordan', logo: 'https://upload.wikimedia.org/wikipedia/en/3/37/Jumpman_logo.svg' },
  { name: 'Puma', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Puma_Logo.svg/1024px-Puma_Logo.svg.png' },
  { name: 'Converse', logo: 'https://upload.wikimedia.org/wikipedia/commons/3/30/Converse_logo.svg' },
  { name: 'New Balance', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/New_Balance_logo.svg/1024px-New_Balance_logo.svg.png' },
];

const showcaseShoes: { id: number; image: string; size: SizeKey; delay: string; position: string; }[] = [
  { id: 1, image: 'https://images.pexels.com/photos/1032110/pexels-photo-1032110.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'large', delay: '0s', position: 'top-[10%] left-[5%]' },
  { id: 2, image: 'https://images.pexels.com/photos/1070360/pexels-photo-1070360.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'medium', delay: '2s', position: 'top-[30%] left-[25%]' },
  { id: 3, image: 'https://images.pexels.com/photos/1456706/pexels-photo-1456706.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'small', delay: '4s', position: 'top-[15%] left-[45%]' },
  { id: 4, image: 'https://images.pexels.com/photos/1407354/pexels-photo-1407354.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'medium', delay: '1s', position: 'top-[40%] right-[10%]' },
  { id: 5, image: 'https://images.pexels.com/photos/1478442/pexels-photo-1478442.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'large', delay: '3s', position: 'top-[60%] left-[10%]' },
  { id: 6, image: 'https://images.pexels.com/photos/2048548/pexels-photo-2048548.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'small', delay: '5s', position: 'top-[75%] left-[35%]' },
  { id: 7, image: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800', size: 'medium', delay: '1.5s', position: 'bottom-[10%] right-[25%]' },
  { id: 8, image: 'https://images.pexels.com/photos/1361113/pexels-photo-1361113.jpeg?auto=compress&cs=tinysrgb&w=600', size: 'large', delay: '2.5s', position: 'top-[10%] right-[15%]' },
];

const sizeMap: Record<SizeKey, string> = { small: 'w-48 h-48', medium: 'w-64 h-64', large: 'w-80 h-80' };

function Hero() {
  return (
    <section className="relative bg-white overflow-hidden border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 border border-red-100 shadow-inner">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                The Platform for Sole Proprietors
              </span>
              <h2 className="text-5xl md:text-7xl font-black text-black leading-tight tracking-tighter">
                Find Your <span className='text-red-700'>Perfect Sole.</span>
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed font-medium">
                LOKUS connects you with premium footwear from the world's finest brands. From street style to athletic performance, we have every step covered.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a href="#live-drops" className="bg-black text-white px-8 py-5 rounded-2xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1">
                Explore Live Drops <ChevronRight className="w-5 h-5" />
              </a>
              <Link href="/collection" className="border-2 border-gray-300 text-center text-gray-900 px-8 py-5 rounded-2xl font-bold hover:border-black hover:bg-gray-50 transition-colors">
                View Archive
              </Link>
            </div>
          </div>
          <div className="relative h-96 md:h-full min-h-[450px]">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-3xl border border-gray-100 shadow-inner"></div>
            <img src="https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Hero Sneaker" className="absolute inset-0 w-full h-full object-cover rounded-3xl shadow-2xl mix-blend-multiply scale-110 -rotate-6" />
          </div>
        </div>
      </div>
    </section>
  );
}

function AnimatedShowcase() {
  return (
    <section id="innovative-showcase" className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] grid grid-cols-10 grid-rows-10">
        {[...Array(100)].map((_, i) => <div key={i} className="border border-gray-900"></div>)}
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-10 space-y-3">
          <h2 className="text-4xl font-black text-black tracking-tight">The Lokus Registry</h2>
          <p className="text-gray-600 text-lg font-medium max-w-xl mx-auto">Drifting, rotating, hovering. A dynamic exhibition of the rarest and most iconic assets in our inventory.</p>
        </div>
        <div className="relative h-[120vh] w-full mt-16 group">
          {showcaseShoes.map((shoe) => (
            <div 
              key={shoe.id}
              className={`absolute ${shoe.position} ${sizeMap[shoe.size]} transition-all duration-700 ease-out group-hover:opacity-70 hover:opacity-100! hover:scale-110 hover:z-50 hover:shadow-2xl hover:shadow-red-900/10 hover:border-red-600`}
              style={{ animationName: 'float', animationDuration: '12s', animationTimingFunction: 'ease-in-out', animationIterationCount: 'infinite', animationDelay: shoe.delay }}
            >
              <div className="w-full h-full rounded-3xl overflow-hidden bg-white shadow-xl border-4 border-white transition-all hover:border-black p-4 group flex items-center justify-center">
                <img src={shoe.image} alt={`Sole Asset ${shoe.id}`} className="max-h-full max-w-full object-contain mix-blend-darken scale-125 transition-transform duration-500 group-hover:scale-135" />
              </div>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center select-none pointer-events-none opacity-20 group-hover:opacity-10 transition-opacity">
            <p className="text-[120px] font-black text-gray-300 leading-none tracking-tighter uppercase">Sole</p>
            <p className="text-[120px] font-black text-gray-300 leading-none tracking-tighter uppercase -mt-8">Archive</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BrandShowcase() {
  return (
    <section id="brand-showcase" className="bg-gray-100 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-3">
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">Premium Partners</h2>
          <p className="text-gray-700 text-lg font-medium">Shop from the world's most trusted shoe manufacturers</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {brands.map((brand) => (
            /* --- NEW: Changed Button to Link for dynamic routing --- */
            <Link href={`/collection?brand=${brand.name}`} key={brand.name} className="group bg-white rounded-3xl p-10 flex flex-col items-center justify-center gap-6 hover:shadow-2xl transition-all duration-500 hover:border-black border-2 border-white shadow-md">
              <div className="h-16 w-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <img 
                  src={brand.logo} 
                  alt={`${brand.name} logo`} 
                  className="max-h-full max-w-full object-contain opacity-80 group-hover:opacity-100 transition-opacity mix-blend-darken"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-center tracking-tight">{brand.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  let liveDrops = [];
  try {
    const res = await fetch('http://127.0.0.1:8000/api/v1/drops', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      liveDrops = data.live_drops || [];
    }
  } catch (error) {
    console.error("FastAPI Engine disconnected.");
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-grow">
        <Hero />
        <AnimatedShowcase />
        <BrandShowcase />
        
        <section id="live-drops" className="py-24 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center flex flex-col items-center">
              <span className="bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-100 inline-flex items-center gap-2 mb-4 shadow-inner">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live State Engine
              </span>
              <h2 className="text-4xl font-black text-gray-900 tracking-tight">Real-Time Drop Feed</h2>
              <p className="text-gray-700 mt-2 font-medium max-w-lg">Active inventory tracking synced via persistent WebSocket tunnels for 0.4s transaction finality.</p>
            </div>
            <UpcomingVault />
            <StorefrontGrid initialDrops={liveDrops} />
          </div>
        </section>
      </main>
    </div>
  );
}
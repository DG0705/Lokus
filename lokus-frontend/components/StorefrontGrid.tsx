"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Shoe {
  id: number;
  brand: string;
  model_name: string;
  colorway: string;
  price_inr: number;
  image_url: string; 
  available_stock: number;
  status: string;
}

export default function StorefrontGrid({ initialDrops }: { initialDrops: Shoe[] }) {
  const router = useRouter();
  
  // NEW: Convert static props into dynamic local state
  const [drops, setDrops] = useState<Shoe[]>(initialDrops);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

  const uniqueBrands = ["All", ...Array.from(new Set(initialDrops.map(shoe => shoe.brand)))];

  // ==========================================
  // NEW: WEBSOCKET LISTENER
  // ==========================================
  useEffect(() => {
    // Keep local state in sync if parent passes new props (like after a manual refresh)
    setDrops(initialDrops);
    
    // Open the live tunnel
    const ws = new WebSocket('ws://127.0.0.1:8000/api/v1/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'STOCK_UPDATE') {
        setDrops(prevDrops => prevDrops.map(shoe => {
          if (shoe.id === data.shoe_id) {
            // Update the specific shoe's stock dynamically!
            return { ...shoe, available_stock: data.available_stock, status: data.status };
          }
          return shoe;
        }));
      }
    };

    return () => ws.close(); // Clean up on unmount
  }, [initialDrops]);

  const handleReserve = async (shoeId: number) => {
    setLoadingId(shoeId);
    setErrorMessages(prev => ({ ...prev, [shoeId]: "" })); 

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reserve?user_id=1&shoe_id=${shoeId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to secure drop.");

      router.push(`/checkout/${data.reservation_id}`);
    } catch (error: any) {
      setErrorMessages(prev => ({ ...prev, [shoeId]: error.message }));
      setLoadingId(null); 
    }
  };

  // Ensure our processedDrops uses the LIVE 'drops' state, not the static 'initialDrops'
  const processedDrops = useMemo(() => {
    let result = drops.filter((shoe) => {
      const matchesSearch = shoe.model_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            shoe.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === "All" || shoe.brand === filterBrand;
      return matchesSearch && matchesBrand;
    });

    if (sortBy === "PriceLowHigh") result.sort((a, b) => a.price_inr - b.price_inr);
    if (sortBy === "PriceHighLow") result.sort((a, b) => b.price_inr - a.price_inr);
    return result;
  }, [searchTerm, filterBrand, sortBy, drops]);

  return (
    <section className="py-12 border-t border-stone-300 relative">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10 pt-8 relative z-10">
        <input type="text" placeholder="Search silhouettes, brands..." className="flex-1 p-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-900 shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="p-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-600 shadow-sm" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
          {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <select className="p-4 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-600 shadow-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Featured">Featured</option>
          <option value="PriceLowHigh">Price: Low to High</option>
          <option value="PriceHighLow">Price: High to Low</option>
        </select>
      </div>

      <div className="flex justify-between items-end mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <h3 className="text-4xl font-black uppercase tracking-tighter text-stone-900">Live Drops</h3>
          {/* Live indicator showing WebSockets are active */}
          <span className="bg-green-100 text-green-700 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md border border-green-200 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Sync Active
          </span>
        </div>
        <span className="text-stone-500 text-sm font-bold uppercase">{processedDrops.length} results</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
        {processedDrops.map((shoe) => {
          const errorMsg = errorMessages[shoe.id];
          const isSoldOut = shoe.available_stock <= 0 || shoe.status === "SOLD_OUT";

          return (
            <div key={shoe.id} className="bg-white rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
              <div className="h-64 mb-5 overflow-hidden rounded-2xl bg-neutral-100 flex items-center justify-center relative">
                <img src={shoe.image_url} alt={shoe.model_name} className={`object-cover w-full h-full mix-blend-darken transition-all ${isSoldOut ? 'opacity-50 grayscale' : ''}`} />
                
                {/* Dynamic Live Stock Badge */}
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md transition-colors ${
                  isSoldOut ? 'bg-stone-200 text-stone-500' : 
                  shoe.available_stock <= 3 ? 'bg-red-600 text-white animate-pulse' : 
                  'bg-stone-900 text-white'
                }`}>
                  {isSoldOut ? 'Sold Out' : `${shoe.available_stock} Left`}
                </div>
              </div>

              <div className="flex justify-between items-start px-2 flex-grow">
                <div>
                  <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-1">{shoe.brand}</p>
                  <h4 className={`text-2xl font-bold tracking-tight mb-1 ${isSoldOut ? 'text-stone-400' : 'text-stone-900'}`}>{shoe.model_name}</h4>
                  <p className="text-sm text-stone-500 font-medium">{shoe.colorway}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isSoldOut ? 'text-stone-400' : 'text-stone-900'}`}>₹{shoe.price_inr.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="mt-6">
                {errorMsg && <p className="text-red-600 text-[10px] font-black text-center mb-2 uppercase tracking-widest bg-red-50 p-2 rounded-lg">{errorMsg}</p>}
                
                <button 
                  onClick={() => handleReserve(shoe.id)}
                  disabled={loadingId === shoe.id || isSoldOut}
                  className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all ${
                    isSoldOut ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200' : 
                    'bg-stone-900 text-neutral-100 hover:bg-stone-800 shadow-lg active:scale-[0.98]'
                  }`}
                >
                  {loadingId === shoe.id ? 'Securing Lock...' : isSoldOut ? 'Out of Stock' : 'Cop Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
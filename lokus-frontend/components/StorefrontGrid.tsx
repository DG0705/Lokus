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
  
  const [drops, setDrops] = useState<Shoe[]>(initialDrops);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

  useEffect(() => {
    setDrops(initialDrops);

    // 1. Open the live WebSocket tunnel
    const ws = new WebSocket('ws://127.0.0.1:8000/api/v1/ws');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle Inventory/Stock Updates
      if (data.type === 'STOCK_UPDATE') {
        setDrops(prevDrops => prevDrops.map(shoe => {
          if (shoe.id === data.shoe_id) {
            return { ...shoe, available_stock: data.available_stock, status: data.status };
          }
          return shoe;
        }));
      }

      // Handle a Brand New Drop Going Live!
      if (data.type === 'NEW_DROP' && data.shoe) {
        setDrops(prevDrops => {
          // Prevent duplicates if it's already in the grid
          if (prevDrops.some(s => s.id === data.shoe.id)) return prevDrops;
          // Add the new shoe directly to the top of the feed!
          return [data.shoe, ...prevDrops];
        });
      }
    };

    // 2. Silent Background Sync (Hackathon Safety Net)
    // This quietly checks the API every 5 seconds. When the UpcomingVault timer
    // hits zero and the backend changes the status to LIVE, this will catch it instantly.
    const fallbackSync = setInterval(async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/v1/drops');
        if (res.ok) {
          const freshData = await res.json();
          if (freshData.live_drops) {
            setDrops(freshData.live_drops);
          }
        }
      } catch (e) {
        // Silently ignore network errors during sync
      }
    }, 5000);

    return () => {
      ws.close();
      clearInterval(fallbackSync);
    };
  }, [initialDrops]);

  const uniqueBrands = ["All", ...Array.from(new Set(drops.map(shoe => shoe.brand)))];

  const handleReserve = async (shoeId: number) => {
    setLoadingId(shoeId);
    setErrorMessages(prev => ({ ...prev, [shoeId]: "" })); 

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('token');
    if (!token) {
      setLoadingId(null); // Fixes the freezing issue if logged out!
      router.push('/login');
      return;
    }

    const actualUserId = parseInt(token.replace('mock_token_', '')) || 1;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reserve?user_id=${actualUserId}&shoe_id=${shoeId}`, {
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
    <section className="py-12 border-t border-gray-100">
      
      <div className="flex flex-col lg:flex-row gap-4 mb-10 pt-4">
        <input type="text" placeholder="Search silhouettes, brands..." className="flex-1 p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-900" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select className="p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-700" value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
          {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <select className="p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-700" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Featured">Featured</option>
          <option value="PriceLowHigh">Price: Low to High</option>
          <option value="PriceHighLow">Price: High to Low</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {processedDrops.map((shoe) => {
          const errorMsg = errorMessages[shoe.id];
          const isSoldOut = shoe.available_stock <= 0 || shoe.status === "SOLD_OUT";

          return (
            <div key={shoe.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200 flex flex-col hover:shadow-lg transition-all hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="h-64 mb-5 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center relative">
                <img src={shoe.image_url} alt={shoe.model_name} className={`object-contain w-full h-full mix-blend-darken scale-110 ${isSoldOut ? 'opacity-50 grayscale' : ''}`} />
                <div className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md ${isSoldOut ? 'bg-gray-200 text-gray-500' : 'bg-black text-white'}`}>
                  {isSoldOut ? 'Sold Out' : `${shoe.available_stock} Left`}
                </div>
              </div>

              <div className="flex justify-between items-start px-2 flex-grow">
                <div>
                  <p className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">{shoe.brand}</p>
                  <h4 className={`text-2xl font-bold tracking-tight mb-1 ${isSoldOut ? 'text-gray-400' : 'text-gray-900'}`}>{shoe.model_name}</h4>
                  <p className="text-sm text-gray-500 font-medium">{shoe.colorway}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${isSoldOut ? 'text-gray-400' : 'text-gray-900'}`}>₹{shoe.price_inr.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-6">
                {errorMsg && <p className="text-red-600 bg-red-50 p-2 rounded-lg text-xs font-bold text-center mb-3 uppercase tracking-wide">{errorMsg}</p>}
                <button 
                  onClick={() => handleReserve(shoe.id)}
                  disabled={loadingId === shoe.id || isSoldOut}
                  className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all shadow-md ${
                    isSoldOut ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-black text-white hover:bg-gray-800 hover:shadow-xl active:scale-95'
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
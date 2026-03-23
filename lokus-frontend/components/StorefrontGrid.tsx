"use client";

import { useState, useMemo } from 'react';
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
  
  // Navigation & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBrand, setFilterBrand] = useState("All");
  const [sortBy, setSortBy] = useState("Featured");

  // Transaction State
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [errorMessages, setErrorMessages] = useState<Record<number, string>>({});

  const uniqueBrands = ["All", ...Array.from(new Set(initialDrops.map(shoe => shoe.brand)))];

  // --- THE TRANSACTION ORCHESTRATOR CONNECTION ---
  const handleReserve = async (shoeId: number) => {
    setLoadingId(shoeId);
    setErrorMessages(prev => ({ ...prev, [shoeId]: "" })); // Clear previous errors

    try {
      // Hardcoding user_id=1 for the hackathon demo
      const res = await fetch(`http://127.0.0.1:8000/api/v1/reserve?user_id=1&shoe_id=${shoeId}`, {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to secure drop.");
      }

      // BOOM: Lock Secured. Instant redirect to the secure checkout room!
      router.push(`/checkout/${data.reservation_id}`);

    } catch (error: any) {
      setErrorMessages(prev => ({ ...prev, [shoeId]: error.message }));
      setLoadingId(null); // Reset button if it failed so they can try again
    }
  };

  const processedDrops = useMemo(() => {
    let result = initialDrops.filter((shoe) => {
      const matchesSearch = shoe.model_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            shoe.brand.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = filterBrand === "All" || shoe.brand === filterBrand;
      return matchesSearch && matchesBrand;
    });

    if (sortBy === "PriceLowHigh") result.sort((a, b) => a.price_inr - b.price_inr);
    if (sortBy === "PriceHighLow") result.sort((a, b) => b.price_inr - a.price_inr);
    return result;
  }, [searchTerm, filterBrand, sortBy, initialDrops]);

  return (
    <section className="py-12 border-t border-stone-300">
      
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-10 pt-8">
        <input
          type="text"
          placeholder="Search silhouettes, brands..."
          className="flex-1 p-4 bg-neutral-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="p-4 bg-neutral-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-600"
          value={filterBrand}
          onChange={(e) => setFilterBrand(e.target.value)}
        >
          {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
        </select>
        <select
          className="p-4 bg-neutral-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-stone-600"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="Featured">Featured</option>
          <option value="PriceLowHigh">Price: Low to High</option>
          <option value="PriceHighLow">Price: High to Low</option>
        </select>
      </div>

      <div className="flex justify-between items-end mb-8">
        <h3 className="text-4xl font-black uppercase tracking-tighter text-stone-900">Live Drops</h3>
        <span className="text-stone-500 text-sm font-bold uppercase">{processedDrops.length} results</span>
      </div>

      {/* The Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {processedDrops.map((shoe) => {
          const errorMsg = errorMessages[shoe.id];

          return (
            <div key={shoe.id} className="bg-neutral-50 rounded-3xl p-5 shadow-sm border border-stone-200 flex flex-col">
              <div className="h-64 mb-5 overflow-hidden rounded-2xl bg-neutral-200 flex items-center justify-center relative">
                <img src={shoe.image_url} alt={shoe.model_name} className="object-cover w-full h-full mix-blend-darken" />
                
                {/* Live Stock Badge */}
                <div className="absolute top-4 right-4 bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-md">
                  {shoe.available_stock} Left
                </div>
              </div>

              <div className="flex justify-between items-start px-2 flex-grow">
                <div>
                  <p className="text-stone-500 text-xs font-black uppercase tracking-widest mb-1">{shoe.brand}</p>
                  <h4 className="text-2xl font-bold tracking-tight mb-1 text-stone-900">{shoe.model_name}</h4>
                  <p className="text-sm text-stone-500 font-medium">{shoe.colorway}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-stone-900">₹{shoe.price_inr.toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* Transaction State UI */}
              <div className="mt-6">
                {errorMsg && <p className="text-red-600 text-xs font-bold text-center mb-2 uppercase tracking-wide">{errorMsg}</p>}
                
                <button 
                  onClick={() => handleReserve(shoe.id)}
                  disabled={loadingId === shoe.id || shoe.available_stock <= 0}
                  className={`w-full font-black uppercase tracking-widest py-4 rounded-xl transition-all ${
                    shoe.available_stock <= 0 
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                      : 'bg-stone-900 text-neutral-100 hover:bg-red-800 shadow-lg hover:shadow-red-900/20 active:scale-[0.98]'
                  }`}
                >
                  {loadingId === shoe.id ? 'Securing Lock...' : shoe.available_stock <= 0 ? 'Sold Out' : 'Cop Now'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
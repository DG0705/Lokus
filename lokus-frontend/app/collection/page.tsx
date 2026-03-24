"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, Droplets, Info } from 'lucide-react';

export default function CollectionPage() {
  const router = useRouter();
  const [catalog, setCatalog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlBrand = params.get('brand');
    if (urlBrand) {
      setSelectedBrand(urlBrand);
    }

    fetch('http://127.0.0.1:8000/api/v1/catalog')
      .then(res => res.json())
      .then(data => {
        setCatalog(data.catalog || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const uniqueBrands = ["All", ...Array.from(new Set(catalog.map(shoe => shoe.manufacturer)))];

  const filteredCatalog = catalog.filter(shoe => {
    const matchesSearch = shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          shoe.style.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === "All" || shoe.manufacturer === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const formatImagePath = (dbPath: string) => {
    if (!dbPath) return "";
    return "/" + dbPath.replace(/\\/g, '/');
  };

  const handleCopNow = (shoeId: string) => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };
    
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    router.push(`/checkout/static/${shoeId}`);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        <header className="mb-12">
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest inline-flex items-center gap-2 border border-blue-100 shadow-inner mb-4">
            Static Archive
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">Lokus Collection</h1>
          <p className="text-gray-500 text-lg max-w-2xl font-medium">Browse and secure premium silhouettes from our complete historical database.</p>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" placeholder="Search silhouettes, styles..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black outline-none font-bold text-gray-900 shadow-sm" 
            />
          </div>
          <select 
            value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
            className="p-4 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black font-bold text-gray-700 shadow-sm cursor-pointer"
          >
            {uniqueBrands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-20 font-black tracking-widest text-gray-400 uppercase animate-pulse">Loading Registry...</div>
        ) : filteredCatalog.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center">
            <Info className="w-16 h-16 text-gray-300 mb-4" />
            <p className="font-bold text-gray-500 text-lg">No assets found matching your search.</p>
            <p className="text-gray-400 mt-2">Try clearing your filters or selecting a different brand.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCatalog.map(shoe => (
              <div key={shoe.id} className="group bg-white rounded-3xl p-5 shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col relative">
                
                <div className="relative h-56 mb-5 overflow-hidden rounded-2xl bg-gray-50 flex items-center justify-center p-4">
                  <img src={formatImagePath(shoe.front_img)} alt={shoe.name} className="absolute inset-0 w-full h-full object-contain mix-blend-darken transition-opacity duration-300 group-hover:opacity-0 p-4" />
                  <img src={formatImagePath(shoe.side_img || shoe.back_img)} alt={`${shoe.name} Alt`} className="absolute inset-0 w-full h-full object-contain mix-blend-darken opacity-0 transition-opacity duration-300 group-hover:opacity-100 p-4" />
                  
                  {/* --- NEW: Water Resistance moved to Top-Left --- */}
                  {shoe.water_resistance === "Water-Resistant" && (
                    <div className="absolute top-3 left-3 bg-blue-100 text-blue-700 p-2 rounded-full z-10" title="Water Resistant">
                      <Droplets className="w-4 h-4" />
                    </div>
                  )}

                  {/* --- NEW: Live State Indicator added to Top-Right --- */}
                  <div className="absolute top-3 right-3 bg-black/90 backdrop-blur-sm text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center gap-1.5 z-10 border border-gray-800">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_4px_#22c55e]"></span>
                    Available
                  </div>
                </div>

                <div className="flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{shoe.manufacturer}</p>
                    <p className="text-xs font-bold bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{shoe.style}</p>
                  </div>
                  
                  <h3 className="text-xl font-black text-gray-900 tracking-tight leading-tight mb-1">{shoe.name}</h3>
                  <p className="text-sm font-medium text-gray-500 mb-4">{shoe.color}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs font-medium text-gray-500 mb-4">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Material</span>
                      <span className="text-gray-900 font-bold truncate block">{shoe.material}</span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <span className="block text-gray-400 uppercase tracking-wider text-[10px] mb-0.5">Sole</span>
                      <span className="text-gray-900 font-bold truncate block">{shoe.sole_material}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-black text-black">₹{shoe.price.toLocaleString()}</span>
                  </div>

                  <button 
                    onClick={() => handleCopNow(shoe.id)}
                    className="w-full font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow-md bg-black text-white hover:bg-gray-800 hover:shadow-xl active:scale-95"
                  >
                    Cop Now
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
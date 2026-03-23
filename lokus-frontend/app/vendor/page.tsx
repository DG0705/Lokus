"use client";

import { useState, useEffect } from 'react';

export default function VendorDashboard() {
  const [supplierId, setSupplierId] = useState<number>(2); // Default mock ID
  const [newProduct, setNewProduct] = useState({
    brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Read the user ID from the auth cookie
    const match = document.cookie.match(/token=mock_token_(\d+)/);
    if (match) setSupplierId(parseInt(match[1]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload = {
        supplier_id: supplierId,
        ...newProduct,
        price_inr: parseInt(newProduct.price_inr),
        total_stock: parseInt(newProduct.total_stock),
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Upload failed");
      
      setMessage({ text: "Asset uploaded! Awaiting Admin Review in Escrow.", type: 'success' });
      setNewProduct({ brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: '' });
    } catch (err) {
      setMessage({ text: "Error uploading asset.", type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 8000);
    }
  };

  return (
    <main className="min-h-screen bg-stone-950 text-neutral-100 p-8 font-sans pb-20">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 border-b border-stone-800 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-sm font-bold uppercase tracking-widest text-blue-500 mb-2">Supplier Portal</h1>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white">Asset Upload</h2>
          </div>
          <span className="bg-blue-900/30 text-blue-400 border border-blue-800 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl">
            Vendor ID: {supplierId}
          </span>
        </header>

        <section className="bg-stone-900 border border-stone-800 rounded-3xl p-8">
          <div className="mb-8">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2 text-white">Provide Asset Details</h3>
            <p className="text-stone-400 text-sm font-medium">All uploads are sent to the Lokus Authentication Escrow before going live.</p>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input required type="text" placeholder="Brand (e.g., Nike)" value={newProduct.brand} onChange={e => setNewProduct({...newProduct, brand: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            <input required type="text" placeholder="Model Name (e.g., Dunk Low)" value={newProduct.model_name} onChange={e => setNewProduct({...newProduct, model_name: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            <input required type="text" placeholder="Colorway" value={newProduct.colorway} onChange={e => setNewProduct({...newProduct, colorway: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            <input required type="number" placeholder="Price (INR)" value={newProduct.price_inr} onChange={e => setNewProduct({...newProduct, price_inr: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            <input required type="number" placeholder="Total Stock" value={newProduct.total_stock} onChange={e => setNewProduct({...newProduct, total_stock: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            <input required type="url" placeholder="Image URL (https://...)" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} className="bg-stone-950 border border-stone-800 p-4 rounded-xl text-white font-bold focus:ring-1 focus:ring-stone-500" />
            
            <div className="md:col-span-2 mt-4">
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-5 rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20">
                {isSubmitting ? 'Uploading Asset...' : 'Submit to Escrow'}
              </button>
            </div>
            
            {message && (
              <div className={`md:col-span-2 p-4 rounded-lg font-bold text-center uppercase tracking-widest text-sm ${message.type === 'success' ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
                {message.text}
              </div>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
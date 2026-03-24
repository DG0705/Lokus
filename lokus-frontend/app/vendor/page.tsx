"use client";

import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, Package } from 'lucide-react';

export default function VendorDashboard() {
  const [supplierId, setSupplierId] = useState<number>(1); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const [formData, setFormData] = useState({
    brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: ''
  });

  useEffect(() => {
    // Read the actual user ID from the auth cookie
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
        ...formData,
        price_inr: parseInt(formData.price_inr),
        total_stock: parseInt(formData.total_stock),
      };

      const res = await fetch('http://127.0.0.1:8000/api/v1/vendor/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Upload failed");
      
      setMessage({ text: "Asset uploaded! Awaiting Admin Auth in Escrow.", type: 'success' });
      setFormData({ brand: '', model_name: '', colorway: '', price_inr: '', image_url: '', total_stock: '' });
    } catch (err) {
      setMessage({ text: "Error uploading asset. Please try again.", type: 'error' });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(null), 8000);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
          <div className="mb-10 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Supplier Portal</h1>
            <p className="text-gray-600 font-medium max-w-lg">
              Upload new assets to the Lokus network. All submissions are placed in Escrow for physical authentication before going live.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Brand</label>
                <input required type="text" placeholder="e.g. Nike" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Model Name</label>
                <input required type="text" placeholder="e.g. Jordan 1 High" value={formData.model_name} onChange={e => setFormData({...formData, model_name: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Colorway</label>
                <input required type="text" placeholder="e.g. Chicago" value={formData.colorway} onChange={e => setFormData({...formData, colorway: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Price (INR)</label>
                <input required type="number" placeholder="25000" value={formData.price_inr} onChange={e => setFormData({...formData, price_inr: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Total Stock</label>
                <input required type="number" placeholder="10" value={formData.total_stock} onChange={e => setFormData({...formData, total_stock: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">High-Res Image URL</label>
              <input required type="url" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} 
                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all font-semibold text-gray-900 placeholder-gray-400" />
            </div>

            <button disabled={isSubmitting} type="submit" className="w-full bg-black text-white font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 mt-4 flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              {isSubmitting ? 'Securing Asset...' : 'Submit to Escrow'}
            </button>

            {message && (
              <div className={`p-4 rounded-xl flex items-center gap-3 font-bold text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {message.text}
              </div>
            )}
          </form>

        </div>
      </div>
    </main>
  );
}
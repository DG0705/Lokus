'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function NewProduct() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    sizes: '',
    colors: '',
    image_url: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const sizesArray = formData.sizes.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
    const colorsArray = formData.colors.split(',').map(c => c.trim());
    const { error } = await supabase.from('products').insert({
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      sizes: sizesArray,
      colors: colorsArray,
      image_url: formData.image_url || null,
    });
    if (error) {
      alert('Error: ' + error.message);
    } else {
      router.push('/admin/products');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Add Product</h1>
        <Link href="/admin/products" className="text-gray-600 hover:text-black">← Back</Link>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Product Name *</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-black"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price (USD) *</label>
          <input
            type="number"
            name="price"
            required
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sizes (comma separated) e.g. 7,8,9,10</label>
          <input
            type="text"
            name="sizes"
            placeholder="7,8,9,10,11,12"
            value={formData.sizes}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Colors (comma separated) e.g. Black,White,Navy</label>
          <input
            type="text"
            name="colors"
            placeholder="Black,White,Navy"
            value={formData.colors}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Product'}
        </button>
      </form>
    </div>
  );
}
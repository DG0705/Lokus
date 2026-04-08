'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { formatPrice, productPrimaryImage } from '@/app/lib/format';
import type { Product } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/client';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const supabase = createClient();
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts((data as Product[] | null) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('*').order('id', { ascending: false });

      if (!active) return;
      setProducts((data as Product[] | null) ?? []);
      setLoading(false);
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this product?')) return;

    const supabase = createClient();
    await supabase.from('products').delete().eq('id', id);
    void fetchProducts();
  };

  if (loading) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500">Loading products...</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Catalog manager</p>
          <h1 className="mt-2 font-display text-6xl">Products</h1>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-stone-950 px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-white"
        >
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
        <div className="grid grid-cols-[7rem_minmax(0,1.4fr)_0.9fr_0.9fr_0.9fr] gap-4 border-b border-stone-200 px-6 py-4 text-xs uppercase tracking-[0.22em] text-stone-500">
          <span>Image</span>
          <span>Name</span>
          <span>Brand</span>
          <span>Price</span>
          <span>Actions</span>
        </div>
        {products.map((product) => (
          <div key={product.id} className="grid grid-cols-[7rem_minmax(0,1.4fr)_0.9fr_0.9fr_0.9fr] gap-4 border-b border-stone-100 px-6 py-4 last:border-b-0">
            <div className="relative aspect-square overflow-hidden rounded-[1rem] bg-stone-100">
              <Image src={productPrimaryImage(product)} alt={product.name} fill className="object-cover" sizes="112px" />
            </div>
            <div>
              <p className="font-semibold">{product.name}</p>
              <p className="mt-1 text-sm text-stone-500">{product.category || 'Uncategorized'}</p>
            </div>
            <div className="text-sm text-stone-600">{product.brand || 'Not set'}</div>
            <div className="text-sm text-stone-600">{formatPrice(product.price)}</div>
            <div className="flex items-center gap-4 text-sm">
              <Link href={`/admin/products/edit/${product.id}`} className="text-stone-950 underline-offset-4 hover:underline">
                Edit
              </Link>
              <button type="button" onClick={() => handleDelete(product.id)} className="text-red-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

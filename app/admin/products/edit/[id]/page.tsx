'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { ProductForm } from '@/app/admin/components/ProductForm';
import type { Product } from '@/app/lib/types';
import { createClient } from '@/utils/supabase/client';

const emptyState = {
  name: '',
  price: '',
  description: '',
  sizes: '',
  colors: '',
  image_url: '',
  brand: '',
  gender: '',
  category: '',
  badge: '',
  is_featured: false,
  gallery_urls: '',
};

export default function EditProductPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [formValues, setFormValues] = useState(emptyState);

  useEffect(() => {
    let active = true;

    const fetchProduct = async () => {
      const supabase = createClient();
      const { data } = await supabase.from('products').select('*').eq('id', params.id).single();

      if (!active || !data) return;
      const product = data as Product;
      setFormValues({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        sizes: product.sizes?.join(', ') || '',
        colors: product.colors?.join(', ') || '',
        image_url: product.image_url || '',
        brand: product.brand || '',
        gender: product.gender || '',
        category: product.category || '',
        badge: product.badge || '',
        is_featured: Boolean(product.is_featured),
        gallery_urls: product.gallery_urls?.join(', ') || '',
      });
      setLoading(false);
    };

    void fetchProduct();

    return () => {
      active = false;
    };
  }, [params.id]);

  if (loading) {
    return <div className="rounded-[2rem] border border-stone-200 bg-white p-8 text-stone-500">Loading product...</div>;
  }

  return (
    <ProductForm
      title="Edit product"
      submitLabel="Save changes"
      initialValues={formValues}
      mode="edit"
      productId={params.id}
    />
  );
}

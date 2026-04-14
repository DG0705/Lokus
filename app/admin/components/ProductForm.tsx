'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { sanitiseProductMutationInput } from '@/app/lib/product-mutation';

type ProductFormState = {
  name: string;
  price: string;
  description: string;
  sizes: string;
  colors: string;
  image_url: string;
  brand: string;
  gender: string;
  category: string;
  badge: string;
  is_featured: boolean;
  gallery_urls: string;
};

type ProductFormProps = {
  title: string;
  submitLabel: string;
  initialValues: ProductFormState;
  mode: 'create' | 'edit';
  productId?: string;
};

export function ProductForm({
  title,
  submitLabel,
  initialValues,
  mode,
  productId,
}: ProductFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<ProductFormState>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateField = (field: keyof ProductFormState, value: string | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = sanitiseProductMutationInput(formState);
      const response =
        mode === 'create'
          ? await fetch('/api/products', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) })
          : await fetch(`/api/products/${productId}`, {
              method: 'PATCH',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify(payload),
            });

      if (!response.ok) {
        const json = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(json?.error || 'Failed to save product.');
        setLoading(false);
        return;
      }

      router.push('/admin/products');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Catalog editor</p>
          <h1 className="mt-2 font-display text-5xl">{title}</h1>
        </div>
        <Link href="/admin/products" className="text-sm uppercase tracking-[0.2em] text-stone-600">
          Back to products
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ['name', 'Product name'],
            ['brand', 'Brand'],
            ['price', 'Price (INR)'],
            ['gender', 'Gender'],
            ['category', 'Category'],
            ['badge', 'Badge'],
            ['sizes', 'Sizes (comma separated)'],
            ['colors', 'Colors (comma separated)'],
            ['image_url', 'Primary image URL'],
            ['gallery_urls', 'Gallery image URLs (comma separated)'],
          ].map(([field, label]) => (
            <label key={field} className="text-sm">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-stone-500">{label}</span>
              <input
                type={field === 'price' ? 'number' : 'text'}
                step={field === 'price' ? '0.01' : undefined}
                value={formState[field as keyof ProductFormState] as string}
                onChange={(event) => updateField(field as keyof ProductFormState, event.target.value)}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
              />
            </label>
          ))}
        </div>

        <label className="block text-sm">
          <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-stone-500">Description</span>
          <textarea
            rows={5}
            value={formState.description}
            onChange={(event) => updateField('description', event.target.value)}
            className="w-full rounded-[1.5rem] border border-stone-200 px-4 py-3 outline-none transition focus:border-stone-900"
          />
        </label>

        <label className="flex items-center gap-3 rounded-[1.5rem] border border-stone-200 px-4 py-4">
          <input
            type="checkbox"
            checked={formState.is_featured}
            onChange={(event) => updateField('is_featured', event.target.checked)}
          />
          <span className="text-sm text-stone-700">Feature this product on the storefront</span>
        </label>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-stone-950 px-6 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-white disabled:opacity-60"
        >
          {loading ? 'Saving...' : submitLabel}
        </button>
      </form>
    </div>
  );
}

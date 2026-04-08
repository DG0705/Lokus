import { supabase } from '@/app/lib/supabase';
import type { CatalogFilterOptions, CatalogFilters, Product } from '@/app/lib/types';

function normaliseSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePriceRange(raw?: string) {
  if (!raw) return null;
  const [min, max] = raw.split('-').map((value) => Number(value));
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
}

export function parseCatalogFilters(input: Record<string, string | string[] | undefined>): CatalogFilters {
  return {
    q: normaliseSearchParam(input.q),
    brand: normaliseSearchParam(input.brand),
    gender: normaliseSearchParam(input.gender),
    category: normaliseSearchParam(input.category),
    size: normaliseSearchParam(input.size),
    price: normaliseSearchParam(input.price),
    sort: normaliseSearchParam(input.sort) || 'featured',
  };
}

export async function getProducts(filters: CatalogFilters = {}) {
  const client = await supabase();
  let query = client.from('products').select('*');

  if (filters.brand) query = query.eq('brand', filters.brand);
  if (filters.gender) query = query.eq('gender', filters.gender);
  if (filters.category) query = query.eq('category', filters.category);
  if (filters.size) query = query.contains('sizes', [Number(filters.size)]);

  const priceRange = parsePriceRange(filters.price);
  if (priceRange) {
    query = query.gte('price', priceRange.min).lte('price', priceRange.max);
  }

  if (filters.q) {
    const escaped = filters.q.replace(/,/g, ' ');
    query = query.or(`name.ilike.%${escaped}%,brand.ilike.%${escaped}%,category.ilike.%${escaped}%`);
  }

  switch (filters.sort) {
    case 'price-asc':
      query = query.order('price', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('price', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    case 'newest':
      query = query.order('id', { ascending: false });
      break;
    default:
      query = query.order('id', { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as Product[];
}

export async function getFeaturedProducts(limit = 6) {
  const client = await supabase();
  const { data, error } = await client
    .from('products')
    .select('*')
    .order('id', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Product[];
}

export async function getFilterOptions(): Promise<CatalogFilterOptions> {
  const client = await supabase();
  const { data, error } = await client.from('products').select('brand, gender, category, sizes');
  if (error || !data) {
    return { brands: [], genders: [], categories: [], sizes: [] };
  }

  const brands = new Set<string>();
  const genders = new Set<string>();
  const categories = new Set<string>();
  const sizes = new Set<number>();

  data.forEach((item) => {
    if (item.brand) brands.add(item.brand);
    if (item.gender) genders.add(item.gender);
    if (item.category) categories.add(item.category);
    if (Array.isArray(item.sizes)) {
      item.sizes.forEach((size) => {
        if (typeof size === 'number') sizes.add(size);
      });
    }
  });

  return {
    brands: Array.from(brands).sort(),
    genders: Array.from(genders).sort(),
    categories: Array.from(categories).sort(),
    sizes: Array.from(sizes).sort((a, b) => a - b),
  };
}

export async function getProductById(id: number) {
  const client = await supabase();
  const { data, error } = await client.from('products').select('*').eq('id', id).single();
  if (error || !data) return null;
  return data as Product;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const client = await supabase();
  let query = client.from('products').select('*').neq('id', product.id).limit(limit);

  if (product.brand) {
    query = query.eq('brand', product.brand);
  } else if (product.category) {
    query = query.eq('category', product.category);
  }

  const { data, error } = await query.order('is_featured', { ascending: false }).order('id', { ascending: false });
  if (error || !data || !data.length) {
    const fallback = await client
      .from('products')
      .select('*')
      .neq('id', product.id)
      .order('id', { ascending: false })
      .limit(limit);
    return (fallback.data as Product[] | null) ?? [];
  }

  return data as Product[];
}

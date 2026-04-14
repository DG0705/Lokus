import type { CatalogFilterOptions, CatalogFilters, Product } from '@/app/lib/types';
import { connectMongo } from '@/app/lib/mongoose';
import { ProductModel } from '@/app/lib/models/Product';

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

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function getProducts(filters: CatalogFilters = {}) {
  await connectMongo();

  const query: Record<string, unknown> = {};

  if (filters.brand) query.brand = filters.brand;
  if (filters.gender) query.gender = filters.gender;
  if (filters.category) query.category = filters.category;
  if (filters.size) query.sizes = Number(filters.size);

  const priceRange = parsePriceRange(filters.price);
  if (priceRange) query.price = { $gte: priceRange.min, $lte: priceRange.max };

  if (filters.q) {
    const normalized = filters.q.replace(/,/g, ' ').trim();
    if (normalized) {
      const regex = new RegExp(escapeRegex(normalized), 'i');
      query.$or = [{ name: regex }, { brand: regex }, { category: regex }];
    }
  }

  const sort =
    filters.sort === 'price-asc'
      ? { price: 1 }
      : filters.sort === 'price-desc'
        ? { price: -1 }
        : filters.sort === 'name'
          ? { name: 1 }
          : filters.sort === 'newest'
            ? { id: -1 }
            : { is_featured: -1, id: -1 };

  const products = await ProductModel.find(query).sort(sort).lean<Product[]>();
  return products;
}

export async function getFeaturedProducts(limit = 6) {
  await connectMongo();
  const products = await ProductModel.find({})
    .sort({ is_featured: -1, id: -1 })
    .limit(limit)
    .lean<Product[]>();
  return products;
}

export async function getFilterOptions(): Promise<CatalogFilterOptions> {
  await connectMongo();

  const [brands, genders, categories, sizeRows] = await Promise.all([
    ProductModel.distinct('brand', { brand: { $ne: null } }) as Promise<string[]>,
    ProductModel.distinct('gender', { gender: { $ne: null } }) as Promise<string[]>,
    ProductModel.distinct('category', { category: { $ne: null } }) as Promise<string[]>,
    ProductModel.aggregate<{ _id: number }>([
      { $match: { sizes: { $type: 'array' } } },
      { $unwind: '$sizes' },
      { $group: { _id: '$sizes' } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  return {
    brands: brands.filter(Boolean).sort(),
    genders: genders.filter(Boolean).sort(),
    categories: categories.filter(Boolean).sort(),
    sizes: sizeRows.map((row) => row._id).filter((value) => typeof value === 'number'),
  };
}

export async function getProductById(id: number) {
  await connectMongo();
  const product = await ProductModel.findOne({ id }).lean<Product | null>();
  return product;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  await connectMongo();

  const baseQuery: Record<string, unknown> = { id: { $ne: product.id } };
  if (product.brand) {
    baseQuery.brand = product.brand;
  } else if (product.category) {
    baseQuery.category = product.category;
  }

  const related = await ProductModel.find(baseQuery)
    .sort({ is_featured: -1, id: -1 })
    .limit(limit)
    .lean<Product[]>();

  if (related.length) return related;

  const fallback = await ProductModel.find({ id: { $ne: product.id } })
    .sort({ id: -1 })
    .limit(limit)
    .lean<Product[]>();
  return fallback;
}

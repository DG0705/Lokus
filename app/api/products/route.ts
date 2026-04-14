import { NextResponse } from 'next/server';

import { connectMongo } from '@/app/lib/mongoose';
import { ProductModel } from '@/app/lib/models/Product';

function parsePriceRange(raw: string | null) {
  if (!raw) return null;
  const [min, max] = raw.split('-').map((value) => Number(value));
  if (Number.isNaN(min) || Number.isNaN(max)) return null;
  return { min, max };
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: Request) {
  await connectMongo();
  const url = new URL(request.url);
  const sp = url.searchParams;

  const query: Record<string, unknown> = {};
  const brand = sp.get('brand');
  const gender = sp.get('gender');
  const category = sp.get('category');
  const size = sp.get('size');
  const q = sp.get('q');
  const price = sp.get('price');
  const sort = sp.get('sort') || 'featured';
  const limit = sp.get('limit') ? Number(sp.get('limit')) : null;
  const wantCount = sp.get('count') === '1';

  if (brand) query.brand = brand;
  if (gender) query.gender = gender;
  if (category) query.category = category;
  if (size && !Number.isNaN(Number(size))) query.sizes = Number(size);

  const range = parsePriceRange(price);
  if (range) query.price = { $gte: range.min, $lte: range.max };

  if (q) {
    const normalized = q.replace(/,/g, ' ').trim();
    if (normalized) {
      const regex = new RegExp(escapeRegex(normalized), 'i');
      query.$or = [{ name: regex }, { brand: regex }, { category: regex }];
    }
  }

  const sortSpec =
    sort === 'price-asc'
      ? { price: 1 }
      : sort === 'price-desc'
        ? { price: -1 }
        : sort === 'name'
          ? { name: 1 }
          : sort === 'newest'
            ? { id: -1 }
            : { is_featured: -1, id: -1 };

  const cursor = ProductModel.find(query).sort(sortSpec);
  const [products, count] = await Promise.all([
    (limit ? cursor.limit(limit) : cursor).lean(),
    wantCount ? ProductModel.countDocuments(query) : Promise.resolve(undefined),
  ]);
  return NextResponse.json({ products, count });
}

export async function POST(request: Request) {
  await connectMongo();
  const payload = (await request.json()) as Record<string, unknown>;

  const max = await ProductModel.findOne({}, { id: 1 }).sort({ id: -1 }).lean<{ id?: number } | null>();
  const nextId = (max?.id ?? 0) + 1;

  const created = await ProductModel.create({ ...payload, id: nextId });
  return NextResponse.json({ product: created.toObject() }, { status: 201 });
}


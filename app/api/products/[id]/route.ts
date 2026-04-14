import { NextResponse } from 'next/server';

import { connectMongo } from '@/app/lib/mongoose';
import { ProductModel } from '@/app/lib/models/Product';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  await connectMongo();
  const { id } = await context.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const product = await ProductModel.findOne({ id: numericId }).lean();
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function PATCH(request: Request, context: RouteContext) {
  await connectMongo();
  const { id } = await context.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  const update = (await request.json()) as Record<string, unknown>;
  const product = await ProductModel.findOneAndUpdate({ id: numericId }, update, { new: true }).lean();
  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ product });
}

export async function DELETE(_request: Request, context: RouteContext) {
  await connectMongo();
  const { id } = await context.params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }

  await ProductModel.deleteOne({ id: numericId });
  return NextResponse.json({ ok: true });
}


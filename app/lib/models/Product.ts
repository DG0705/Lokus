import mongoose from 'mongoose';

const { Schema, model, models } = mongoose;

export type ProductDoc = {
  id: number;
  name: string;
  price: number;
  description: string | null;
  sizes: number[] | null;
  colors: string[] | null;
  image_url: string | null;
  brand: string | null;
  gender: string | null;
  category: string | null;
  badge: string | null;
  is_featured: boolean | null;
  gallery_urls: string[] | null;
};

const ProductSchema = new Schema<ProductDoc>(
  {
    id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    description: { type: String, default: null },
    sizes: { type: [Number], default: null },
    colors: { type: [String], default: null },
    image_url: { type: String, default: null },
    brand: { type: String, default: null, index: true },
    gender: { type: String, default: null, index: true },
    category: { type: String, default: null, index: true },
    badge: { type: String, default: null },
    is_featured: { type: Boolean, default: false, index: true },
    gallery_urls: { type: [String], default: null },
  },
  { timestamps: true }
);

export const ProductModel = models.Product || model<ProductDoc>('Product', ProductSchema);


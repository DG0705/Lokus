import type { ProductMutationInput } from '@/app/lib/types';

export function sanitiseProductMutationInput(input: {
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
}): ProductMutationInput {
  return {
    name: input.name.trim(),
    price: Number(input.price),
    description: input.description.trim() || null,
    sizes: input.sizes
      .split(',')
      .map((size) => Number(size.trim()))
      .filter((size) => !Number.isNaN(size)),
    colors: input.colors
      .split(',')
      .map((color) => color.trim())
      .filter(Boolean),
    image_url: input.image_url.trim() || null,
    brand: input.brand.trim() || null,
    gender: input.gender.trim() || null,
    category: input.category.trim() || null,
    badge: input.badge.trim() || null,
    is_featured: Boolean(input.is_featured),
    gallery_urls: input.gallery_urls
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean),
  };
}

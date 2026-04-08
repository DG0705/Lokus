import { defaultProductImage } from '@/app/lib/constants';
import type { CheckoutFormValues, Product } from '@/app/lib/types';

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export function productPrimaryImage(product: Pick<Product, 'image_url' | 'gallery_urls'>) {
  return product.gallery_urls?.[0] || product.image_url || defaultProductImage;
}

export function productGallery(product: Pick<Product, 'image_url' | 'gallery_urls'>) {
  const images = [product.image_url, ...(product.gallery_urls ?? [])].filter(Boolean) as string[];
  return images.length ? Array.from(new Set(images)) : [defaultProductImage];
}

export function normaliseLabel(value: string | null | undefined, fallback: string) {
  return value?.trim() || fallback;
}

export function formatShippingAddress(values: CheckoutFormValues) {
  const lines = [
    values.fullName,
    values.addressLine1,
    values.addressLine2,
    `${values.city}, ${values.state} ${values.postalCode}`,
    `Phone: ${values.phone}`,
    `Email: ${values.email}`,
  ].filter(Boolean);

  return lines.join(', ');
}

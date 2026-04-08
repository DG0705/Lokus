export type Product = {
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

export type ProductMutationInput = {
  name: string;
  price: number;
  description: string | null;
  sizes: number[];
  colors: string[];
  image_url: string | null;
  brand: string | null;
  gender: string | null;
  category: string | null;
  badge: string | null;
  is_featured: boolean;
  gallery_urls: string[];
};

export type CatalogFilters = {
  q?: string;
  brand?: string;
  gender?: string;
  category?: string;
  size?: string;
  price?: string;
  sort?: string;
};

export type CatalogFilterOptions = {
  brands: string[];
  genders: string[];
  categories: string[];
  sizes: number[];
};

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  size: number;
  color: string;
  image_url: string | null;
  quantity: number;
  brand?: string | null;
  badge?: string | null;
};

export type OrderItem = {
  id?: number;
  product_name: string;
  product_image: string | null;
  size: number;
  color: string;
  price: number;
  quantity: number;
};

export type OrderRecord = {
  id: number;
  order_number: string;
  total_amount: number;
  status: string;
  payment_id: string | null;
  razorpay_order_id: string | null;
  shipping_address: string | null;
  created_at: string;
  order_items?: OrderItem[];
};

export type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

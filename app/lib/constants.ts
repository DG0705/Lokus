export const BRAND_NAME = 'LOKUS';

export const brandPalette = {
  obsidian: '#111111',
  graphite: '#23201d',
  ivory: '#f6f1e8',
  sand: '#d8c7ac',
  ember: '#b96a3c',
  mist: '#f0e8dc',
};

export const featuredBrandNames = ['Nike', 'Adidas', 'New Balance', 'Puma', 'Asics', 'Reebok'];

export const shopSortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'name', label: 'Name' },
] as const;

export const priceRanges = [
  { value: '0-5000', label: 'Under Rs. 5,000' },
  { value: '5000-9000', label: 'Rs. 5,000 - Rs. 9,000' },
  { value: '9000-14000', label: 'Rs. 9,000 - Rs. 14,000' },
  { value: '14000-999999', label: 'Rs. 14,000+' },
] as const;

export const defaultProductImage =
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1400&q=80';

export const navLinks = [
  { href: '/shop', label: 'Shop' },
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/new-arrivals', label: 'New Arrivals' },
  { href: '/brands', label: 'Brands' },
] as const;

export const footerShopLinks = [
  { href: '/shop', label: 'All Shoes' },
  { href: '/men', label: 'Men' },
  { href: '/women', label: 'Women' },
  { href: '/new-arrivals', label: 'New Arrivals' },
] as const;

export const footerSupportLinks = [
  { href: '/size-guide', label: 'Size Guide' },
  { href: '/returns', label: 'Returns' },
  { href: '/contact', label: 'Contact' },
  { href: '/about', label: 'About LOKUS' },
] as const;

export const collectionHighlights = [
  {
    title: 'Luxury trainers',
    eyebrow: 'Urban precision',
    description: 'Low-profile silhouettes with premium materials for city movement.',
    href: '/shop?category=Sneakers',
  },
  {
    title: 'Performance runners',
    eyebrow: 'Pace ready',
    description: 'High-cushion styles built for training days, travel days, and everything between.',
    href: '/shop?category=Running',
  },
  {
    title: 'Statement street pairs',
    eyebrow: 'After dark',
    description: 'Bold color stories and fashion-led profiles for standout rotation pieces.',
    href: '/shop?category=Streetwear',
  },
] as const;

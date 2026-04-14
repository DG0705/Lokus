import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

import { connectMongo } from '../app/lib/mongoose.ts';
import { ProductModel } from '../app/lib/models/Product.ts';

const products = [
  {
    id: 1,
    name: 'Alder Formal Oxford',
    brand: 'LOKUS Atelier',
    category: 'Formal',
    gender: 'Unisex',
    price: 7999,
    badge: 'Editor Pick',
    is_featured: true,
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ['Espresso', 'Black'],
    image_url: 'https://images.unsplash.com/photo-1614251055880-b7b3e0f8f974?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: [
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1600&q=80',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1600&q=80',
    ],
    description: 'Polished leather, clean cap-toe line, built for long workdays and sharper nights.',
  },
  {
    id: 2,
    name: 'Cinder Casual Loafer',
    brand: 'LOKUS Atelier',
    category: 'Casual',
    gender: 'Unisex',
    price: 6499,
    badge: null,
    is_featured: true,
    sizes: [6, 7, 8, 9, 10],
    colors: ['Sand', 'Stone'],
    image_url: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: null,
    description: 'Soft upper with a structured sole—easy to dress up, easier to keep on.',
  },
  {
    id: 3,
    name: 'Nova Street Sneaker',
    brand: 'Nike',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 9999,
    badge: 'New',
    is_featured: true,
    sizes: [6, 7, 8, 9, 10, 11, 12],
    colors: ['White', 'Graphite'],
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: null,
    description: 'Everyday cushioning with a clean profile that works across denim, cargos, and tailoring.',
  },
  {
    id: 4,
    name: 'Ridge Leather Boot',
    brand: 'Timberland',
    category: 'Boots',
    gender: 'Unisex',
    price: 11999,
    badge: null,
    is_featured: true,
    sizes: [7, 8, 9, 10, 11],
    colors: ['Wheat', 'Black'],
    image_url: 'https://images.unsplash.com/photo-1520256862855-398228c41684?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: null,
    description: 'Heavy-grip outsole with a premium leather upper—made for monsoons and mileage.',
  },
  {
    id: 5,
    name: 'Coast Sandal Slide',
    brand: 'Adidas',
    category: 'Sandals',
    gender: 'Unisex',
    price: 2499,
    badge: null,
    is_featured: false,
    sizes: [6, 7, 8, 9, 10, 11],
    colors: ['Black', 'Ivory'],
    image_url: 'https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: null,
    description: 'Comfort-first slides for travel days, gym exits, and weekend resets.',
  },
  {
    id: 6,
    name: 'Arc Heeled Mule',
    brand: 'LOKUS Studio',
    category: 'Heels',
    gender: 'Women',
    price: 8999,
    badge: 'Limited',
    is_featured: true,
    sizes: [5, 6, 7, 8, 9],
    colors: ['Black', 'Ember'],
    image_url: 'https://images.unsplash.com/photo-1528701800489-20be3c2ea0f7?auto=format&fit=crop&w=1600&q=80',
    gallery_urls: null,
    description: 'Minimal upper, confident heel height—built for long evenings without the compromise.',
  },
];

async function main() {
  await connectMongo();
  await ProductModel.deleteMany({});
  await ProductModel.insertMany(products);
  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products.`);
  process.exit(0);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});


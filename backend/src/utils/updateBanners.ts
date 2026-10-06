import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Banner } from '../models/Banner';
import { connectDB, closeDB } from '../config/db';

dotenv.config();

async function run() {
  await connectDB();
  console.log('Connected to DB');

  await Banner.deleteMany({});
  console.log('Cleared existing banners');

  await Banner.insertMany([
    {
      title: 'Handcrafted Luxury Epoxy Resin Art Pieces',
      subtitle: 'Custom 3D geode wall clocks, ocean wave trays, and preserved botanicals',
      badge: 'EXCLUSIVE 2026 DROP',
      image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
      linkUrl: '/shop',
      buttonText: 'Explore Resin Arts',
      position: 'hero',
      isActive: true,
      order: 1,
    },
    {
      title: 'Ocean Geode Coaster Sets & Wall Clocks',
      subtitle: 'Swirled with vibrant blue alcohol inks, real metallic gold flakes, and glass gloss finish',
      badge: 'BESTSELLER',
      image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&auto=format&fit=crop&q=80',
      linkUrl: '/shop',
      buttonText: 'Shop Custom Pieces',
      position: 'hero',
      isActive: true,
      order: 2,
    },
    {
      title: 'Monogram Keychains & Floral Preservation',
      subtitle: 'Unique handcrafted gifts cured under precision UV light with love',
      badge: 'ARTISAN CRAFTED',
      image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80',
      linkUrl: '/shop',
      buttonText: 'Custom Orders',
      position: 'promo',
      isActive: true,
      order: 3,
    },
  ]);

  console.log('✅ Updated banners in database successfully!');
  await closeDB();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

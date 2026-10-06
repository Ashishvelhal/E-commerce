import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Review } from '../models/Review';
import { Order } from '../models/Order';
import { Post } from '../models/Post';
import { Banner } from '../models/Banner';
import { Inventory } from '../models/Inventory';
import { Recipe } from '../models/Recipe';
import { BulkInquiry } from '../models/BulkInquiry';
import { Setting } from '../models/Setting';
import { connectDB, closeDB } from '../config/db';

dotenv.config();

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('🧹 Clearing existing database collections...');
    await User.deleteMany({});         await sleep(150);
    await Product.deleteMany({});      await sleep(150);
    await Category.deleteMany({});     await sleep(150);
    await Review.deleteMany({});       await sleep(150);
    await Order.deleteMany({});        await sleep(150);
    await Post.deleteMany({});         await sleep(150);
    await Banner.deleteMany({});       await sleep(150);
    await Inventory.deleteMany({});    await sleep(150);
    await Recipe.deleteMany({});       await sleep(150);
    await BulkInquiry.deleteMany({});  await sleep(150);

    console.log('👤 Creating default users (Admin & Customer)...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ecommerce.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';
    const adminUser = await User.create({
      name: 'Rasin Arts Master Artisan',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      addresses: [
        {
          street: 'Studio #402, Artisans Galleria, Linking Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    const customerUser = await User.create({
      name: 'Pooja Sharma',
      email: 'customer@ecommerce.com',
      password: 'customerpassword123',
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      phone: '+91 98201 55432',
      addresses: [
        {
          street: 'Flat 12B, Sea Crest Towers, Worli Sea Face',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400018',
          country: 'India',
          isDefault: true,
        },
      ],
    });

    console.log('⚙️ Ensuring global studio settings...');
    await Setting.findOneAndUpdate(
      { key: 'global_settings' },
      {
        storeName: 'Rasin Arts Luxury 3D Studio',
        supportEmail: 'support@rasinarts.com',
        whatsappNumber: '+91 98765 43210',
        whatsappCheckoutEnabled: true,
        whatsappCustomMessage: 'Hello Rasin Arts Studio! I would like to place an order for the following items:',
        freeShippingThreshold: 999,
        currencySymbol: 'INR (₹)',
        customizerEnabled: true,
        enabledCustomizerProducts: [
          'keychain-initial',
          'nameplate-rect',
          'thali-puja',
          'frame-photo',
          'clock-round-12',
        ],
        maintenanceMode: false,
        gstin: '27AABCR1234F1Z5',
        studioAddress: 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India',
        invoicePrefix: 'RA-',
      },
      { upsert: true, new: true }
    );

    console.log('📁 Creating handcrafted resin categories...');
    const categories = await Category.insertMany([
      {
        name: 'Resin Wall Clocks',
        slug: 'resin-clocks',
        description: 'Luxury ocean wave and geode resin wall clocks with silent sweep quartz movements and gold leaf accents',
        image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
        icon: 'Clock',
      },
      {
        name: 'Custom Nameplates',
        slug: 'custom-nameplates',
        description: 'Bespoke entrance nameplates made with seasoned teak wood, gold embossed metallic lettering, and resin art',
        image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        icon: 'Home',
      },
      {
        name: 'Pooja Thalis & Platters',
        slug: 'pooja-thalis-platters',
        description: 'Handcrafted auspicious aarti thalis, kumkum platters, and festive trays with 24K gold leaf swirls',
        image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        icon: 'Sparkles',
      },
      {
        name: 'Preservation & Frames',
        slug: 'preservation-frames',
        description: 'Forever preservation of real wedding varmala garlands, baby hospital tags, and photo keepsakes in UV epoxy resin',
        image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        icon: 'Heart',
      },
      {
        name: 'Coasters & Trays',
        slug: 'coasters-trays',
        description: 'Natural geode agate drink coasters with 24K gilded gold edges and vanity serving trays with solid brass handles',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
        icon: 'Coffee',
      },
      {
        name: 'Keychains & Accessories',
        slug: 'keychains-accessories',
        description: 'Personalized monogram alphabet initial keychains, dried floral bookmarks, and pocket charms with suede tassels',
        image: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&auto=format&fit=crop&q=80',
        icon: 'Key',
      },
      {
        name: 'Resin Jewellery',
        slug: 'resin-jewellery',
        description: 'Teardrop ocean pendants, botanical dried rose rings, and shimmer galaxy earrings in sterling silver',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        icon: 'Gem',
      },
      {
        name: 'Epoxy Tables & Furniture',
        slug: 'epoxy-tables',
        description: 'Live-edge solid wood river coffee tables with deep ocean blue pigment pours and industrial hairpin legs',
        image: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
        icon: 'Table',
      },
      {
        name: 'Mandir & Spiritual Decor',
        slug: 'mandir-spiritual-decor',
        description: 'Sacred resin mantra slabs, Ganesha idols, and auspicious temple wall hangings',
        image: 'https://images.unsplash.com/photo-1609743522653-52354461eb27?w=800&auto=format&fit=crop&q=80',
        icon: 'Sun',
      },
      {
        name: 'Corporate & Wedding Favors',
        slug: 'corporate-wedding-favors',
        description: 'Bulk handcrafted event favors, personalized coaster gift sets, and custom corporate hampers',
        image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
        icon: 'Package',
      },
    ]);

    console.log('🛍️ Seeding authentic handcrafted resin art products with 3D configs...');
    const productData = [
      {
        title: 'Sapphire Ocean Wave Geode Resin Wall Clock (12-inch)',
        slug: 'sapphire-ocean-wave-geode-resin-wall-clock-12-inch',
        description: 'Hand-poured ocean wave geode wall clock with deep sapphire blues, metallic pearl white foam lacing, natural raw quartz crystals, and 24K gold foil accents. Powered by a silent sweep high-torque quartz mechanism.',
        richDetails: 'Every clock is an individual work of art taking over 48 hours of multi-layered casting and mirror diamond edge polishing. Features non-yellowing UV-resistant epoxy resin, food-safe high-gloss finish, and brushed gold metallic needles.',
        price: 2499,
        discountPrice: 2199,
        category: 'Resin Wall Clocks',
        brand: 'Rasin Arts Studio',
        stock: 15,
        images: [
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=800&auto=format&fit=crop&q=80',
        model3d: {
          url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
          initialScale: 1.8,
          cameraPosition: [0, 0, 3.5],
          availableColors: [
            { name: 'Sapphire Ocean Blue', hex: '#0284c7' },
            { name: 'Emerald Gold Swirl', hex: '#059669' },
            { name: 'Ruby Sunset Glow', hex: '#e11d48' },
            { name: 'Galaxy Cosmic Purple', hex: '#7c3aed' },
          ],
          interactiveNodes: [
            { name: 'Silent Quartz Machine', description: 'High-torque smooth sweeping quartz movement with no ticking sound', position: [0, 0, 0.2] },
            { name: '24K Gold Roman Numerals', description: 'Embossed metallic gold markers with 3D reflection', position: [0.8, 0.6, 0.3] },
            { name: 'Natural Quartz Inlay', description: 'Genuine crushed quartz crystals sealed under crystal-clear UV resin', position: [-0.7, -0.5, 0.4] },
          ],
        },
        specifications: [
          { key: 'Diameter', value: '12 Inches (30.5 cm)' },
          { key: 'Base Material', value: '8mm Pre-Primed High-Density Engineered MDF' },
          { key: 'Resin Type', value: 'Ultra-Clear UV-Stabilized Epoxy Resin (2:1)' },
          { key: 'Mechanism', value: 'Silent Sweep Quartz (AA Battery Operated)' },
          { key: 'Inclusions', value: '24K Gold Flakes & Natural Raw Quartz' },
          { key: 'Cure Time', value: '48 Hours Studio Cure & Edge Buffing' },
        ],
        isFeatured: true,
        isTrending: true,
        ratingsAverage: 4.9,
        ratingsCount: 88,
      },
      {
        title: 'Bespoke Teak Wood & Golden Swirl Resin Nameplate',
        slug: 'bespoke-teak-wood-golden-swirl-resin-nameplate',
        description: 'Luxury handcrafted entrance nameplate crafted with natural seasoned teak wood, deep ocean resin river, and 3D mirror-gold acrylic lettering with weather-resistant outdoor sealant.',
        richDetails: 'Customized with your family name, house number, or apartment title. Sealed with two layers of automotive-grade UV polyurethane to resist sunlight, rain, and humidity for years.',
        price: 3299,
        discountPrice: 2899,
        category: 'Custom Nameplates',
        brand: 'Rasin Arts Studio',
        stock: 12,
        images: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
        model3d: {
          url: 'https://modelviewer.dev/shared-assets/models/NeilArmstrong.glb',
          initialScale: 1.5,
          cameraPosition: [0, 0.4, 3],
          availableColors: [
            { name: 'Royal Sapphire River', hex: '#1e40af' },
            { name: 'Emerald Forest River', hex: '#065f46' },
            { name: 'Pure White Marble Swirl', hex: '#f8fafc' },
            { name: 'Obsidian Black Gold', hex: '#18181b' },
          ],
          interactiveNodes: [
            { name: '3D Gold Acrylic Letters', description: 'Precision laser-cut 3mm mirror gold acrylic text', position: [0.1, 0.2, 0.5] },
            { name: 'Seasoned Teak Wood', description: 'Hand-sanded natural grain solid teak wood base', position: [-0.6, -0.3, 0.2] },
          ],
        },
        specifications: [
          { key: 'Dimensions', value: '16 x 8 Inches (40 x 20 cm)' },
          { key: 'Wood Base', value: '100% Solid Seasoned Teak Wood' },
          { key: 'Lettering', value: '3D Raised Gold Mirror Acrylic' },
          { key: 'Weatherproof', value: 'Yes - Outdoor UV & Rain Resistant Seal' },
          { key: 'Mounting', value: 'Pre-drilled brass keyhole hooks included' },
        ],
        isFeatured: true,
        isTrending: true,
        ratingsAverage: 5.0,
        ratingsCount: 64,
      },
      {
        title: 'Royal Emerald & 24K Gold Agate Coasters (Set of 4)',
        slug: 'royal-emerald-24k-gold-agate-coasters-set-of-4',
        description: 'Set of 4 natural geode slice coasters swirled with emerald green pigments, pearlescent shimmer, and hand-gilded 24K gold foil rims. Heat resistant up to 90°C for hot tea and coffee mugs.',
        richDetails: 'Each coaster is hand-cast in flexible silicone molds, resulting in a unique organic agate contour. Includes non-slip clear silicone bumper feet on the bottom to protect table surfaces.',
        price: 999,
        discountPrice: 849,
        category: 'Coasters & Trays',
        brand: 'Rasin Arts Studio',
        stock: 30,
        images: [
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80',
        model3d: {
          url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
          initialScale: 0.2,
          cameraPosition: [0, 0, 4],
          availableColors: [
            { name: 'Emerald Gold Gilt', hex: '#059669' },
            { name: 'Sapphire Silver Gilt', hex: '#2563eb' },
            { name: 'Rose Quartz Copper', hex: '#fb7185' },
            { name: 'Amethyst Violet', hex: '#9333ea' },
          ],
          interactiveNodes: [
            { name: 'Gilded Gold Edge', description: 'Liquid leaf 24K gold painted and sealed rim', position: [0.5, 0.3, 0.4] },
            { name: 'Heat Proof Resin', description: 'Thermal resistant up to 90°C', position: [-0.2, -0.4, 0.2] },
          ],
        },
        specifications: [
          { key: 'Quantity', value: 'Set of 4 Coasters' },
          { key: 'Diameter', value: '4 to 4.5 Inches per slice' },
          { key: 'Heat Resistance', value: 'Safe up to 90°C (Hot Cups Safe)' },
          { key: 'Edge Finish', value: '24K Liquid Gold Leaf Rim' },
          { key: 'Packaging', value: 'Premium Luxury Velvet Gift Box' },
        ],
        isFeatured: true,
        isTrending: true,
        ratingsAverage: 4.9,
        ratingsCount: 112,
      },
      {
        title: 'Auspicious Golden Leaf Pooja Thali & Aarti Platter',
        slug: 'auspicious-golden-leaf-pooja-thali-aarti-platter',
        description: 'Exquisite 11-inch festive Pooja Thali with hand-swirled saffron, ruby red, and pure 24K gold leaf flakes. Features integrated brass diya holders and solid carved lotus handles.',
        richDetails: 'Designed for Diwali pooja, Karwa Chauth, Raksha Bandhan, and housewarming ceremonies. Food-safe high-gloss epoxy finish easy to wipe clean after kumkum and haldi rituals.',
        price: 1999,
        discountPrice: 1699,
        category: 'Pooja Thalis & Platters',
        brand: 'Rasin Arts Studio',
        stock: 20,
        images: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Plate Diameter', value: '11 Inches (28 cm)' },
          { key: 'Handles', value: 'Solid Cast Brass Lotus Handles' },
          { key: 'Finish', value: 'High Gloss Food-Safe UV Resin' },
          { key: 'Care Instructions', value: 'Wipe with damp microfiber cloth. Do not soak.' },
        ],
        isFeatured: true,
        isTrending: false,
        ratingsAverage: 4.8,
        ratingsCount: 45,
      },
      {
        title: 'Wedding Garland Botanical Preservation Photo Frame (9x9")',
        slug: 'wedding-garland-botanical-preservation-photo-frame-9x9',
        description: 'Custom preservation keepsake frame where your actual dried wedding varmala roses, baby footprints, or anniversary petals are cast forever under diamond-clear deep pour resin.',
        richDetails: 'Our studio uses clinical silica dehydration to lock in 100% of flower colors before casting. Includes a customized metallic photo print and personalized gold calligraphy couple plaque.',
        price: 2799,
        discountPrice: 2499,
        category: 'Preservation & Frames',
        brand: 'Rasin Arts Studio',
        stock: 10,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Frame Size', value: '9 x 9 Inches (Depth: 1.5 Inches)' },
          { key: 'Drying Technique', value: 'Silica Gel Cryo-Dehydration (Preserves Color)' },
          { key: 'Resin Type', value: 'Non-Yellowing UV Crystal Deep Pour' },
          { key: 'Inclusions', value: 'Real Dried Flowers, Photo Print & Gold Plaque' },
        ],
        isFeatured: true,
        isTrending: true,
        ratingsAverage: 5.0,
        ratingsCount: 52,
      },
      {
        title: 'Personalized Initial Monogram Resin Keychain with 24K Gold',
        slug: 'personalized-initial-monogram-resin-keychain-with-24k-gold',
        description: 'Handcrafted crystal resin initial letter keychain with real dried baby’s breath flowers, 24K gold foil flakes, gold swivel lobster clasp, and matching suede leather tassel.',
        richDetails: 'The ultimate bespoke personalized gift for birthdays, return gifts, bridesmaids, and vehicle keys. Lightweight, shatterproof, and finished with a diamond gloss coat.',
        price: 349,
        discountPrice: 299,
        category: 'Keychains & Accessories',
        brand: 'Rasin Arts Studio',
        stock: 100,
        images: [
          'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Letter Height', value: '4 cm (1.6 Inches)' },
          { key: 'Hardware', value: 'Anti-Rust Gold Swivel Lobster Ring' },
          { key: 'Tassel', value: 'Genuine Suede Leather Tassel' },
          { key: 'Inclusions', value: 'Dried Flowers & 24K Gold Flakes' },
        ],
        isFeatured: false,
        isTrending: true,
        ratingsAverage: 4.9,
        ratingsCount: 140,
      },
      {
        title: 'Galaxy Violet Geode Vanity Serving Tray with Brass Handles',
        slug: 'galaxy-violet-geode-vanity-serving-tray-with-brass-handles',
        description: 'Luxurious 14-inch vanity serving platter with deep cosmic violet pigment swirls, natural raw amethyst cluster inlay, and heavy-duty brushed brass handles.',
        richDetails: 'Ideal for dining room appetizers, perfume dresser organizing, or festive dry fruit presentations. Solid 12mm resin casting resistant to scratches.',
        price: 2699,
        discountPrice: 2299,
        category: 'Coasters & Trays',
        brand: 'Rasin Arts Studio',
        stock: 14,
        images: [
          'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Dimensions', value: '14 x 8 Inches (35 x 20 cm)' },
          { key: 'Handles', value: 'Solid Heavy Brushed Gold Brass' },
          { key: 'Crystals', value: 'Natural Raw Amethyst Inlay' },
          { key: 'Weight', value: '1.4 kg' },
        ],
        isFeatured: false,
        isTrending: false,
        ratingsAverage: 4.7,
        ratingsCount: 38,
      },
      {
        title: 'Live-Edge Teak Wood Ocean Blue River Coffee Table',
        slug: 'live-edge-teak-wood-ocean-blue-river-coffee-table',
        description: 'Statement centerpiece coffee table featuring two slabs of seasoned natural live-edge teak wood split by a 2-inch deep ocean river pour with multi-depth wave cells and matte black steel hairpin legs.',
        richDetails: 'Handcrafted over 14 days in our workshop. Each slab is vacuum impregnated with clear resin to stabilize wood pores before the final gloss flood coat.',
        price: 14999,
        discountPrice: 12499,
        category: 'Epoxy Tables & Furniture',
        brand: 'Rasin Arts Studio',
        stock: 4,
        images: [
          'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1000&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1580481077195-73ab01306321?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Dimensions', value: '36" L x 20" W x 18" H' },
          { key: 'Wood', value: '100% Solid Seasoned Live-Edge Teak' },
          { key: 'Pour Depth', value: '2-Inch Single Deep Cast' },
          { key: 'Legs', value: 'Heavy-Duty 3-Rod Solid Metal Hairpin Legs' },
        ],
        isFeatured: true,
        isTrending: false,
        ratingsAverage: 5.0,
        ratingsCount: 19,
      },
      {
        title: 'Ocean Wave Teardrop Resin & Sterling Silver Pendant',
        slug: 'ocean-wave-teardrop-resin-sterling-silver-pendant',
        description: 'Micro resin art pendant capturing realistic ocean beach sand, white water foam wave, and crystal turquoise water. Suspended on a pure 925 sterling silver chain.',
        richDetails: 'Lightweight and waterproof jewellery piece. Cast with hypoallergenic jewellery-grade UV resin that never turns yellow or loses its glass luster.',
        price: 799,
        discountPrice: 649,
        category: 'Resin Jewellery',
        brand: 'Rasin Arts Studio',
        stock: 45,
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Pendant Size', value: '25mm x 15mm Teardrop' },
          { key: 'Chain Material', value: '925 Sterling Silver (18 Inches)' },
          { key: 'Inclusions', value: 'Real Beach Sand & Mineral Pigments' },
        ],
        isFeatured: false,
        isTrending: true,
        ratingsAverage: 4.8,
        ratingsCount: 77,
      },
      {
        title: 'Newborn Baby Footprint & Hospital Tag Memorial Block',
        slug: 'newborn-baby-footprint-hospital-tag-memorial-block',
        description: 'Freestanding 3D resin memorial block preserving your baby’s hospital birth band, first lock of hair, hospital footprint card, and 24K gold foil birth metrics (weight, date, time).',
        richDetails: 'A priceless keepsake for new parents and grandparents. Mirror polished on all 6 sides for an immaculate optical museum-grade look.',
        price: 1899,
        discountPrice: 1599,
        category: 'Preservation & Frames',
        brand: 'Rasin Arts Studio',
        stock: 25,
        images: [
          'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1000&auto=format&fit=crop&q=80',
        ],
        thumbnail: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80',
        specifications: [
          { key: 'Dimensions', value: '6 x 6 Inches (Depth: 1.25 Inches)' },
          { key: 'Style', value: 'Freestanding Optical Clear Cube' },
          { key: 'Lettering', value: '24K Metallic Gold Calligraphy' },
        ],
        isFeatured: false,
        isTrending: false,
        ratingsAverage: 4.9,
        ratingsCount: 31,
      },
    ];

    const products: any[] = [];
    const BATCH = 2;
    for (let i = 0; i < productData.length; i += BATCH) {
      const batch = productData.slice(i, i + BATCH);
      const inserted = await Product.insertMany(batch);
      products.push(...inserted);
      await sleep(300);
    }

    console.log('⭐ Seeding verified customer reviews with spatial annotations...');
    await Review.insertMany([
      {
        user: customerUser._id,
        customerName: 'Pooja Sharma',
        product: products[0]._id,
        rating: 5,
        title: 'Looks Absolutely Breathtaking on Our Living Room Wall!',
        comment: 'The depth of the sapphire resin and the gold numbers look so luxurious in person! The silent quartz machine does not make any ticking noise at all. The 3D customizer preview matched the delivered clock 100%.',
        modelAnnotation: {
          point: [0.8, 0.6, 0.3],
          label: '24K gold markers reflect light beautifully',
        },
        verifiedPurchase: true,
      },
      {
        user: adminUser._id,
        customerName: 'Rohan & Ananya Mehta',
        product: products[1]._id,
        rating: 5,
        title: 'Superb Quality Teak Wood Nameplate!',
        comment: 'We ordered this for our new apartment in Worli. The resin river swirl is mesmerizing and the raised gold letters give a royal touch to our entrance door. Packaging was rock solid with 3 layers of bubble wrap.',
        modelAnnotation: {
          point: [0.1, 0.2, 0.5],
          label: 'Crisp 3D mirror gold acrylic name lettering',
        },
        verifiedPurchase: true,
      },
      {
        user: customerUser._id,
        customerName: 'Dr. Vikram Singhania',
        product: products[2]._id,
        rating: 5,
        title: 'Perfect Luxury Gift Set for Our Anniversary',
        comment: 'The emerald green with 24K gold foil rims looks like real polished gemstones on our marble table. No heat marks even with hot coffee mugs. Highly recommended!',
        modelAnnotation: {
          point: [0.5, 0.3, 0.4],
          label: 'Gilded gold leaf edge is perfectly sealed',
        },
        verifiedPurchase: true,
      },
    ]);

    console.log('📝 Seeding artisan resin blog stories & guides...');
    await Post.insertMany([
      {
        title: 'The Sacred Art of Preserving Wedding Garlands in Crystal-Clear UV Resin',
        slug: 'preserving-wedding-garlands-in-crystal-clear-resin',
        summary: 'How our master artisans dehydrate real wedding varmala flowers and cast them into heirloom keepsakes that last for generations.',
        content: `Your wedding garland represents one of the most sacred moments of your life. While natural flowers wither away in days, modern resin preservation technology allows couples to preserve their wedding varmala roses, jasmine petals, and bridal flowers in high-gloss, crystal-clear 3D blocks forever.\n\n### The 4-Stage Preservation Process\n\n1. **Cryo-Silica Dehydration (7 to 10 Days)**: Fresh flowers are gently buried in microscopic silica crystals to extract 100% moisture while preserving their natural shape and vibrant pigments.\n2. **Color Sealing Barrier**: Flowers are treated with UV protective sealants to prevent discoloration when contacting liquid epoxy.\n3. **Multi-Layer Deep Pour Casting**: Poured in thin, bubble-free 1-inch layers cured under temperature-controlled workshop ovens.\n4. **Diamond Edge Buffing**: Hand-sanded through 9 grit levels up to 3000P for a glass-smooth mirror shine.\n\nVisit our Preservation collection or 3D customizer to immortalize your memories today!`,
        bannerImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&auto=format&fit=crop&q=80',
        author: adminUser._id,
        category: 'Artisan Workshop',
        tags: ['Resin Preservation', 'Wedding Flowers', 'Keepsakes', 'Handmade'],
        isPublished: true,
        featuredProduct: products[4]._id,
      },
      {
        title: 'Creating Deep Ocean Wave Geode Clocks: The Secret to Realistic Foam Lacing',
        slug: 'creating-deep-ocean-wave-geode-clocks-foam-lacing',
        summary: 'A look inside our studio: how we use heat guns, alcohol inks, and white pigment paste to create realistic ocean foam lacing.',
        content: `Creating realistic ocean resin waves requires precise temperature control and viscosity timing.\n\n### The Recipe for Ocean Foam\n- **Base Layer**: Deep navy and turquoise tinted resin poured over primed board.\n- **Lacing Line**: A thin ribbon of high-density titanium white pigment paste mixed with fast-cure resin.\n- **Heat Activation**: Using a 45-degree heat gun swipe at 350°C to push the white layer across the blue, triggering organic cellular webbing that mimics real ocean surf.\n\nExplore our bespoke Geode Wall Clocks in full 3D!`,
        bannerImage: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=1200&auto=format&fit=crop&q=80',
        author: adminUser._id,
        category: 'Masterclass',
        tags: ['Resin Clocks', 'Ocean Wave', 'Techniques', 'Artisan'],
        isPublished: true,
        featuredProduct: products[0]._id,
      },
    ]);

    console.log('🖼️ Seeding luxury resin promotional banners...');
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
        title: '🎨 3D Live Customizer & Co-Creator Studio',
        subtitle: 'Design your custom nameplate, keychain, or geode clock in real-time 3D with live price calculation',
        badge: 'INTERACTIVE STUDIO',
        image: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1600&auto=format&fit=crop&q=80',
        linkUrl: '/customizer',
        buttonText: 'Open 3D Customizer',
        position: 'hero',
        isActive: true,
        order: 2,
      },
      {
        title: '🏢 Bespoke Corporate Gifting & Wedding Favors',
        subtitle: 'Volume discounts up to 35% off with custom metallic company logos and luxury velvet packaging',
        badge: 'BULK B2B ORDERS',
        image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1600&auto=format&fit=crop&q=80',
        linkUrl: '/bulk-gifting',
        buttonText: 'Calculate Bulk Pricing',
        position: 'promo',
        isActive: true,
        order: 3,
      },
    ]);

    console.log('📦 Seeding sample handcrafted resin orders...');
    await Order.create({
      user: customerUser._id,
      customerName: 'Pooja Sharma',
      customerPhone: '+91 98201 55432',
      customerEmail: 'customer@ecommerce.com',
      orderItems: [
        {
          product: products[0]._id,
          name: products[0].title,
          quantity: 1,
          price: 2199,
          image: products[0].thumbnail,
          selectedColor: 'Sapphire Ocean Blue',
        },
        {
          product: products[2]._id,
          name: products[2].title,
          quantity: 1,
          price: 849,
          image: products[2].thumbnail,
          selectedColor: 'Emerald Gold Gilt',
        },
      ],
      shippingAddress: {
        fullName: 'Pooja Sharma',
        street: 'Flat 12B, Sea Crest Towers, Worli Sea Face',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400018',
        country: 'India',
        phone: '+91 98201 55432',
        email: 'customer@ecommerce.com',
      },
      paymentMethod: 'CreditCard',
      itemsPrice: 3048,
      taxPrice: 548,
      shippingPrice: 0,
      totalPrice: 3596,
      isPaid: true,
      paidAt: new Date(),
      status: 'Processing',
      trackingNumber: 'BLUEDART-9842109',
    });

    console.log('📦 Seeding raw workshop inventory materials...');
    await Inventory.insertMany([
      {
        name: 'Ultra-Clear Epoxy Resin 2:1 (Part A + B)',
        category: 'Resin & Hardener',
        type: 'Liquid',
        unit: 'g',
        currentStock: 8500,
        minStockAlert: 2000,
        purchasePrice: 1600,
        purchaseQuantity: 2000,
        costPerUnit: 0.8,
        supplier: 'AeroResin Lab Supplies Mumbai',
        location: 'Bay A - Shelf 1',
        notes: '2:1 mixing ratio. Ultra clear UV resistant casting resin for clocks and nameplates.',
      },
      {
        name: 'Deep Pour River Table Epoxy 3:1',
        category: 'Resin & Hardener',
        type: 'Liquid',
        unit: 'g',
        currentStock: 12000,
        minStockAlert: 3000,
        purchasePrice: 4800,
        purchaseQuantity: 6000,
        costPerUnit: 0.8,
        supplier: 'Polymer Craft Hub Gujarat',
        location: 'Bay A - Floor Pallet',
        notes: 'Up to 2-inch single pour depth. 72hr slow cure for large furniture tables.',
      },
      {
        name: 'Aztec Gold Ultra-Shimmer Mica Powder',
        category: 'Pigments & Inks',
        type: 'Powder',
        unit: 'g',
        currentStock: 250,
        minStockAlert: 50,
        purchasePrice: 500,
        purchaseQuantity: 100,
        costPerUnit: 5.0,
        supplier: 'ColorArt Pigments Delhi',
        location: 'Pigment Rack 2',
        notes: 'Cosmetic grade natural mineral mica for gold swirls and veins.',
      },
      {
        name: 'Sapphire Blue Ocean Alcohol Drop Ink',
        category: 'Pigments & Inks',
        type: 'Liquid',
        unit: 'ml',
        currentStock: 45,
        minStockAlert: 30,
        purchasePrice: 360,
        purchaseQuantity: 60,
        costPerUnit: 6.0,
        supplier: 'FluidCrafts Ltd',
        location: 'Pigment Rack 1',
        notes: 'Vibrant translucent blue alcohol ink for petri dish and ocean depth.',
      },
      {
        name: 'Titanium White Ocean Wave Lacing Paste',
        category: 'Pigments & Inks',
        type: 'Liquid',
        unit: 'g',
        currentStock: 120,
        minStockAlert: 40,
        purchasePrice: 380,
        purchaseQuantity: 100,
        costPerUnit: 3.8,
        supplier: 'FluidCrafts Ltd',
        location: 'Pigment Rack 1',
        notes: 'High-density opaque white paste for creating realistic ocean foam cells.',
      },
      {
        name: '24K Imitation Gold & Silver Leaf Flakes',
        category: 'Pigments & Inks',
        type: 'Solid',
        unit: 'g',
        currentStock: 80,
        minStockAlert: 20,
        purchasePrice: 400,
        purchaseQuantity: 50,
        costPerUnit: 8.0,
        supplier: 'Artisans Leaf Supply',
        location: 'Drawer Gold 1',
        notes: 'Ultra-thin gold flakes for embedding in initial keychains & thalis.',
      },
      {
        name: 'Dried Botanical Flowers & Baby’s Breath Assortment',
        category: 'Pigments & Inks',
        type: 'Solid',
        unit: 'pack',
        currentStock: 15,
        minStockAlert: 5,
        purchasePrice: 750,
        purchaseQuantity: 5,
        costPerUnit: 150.0,
        supplier: 'FloraPreserve Farms Pune',
        location: 'Dry Box Shelf 3',
        notes: 'Silica dehydrated colorful petals and baby breath for floral preservation.',
      },
      {
        name: 'Natural Raw Amethyst & Quartz Crystal Clusters',
        category: 'Pigments & Inks',
        type: 'Solid',
        unit: 'g',
        currentStock: 600,
        minStockAlert: 150,
        purchasePrice: 900,
        purchaseQuantity: 300,
        costPerUnit: 3.0,
        supplier: 'Crystal Gems Jaipur',
        location: 'Crystal Bin B',
        notes: 'Genuine crushed quartz and raw amethyst points for luxury geode art.',
      },
      {
        name: '12-inch Round Primed MDF Clock Base Board',
        category: 'Hardware & Findings',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 35,
        minStockAlert: 10,
        purchasePrice: 2450,
        purchaseQuantity: 14,
        costPerUnit: 175.0,
        supplier: 'CraftWood Works',
        location: 'Bay B - Base Rack',
        notes: '8mm thick pre-primed round MDF base board with center shaft hole.',
      },
      {
        name: 'Silent Quartz High-Torque Clock Movement Machine',
        category: 'Hardware & Findings',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 40,
        minStockAlert: 15,
        purchasePrice: 1400,
        purchaseQuantity: 20,
        costPerUnit: 70.0,
        supplier: 'ChronoParts India',
        location: 'Hardware Bin A',
        notes: 'High torque silent sweep mechanism with zero ticking sound.',
      },
      {
        name: 'Brushed Brass Clock Needles Set (Hour/Min/Sec)',
        category: 'Hardware & Findings',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 50,
        minStockAlert: 15,
        purchasePrice: 750,
        purchaseQuantity: 25,
        costPerUnit: 30.0,
        supplier: 'ChronoParts India',
        location: 'Hardware Bin A',
        notes: 'Brushed brass metallic gold clock hands.',
      },
      {
        name: 'Solid Cast Brass Lotus Handles for Trays',
        category: 'Hardware & Findings',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 28,
        minStockAlert: 10,
        purchasePrice: 2800,
        purchaseQuantity: 10,
        costPerUnit: 280.0,
        supplier: 'BrassCraft Moradabad',
        location: 'Hardware Bin B',
        notes: 'Solid heavy cast brass handles with mounting screws for thalis and platters.',
      },
      {
        name: 'Gold Swivel Lobster Keychain Rings & Suede Tassels',
        category: 'Hardware & Findings',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 300,
        minStockAlert: 50,
        purchasePrice: 660,
        purchaseQuantity: 100,
        costPerUnit: 6.6,
        supplier: 'HardwareCraft Wholesale',
        location: 'Hardware Bin C',
        notes: 'Gold clasp rings and matching genuine suede tassels for alphabet keychains.',
      },
      {
        name: 'Luxury Black Velvet Gift Pouches with Gold Cord',
        category: 'Packaging & Shipping',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 180,
        minStockAlert: 50,
        purchasePrice: 900,
        purchaseQuantity: 100,
        costPerUnit: 9.0,
        supplier: 'PackStudio Mumbai',
        location: 'Packing Station Shelf',
        notes: 'Custom velvet pouches for keychains, coasters, and jewellery items.',
      },
      {
        name: 'Rigid Gold-Embossed Parcel Gift Boxes (14x14")',
        category: 'Packaging & Shipping',
        type: 'Units/Pieces',
        unit: 'pcs',
        currentStock: 60,
        minStockAlert: 20,
        purchasePrice: 2400,
        purchaseQuantity: 40,
        costPerUnit: 60.0,
        supplier: 'PackStudio Mumbai',
        location: 'Packing Station Shelf',
        notes: 'Heavy rigid boxes with high-density foam cushioning for 12" wall clocks.',
      },
    ]);

    console.log('📋 Creating BOM multi-material resin product recipes...');
    await Recipe.insertMany([
      {
        name: 'Sapphire Ocean Geode Clock (12-inch)',
        slug: 'sapphire-ocean-geode-clock-12-inch',
        productType: 'clock',
        description: 'Complete 12-inch ocean wave geode resin wall clock with quartz crystals and gold foil.',
        materials: [
          { name: 'Ultra-Clear Epoxy Resin 2:1 (Part A + B)', quantity: 280, unit: 'g', costPerUnit: 0.8 },
          { name: 'Aztec Gold Ultra-Shimmer Mica Powder', quantity: 12, unit: 'g', costPerUnit: 5.0 },
          { name: 'Sapphire Blue Ocean Alcohol Drop Ink', quantity: 6, unit: 'ml', costPerUnit: 6.0 },
          { name: 'Titanium White Ocean Wave Lacing Paste', quantity: 4, unit: 'g', costPerUnit: 3.8 },
          { name: 'Natural Raw Amethyst & Quartz Crystal Clusters', quantity: 25, unit: 'g', costPerUnit: 3.0 },
          { name: 'Silent Quartz High-Torque Clock Movement Machine', quantity: 1, unit: 'pcs', costPerUnit: 70.0 },
          { name: 'Brushed Brass Clock Needles Set (Hour/Min/Sec)', quantity: 1, unit: 'pcs', costPerUnit: 30.0 },
          { name: '12-inch Round Primed MDF Clock Base Board', quantity: 1, unit: 'pcs', costPerUnit: 175.0 },
          { name: 'Rigid Gold-Embossed Parcel Gift Boxes (14x14")', quantity: 1, unit: 'pcs', costPerUnit: 60.0 },
        ],
        laborMinutes: 50,
        laborRatePerHour: 220,
        packagingCost: 45,
        studioOverhead: 30,
        defaultCureHours: 48,
        suggestedRetailPrice: 2499,
        tags: ['clock', 'ocean-wave', 'geode', 'bestseller'],
      },
      {
        name: 'Royal Emerald Geode Coasters (Set of 4)',
        slug: 'royal-emerald-geode-coasters-set-of-4',
        productType: 'coaster',
        description: 'Set of 4 organic agate geode slice coasters with gilded 24K gold foil rims.',
        materials: [
          { name: 'Ultra-Clear Epoxy Resin 2:1 (Part A + B)', quantity: 180, unit: 'g', costPerUnit: 0.8 },
          { name: 'Aztec Gold Ultra-Shimmer Mica Powder', quantity: 8, unit: 'g', costPerUnit: 5.0 },
          { name: '24K Imitation Gold & Silver Leaf Flakes', quantity: 3, unit: 'g', costPerUnit: 8.0 },
          { name: 'Luxury Black Velvet Gift Pouches with Gold Cord', quantity: 1, unit: 'pcs', costPerUnit: 9.0 },
        ],
        laborMinutes: 30,
        laborRatePerHour: 180,
        packagingCost: 25,
        studioOverhead: 15,
        defaultCureHours: 24,
        suggestedRetailPrice: 999,
        tags: ['coasters', 'emerald', 'set-of-4', 'gifting'],
      },
      {
        name: 'Custom Alphabet Initial Keychain',
        slug: 'custom-alphabet-initial-keychain',
        productType: 'keychain',
        description: 'Personalized monogram resin initial letter keychain with dried flowers and gold flakes.',
        materials: [
          { name: 'Ultra-Clear Epoxy Resin 2:1 (Part A + B)', quantity: 25, unit: 'g', costPerUnit: 0.8 },
          { name: '24K Imitation Gold & Silver Leaf Flakes', quantity: 1, unit: 'g', costPerUnit: 8.0 },
          { name: 'Dried Botanical Flowers & Baby’s Breath Assortment', quantity: 0.1, unit: 'pack', costPerUnit: 150.0 },
          { name: 'Gold Swivel Lobster Keychain Rings & Suede Tassels', quantity: 1, unit: 'pcs', costPerUnit: 6.6 },
          { name: 'Luxury Black Velvet Gift Pouches with Gold Cord', quantity: 1, unit: 'pcs', costPerUnit: 9.0 },
        ],
        laborMinutes: 15,
        laborRatePerHour: 150,
        packagingCost: 10,
        studioOverhead: 8,
        defaultCureHours: 24,
        suggestedRetailPrice: 349,
        tags: ['keychain', 'monogram', 'custom', 'affordable'],
      },
      {
        name: 'Wedding Garland Preservation Frame (9x9")',
        slug: 'wedding-garland-preservation-frame-9x9',
        productType: 'frame',
        description: 'Deep pour keepsake block preserving real wedding roses with custom couple plaque.',
        materials: [
          { name: 'Ultra-Clear Epoxy Resin 2:1 (Part A + B)', quantity: 450, unit: 'g', costPerUnit: 0.8 },
          { name: '24K Imitation Gold & Silver Leaf Flakes', quantity: 4, unit: 'g', costPerUnit: 8.0 },
          { name: 'Rigid Gold-Embossed Parcel Gift Boxes (14x14")', quantity: 1, unit: 'pcs', costPerUnit: 60.0 },
        ],
        laborMinutes: 60,
        laborRatePerHour: 250,
        packagingCost: 50,
        studioOverhead: 35,
        defaultCureHours: 72,
        suggestedRetailPrice: 2799,
        tags: ['preservation', 'wedding', 'keepsake', 'luxury'],
      },
    ]);

    console.log('🏢 Seeding initial B2B corporate & wedding gifting leads...');
    await BulkInquiry.insertMany([
      {
        name: 'Siddharth Deshmukh',
        email: 'siddharth.d@techmahindra.com',
        phone: '+91 98200 44321',
        companyOrEvent: 'Tech Mahindra Corporate Diwali Gifting',
        eventType: 'Diwali & Festive Hampers',
        productInterest: 'Agate Geode Coasters Set (Gold Foil Edge)',
        estimatedQuantity: 150,
        targetDate: '2026-10-15',
        budgetRange: '₹1,00,000 - ₹1,50,000',
        customizationDetails: 'Need emerald green and sapphire blue geode coasters with Tech Mahindra metallic gold logo printed in the center and packed in individual luxury velvet boxes.',
        status: 'Quoted',
        notes: 'Digital 3D render sample shared with Siddharth on WhatsApp. Awaiting approval from procurement team.',
      },
      {
        name: 'Sneha & Rohit Wedding Planners',
        email: 'weddings@sneharohit.com',
        phone: '+91 99301 22849',
        companyOrEvent: 'Rohit & Sneha Destination Wedding (Udaipur)',
        eventType: 'Wedding Favors & Return Gifts',
        productInterest: 'Custom Initial/Logo Resin Keychains',
        estimatedQuantity: 250,
        targetDate: '2026-11-20',
        budgetRange: '₹60,000 - ₹80,000',
        customizationDetails: 'Initial monogram letters for all 250 wedding guests with 24K pure gold leaf and dried baby breath flowers in ivory velvet pouches.',
        status: 'In Production',
        notes: '50% advance received. Initial casting underway on Tray #3 in the workshop.',
      },
      {
        name: 'Meera Kapoor',
        email: 'meera.kapoor@oberoihotels.com',
        phone: '+91 98110 99876',
        companyOrEvent: 'The Oberoi Luxury Suites Mumbai',
        eventType: 'VIP Client Appreciation',
        productInterest: 'Bespoke Resin Desk Clocks',
        estimatedQuantity: 35,
        targetDate: '2026-10-01',
        budgetRange: '₹70,000 - ₹90,000',
        customizationDetails: 'Executive ocean wave desk clocks with silent quartz movement and custom brass plaque with room suite numbers.',
        status: 'New',
        notes: 'New inquiry received via bulk gifting calculator. Need to follow up with WhatsApp quotation.',
      },
    ]);

    console.log('✅ Handcrafted Resin Arts database successfully seeded!');
    console.log('----------------------------------------------------');
    console.log('🔑 Demo Admin Credentials:');
    console.log('   Email: admin@ecommerce.com');
    console.log('   Password: adminpassword123');
    console.log('🔑 Demo Customer Credentials:');
    console.log('   Email: customer@ecommerce.com');
    console.log('   Password: customerpassword123');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run if directly executed
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('Seeder process complete!');
    process.exit(0);
  });
}

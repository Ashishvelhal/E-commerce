import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { loginRateLimiter, adminApiRateLimiter, publicApiRateLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import reviewRoutes from './routes/reviewRoutes';
import orderRoutes from './routes/orderRoutes';
import postRoutes from './routes/postRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import bannerRoutes from './routes/bannerRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import studioNoteRoutes from './routes/studioNoteRoutes';
import recipeRoutes from './routes/recipeRoutes';
import settingRoutes from './routes/settingRoutes';
import bulkInquiryRoutes from './routes/bulkInquiryRoutes';

dotenv.config();

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(o => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET === 'fallback_secret' || JWT_SECRET.length < 32) {
  console.error('\n🔴 SECURITY ERROR: JWT_SECRET is missing, too short, or uses the insecure default.');
  console.error('   Add a strong random secret to your .env file:');
  console.error('   JWT_SECRET=<at least 32 random chars>\n');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  } else {
    console.warn('⚠️  Running in dev mode with weak secret — NOT safe for production.\n');
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

import { User } from './models/User';
import { Category } from './models/Category';
import { seedDatabase } from './utils/seeder';

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: false,
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        ALLOWED_ORIGINS.includes('*') ||
        ALLOWED_ORIGINS.includes(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.includes('localhost') ||
        cleanOrigin.includes('127.0.0.1')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsPath = path.join(process.cwd(), 'uploads');
app.use('/uploads', express.static(uploadsPath));

app.use('/api/auth/login',    loginRateLimiter);
app.use('/api/auth/register', loginRateLimiter);

app.use('/api/auth',      authRoutes);
app.use('/api/products',  publicApiRateLimiter, productRoutes);
app.use('/api/reviews',   publicApiRateLimiter, reviewRoutes);
app.use('/api/orders',    publicApiRateLimiter, orderRoutes);
app.use('/api/posts',     publicApiRateLimiter, postRoutes);
app.use('/api/analytics', adminApiRateLimiter,  analyticsRoutes);
app.use('/api/upload',    adminApiRateLimiter,  uploadRoutes);
app.use('/api/banners',   publicApiRateLimiter, bannerRoutes);
app.use('/api/inventory', adminApiRateLimiter,  inventoryRoutes);
app.use('/api/studio-notes', adminApiRateLimiter, studioNoteRoutes);
app.use('/api/recipes', adminApiRateLimiter, recipeRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/bulk-inquiries', bulkInquiryRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Rasin Arts API',
  });
});

app.use(errorHandler);

connectDB().then(async () => {
  try {
    const userCount = await User.countDocuments();
    const legacyCategory = await Category.findOne({ slug: 'audio-sound' });
    if (userCount === 0 || legacyCategory) {
      console.log('🌱 Database is empty or contains legacy template data, auto-seeding 100% handcrafted resin arts collection...');
      await seedDatabase();
    }
  } catch (err) {
    console.warn('⚠️  Seeder skipped (will retry on next restart):', (err as Error).message);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
    console.log(`📍 API: http://localhost:${PORT}/api`);
    console.log(`🔒 CORS allowed origins: ${ALLOWED_ORIGINS.join(', ')}`);
  });
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

export default app;

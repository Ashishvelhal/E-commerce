import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import path from 'path';
import fs from 'fs';

let mongod: MongoMemoryServer | null = null;

export const connectDB = async (retries = 3): Promise<void> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      let uri = process.env.MONGODB_URI || process.env.MONGO_URI;

      if (!uri || uri.trim() === '') {
        if (!mongod) {
          const homeDir = process.env.APPDATA || process.env.HOME || process.cwd();
          const localDbPath = process.env.DATA_DIR || path.join(homeDir, '.rasin_arts_studio_data');

          if (!fs.existsSync(localDbPath)) {
            fs.mkdirSync(localDbPath, { recursive: true });
          }

          console.log(`📁 Using Local Persistent Folder for Database: ${localDbPath}`);
          mongod = await MongoMemoryServer.create({
            instance: {
              dbName: 'rasinarts',
              dbPath: localDbPath,
            },
          });
        }
        uri = mongod.getUri();
        console.log(`🚀 Embedded Local Database active at: ${uri}`);
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
      });

      console.log(`✨ MongoDB connected: ${mongoose.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ MongoDB attempt ${attempt}/${retries} failed: ${(error as Error).message}`);
      if (mongod) {
        await mongod.stop().catch(() => {});
        mongod = null;
      }
      if (attempt === retries) {
        console.error('MongoDB could not connect after retries. Exiting.');
        process.exit(1);
      }
      await new Promise(r => setTimeout(r, 2000 * attempt));
    }
  }
};

export const closeDB = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (mongod) await mongod.stop();
  } catch (error) {
    console.error(`Error closing DB: ${(error as Error).message}`);
  }
};

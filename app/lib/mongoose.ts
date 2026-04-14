import mongoose from 'mongoose';

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var __mongoose_cache__: MongooseCache | undefined;
}

const cache: MongooseCache = globalThis.__mongoose_cache__ ?? { conn: null, promise: null };
globalThis.__mongoose_cache__ = cache;

export async function connectMongo() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI env var.');
  }

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}


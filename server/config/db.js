import mongoose from 'mongoose';

const LOCAL_DEFAULT = 'mongodb://127.0.0.1:27017/kindred';

/** Resolves MongoDB URI: uses MONGO_URI when set; otherwise local default in non-production. */
export function resolveMongoUri() {
  const uri = process.env.MONGO_URI?.trim();
  if (uri && !uri.includes('your_mongodb')) return uri;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Set MONGO_URI in server/.env to your MongoDB connection string.');
  }
  console.warn(`[db] MONGO_URI unset or placeholder — using ${LOCAL_DEFAULT}`);
  return LOCAL_DEFAULT;
}

export const connectDB = async () => {
  try {
    await mongoose.connect(resolveMongoUri());
    console.log('MongoDB connected');
  } catch (e) {
    const msg = String(e?.message || e);
    const atlasAuth =
      e?.code === 8000 || msg.includes('bad auth') || msg.includes('authentication failed');
    if (atlasAuth) {
      console.error(
        '[db] MongoDB authentication failed. Check server/.env MONGO_URI:\n' +
          '  - DB user/password must match Atlas (Database Access).\n' +
          '  - URL-encode special characters in the password (e.g. @ → %40, # → %23).\n' +
          '  - For local Mongo: MONGO_URI=mongodb://127.0.0.1:27017/kindred'
      );
    }
    throw e;
  }
};

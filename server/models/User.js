import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: undefined },
    },
    address: { type: String, default: '' },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    itemsShared: { type: Number, default: 0 },
    successfulHandoffs: { type: Number, default: 0 },
    helpfulnessVotes: { type: Number, default: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    refreshToken: { type: String, select: false, default: '' },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

export default mongoose.model('User', userSchema);

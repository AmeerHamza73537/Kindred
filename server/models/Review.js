import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    // Optional: a review may be linked to a completed exchange, or left directly on a profile.
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', default: null },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 1000 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// One review per reviewer → target (whether left via an exchange or directly on the profile).
reviewSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
reviewSchema.index({ toUser: 1, isPublic: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);

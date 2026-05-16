import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '', maxlength: 1000 },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

reviewSchema.index({ request: 1, fromUser: 1 }, { unique: true });
reviewSchema.index({ toUser: 1, isPublic: 1, createdAt: -1 });

export default mongoose.model('Review', reviewSchema);

import mongoose from 'mongoose';

const gratitudeSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    message: { type: String, default: '' },
    tokenType: {
      type: String,
      enum: ['star', 'heart', 'seedling', 'hammer', 'sparkle'],
      required: true,
    },
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

gratitudeSchema.index({ toUser: 1, isPublic: 1 });
gratitudeSchema.index({ fromUser: 1 });

export default mongoose.model('Gratitude', gratitudeSchema);

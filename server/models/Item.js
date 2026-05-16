import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Tools', 'Kitchen', 'Electronics', 'Sports', 'Garden', 'Skills', 'Other'],
      required: true,
    },
    type: { type: String, enum: ['lend', 'gift', 'skill'], required: true },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ['available', 'in_use', 'lent_out'],
      default: 'available',
    },
    availability: [
      {
        date: { type: Date, required: true },
        isBooked: { type: Boolean, default: false },
        requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', default: null },
      },
    ],
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true },
    },
    borrowDurationDays: { type: Number, default: 7 },
    condition: { type: String, enum: ['new', 'good', 'fair'], default: 'good' },
    tags: [{ type: String }],
    totalBorrows: { type: Number, default: 0 },
  },
  { timestamps: true }
);

itemSchema.index({ location: '2dsphere' });
itemSchema.index({ owner: 1 });

export default mongoose.model('Item', itemSchema);

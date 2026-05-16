import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'],
      default: 'pending',
    },
    requestedDates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
    message: { type: String, default: '' },
  },
  { timestamps: true }
);

requestSchema.index({ owner: 1, status: 1 });
requestSchema.index({ borrower: 1, status: 1 });

export default mongoose.model('Request', requestSchema);

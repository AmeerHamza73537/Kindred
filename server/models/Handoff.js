import mongoose from 'mongoose';

const handoffSchema = new mongoose.Schema(
  {
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true, unique: true },
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
    borrower: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pickupDetails: {
      method: { type: String, enum: ['doorstep', 'public_spot', 'custom'], default: 'custom' },
      location: { type: String, default: '' },
      scheduledTime: { type: Date, default: null },
      confirmedByOwner: { type: Boolean, default: false },
      confirmedByBorrower: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
    returnDetails: {
      scheduledDate: { type: Date, default: null },
      confirmedByBorrower: { type: Boolean, default: false },
      confirmedByOwner: { type: Boolean, default: false },
      completedAt: { type: Date, default: null },
    },
    handoffCode: { type: String, default: '' },
    codeVerifiedAt: { type: Date, default: null },
    stage: {
      type: String,
      enum: ['pickup_pending', 'item_with_borrower', 'return_pending', 'completed'],
      default: 'pickup_pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Handoff', handoffSchema);

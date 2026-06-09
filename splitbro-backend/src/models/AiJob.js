import mongoose from 'mongoose';

const AiJobSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ['categorization', 'price_verification', 'receipt_scan']
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    error: {
      type: String,
      default: null
    },
    // Furkan Kasalak – Fiyat doğrulama için
    itemName: { type: String, default: null },
    itemPrice: { type: Number, default: null },
    // Gökdeniz Erten – Fiş okuma için
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    imageData: { type: String, default: null }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('AiJob', AiJobSchema);

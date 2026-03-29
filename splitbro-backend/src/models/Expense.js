import mongoose from 'mongoose';

const expenseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Giderin kısaca sebebi (başlığı) girilmelidir!'],
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: [true, 'Gider için bir miktar (totalAmount) belirtilmelidir!'],
      min: [0, "Tutar 0'dan büyük olmalı!"],
    },
    paidById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ödemeyi yapan kişi belirtilmelidir!'],
    },
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Giderin ait olduğu bir grup olmalıdır!'],
    },
    items: [expenseItemSchema],
    receiptData: {
      imageUrl: String,
      confidenceScore: Number, 
      ocrText: String,     
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;

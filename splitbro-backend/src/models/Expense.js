import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Giderin kısaca sebebi (başlığı) girilmelidir!'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Gider için bir miktar (amount) belirtilmelidir!'],
      min: [0, 'Tutar 0\\'dan büyük olmalı!'],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ödemeyi yapan kişi belirtilmelidir!'],
    },
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Giderin ait olduğu bir grup olmalıdır!'],
    },
    receiptData: {
      // AI'dan dönen analiz sonuçlarını veya fotoğraf URL'sini saklayacağımız bölüm
      imageUrl: String,
      confidenceScore: Number, // AI'nin faturayı okuma doğruluk oranı
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

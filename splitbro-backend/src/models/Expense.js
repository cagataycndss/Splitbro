import mongoose from 'mongoose';

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
    items: [
      {
        name: String,
        price: Number,
        category: String
      }
    ],
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

const mongoose = require('mongoose');

// Önce içerdeki "Ürün" (Item) şemasını tanımlıyoruz
const expenseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  // Bu ürünü kimler paylaşacak? (Kişi ID'lerini tutan dizi)
  assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

// Şimdi ana "Gider" (Expense) şemasını tanımlıyoruz
const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  // Ürünler şemasını buraya GÖMÜYORUZ! (İşte sihir burası)
  items: [expenseItemSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
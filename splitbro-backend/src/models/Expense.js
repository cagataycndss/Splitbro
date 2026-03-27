const mongoose = require('mongoose');

const expenseItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'Uncategorized' },
  assignedUserIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  paidById: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  totalAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  items: [expenseItemSchema] 
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);
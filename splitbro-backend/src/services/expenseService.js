import ApiError from '../utils/ApiError.js';
import Expense from '../models/Expense.js';
import Group from '../models/Group.js';

export const createManualExpenseService = async (groupId, paidById, expenseData) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı!');

  const isMember = group.members.some(m => m.user.toString() === paidById.toString());
  if (!isMember) throw new ApiError(403, 'Gider eklemek için grubun üyesi olmalısınız.');

  const newExpense = await Expense.create({
    title: expenseData.title,
    totalAmount: expenseData.totalAmount,
    paidById: paidById,
    groupId: groupId,
    items: expenseData.items && expenseData.items.length > 0 
           ? expenseData.items 
           : [{ name: expenseData.title, price: expenseData.totalAmount, category: 'Manuel', assignedUserIds: expenseData.assignedUserIds || [] }]
  });

  return newExpense;
};

export const deleteExpenseService = async (expenseId, requesterId) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new ApiError(404, 'Silinecek gider bulunamadı');

  
  await Expense.findByIdAndDelete(expenseId);
  return null;
};

export const addItemToExpenseService = async (expenseId, itemData) => {
  const expense = await Expense.findById(expenseId);
  if (!expense) throw new ApiError(404, 'Gider bulunamadı');

  let isPlaceholderRemoved = false;
  if (expense.items.length === 1) {
    const autoItem = expense.items[0];
    if (autoItem.name === expense.title && autoItem.price === expense.totalAmount) {
      await Expense.findByIdAndUpdate(expenseId, { $pull: { items: { _id: autoItem._id } } });
      isPlaceholderRemoved = true;
    }
  }

  const currentItemsTotal = isPlaceholderRemoved 
    ? 0 
    : expense.items.reduce((sum, item) => sum + item.price, 0);
  
  const newTotal = currentItemsTotal + Number(itemData.price);
  if (newTotal > expense.totalAmount) {
    const kalan = expense.totalAmount - currentItemsTotal;
    throw new ApiError(400, `Toplam tutar aşılıyor! Harcama limiti: ₺${expense.totalAmount}. Mevcut ürün toplamı: ₺${currentItemsTotal}. Eklenebilecek maks: ₺${kalan.toFixed(2)}`);
  }

  const updatedExpense = await Expense.findByIdAndUpdate(
    expenseId,
    { $push: { items: { name: itemData.name, price: itemData.price, category: itemData.category || 'Diğer', assignedUserIds: [] } } },
    { new: true, runValidators: true }
  );

  return updatedExpense;
};

export const deleteItemFromExpenseService = async (expenseId, itemId) => {
  const updatedExpense = await Expense.findByIdAndUpdate(
    expenseId,
    { $pull: { items: { _id: itemId } } },
    { new: true }
  );

  if (!updatedExpense) throw new ApiError(404, 'Gider bulunamadı veya silinemedi.');
  return updatedExpense;
};

export const splitExpenseItemService = async (expenseId, itemId, assignedUserIds) => {
  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: expenseId, "items._id": itemId },
    { $set: { "items.$.assignedUserIds": assignedUserIds } },
    { new: true }
  );

  if (!updatedExpense) throw new ApiError(404, 'Gider veya ürün bulunamadı');
  return updatedExpense;
};

export const calculateDebtsForExpense = (expense) => {
    const creditorId = expense.paidById.toString();
    const debtMap = new Map();

    expense.items.forEach(item => {
        const usersCount = item.assignedUserIds.length;
        if (usersCount === 0) return;

        const splitAmount = item.price / usersCount;

        item.assignedUserIds.forEach(userIdObj => {
            const debtorId = userIdObj.toString();
            if (debtorId === creditorId) return;

            const currentDebt = debtMap.get(debtorId) || 0;
            debtMap.set(debtorId, currentDebt + splitAmount);
        });
    });

    const results = [];
    debtMap.forEach((amount, debtorId) => {
        results.push({
            debtorId: debtorId,
            creditorId: creditorId,
            amount: parseFloat(amount.toFixed(2)) 
        });
    });

    return results;
};
import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { scanReceiptWithAI } from './aiScannerService.js';
import ApiError from '../utils/ApiError.js';

export const createGroupService = async (groupData) => {
  const newGroup = await Group.create({
    name: groupData.name,
    description: groupData.description,
    owner: groupData.ownerId,
    members: [{ user: groupData.ownerId, role: 'owner' }],
  });

  return newGroup;
};

export const updateGroupService = async (group, updateData) => {
  if (updateData.name) group.name = updateData.name;
  if (updateData.description) group.description = updateData.description;

  const updatedGroup = await group.save({ runValidators: true });
  return updatedGroup;
};

export const deleteGroupService = async (group) => {
  await Expense.deleteMany({ groupId: group._id });
  
  await Group.findByIdAndDelete(group._id);
};

export const addMemberService = async (groupId, email, requesterId, role = 'member') => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const isRequesterMember = group.members.some(
    (member) => member.user?.toString() === requesterId.toString()
  );
  if (!isRequesterMember) {
    throw new ApiError(403, 'Gruba üye eklemek için yetkiniz yok (Grup üyesi değilsiniz).');
  }

  const isUserExist = await User.findOne({ email });
  if(!isUserExist) throw new ApiError(404, 'Eklenecek e-posta adresine sahip bir kullanıcı sistemde bulunamadı.');
  
  const newMemberId = isUserExist._id;

  const isDuplicate = group.members.some(
    (member) => member.user.toString() === newMemberId.toString()
  );
  if (isDuplicate) throw new ApiError(400, 'Bu kullanıcı zaten grupta üye.');

  group.members.push({ user: newMemberId, role });
  await group.save();

  return group;
};

export const addGuestService = async (groupId, guestName, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const isRequesterMember = group.members.some(
    (member) => member.user?.toString() === requesterId.toString()
  );
  if (!isRequesterMember) {
    throw new ApiError(403, 'Gruba misafir eklemek için yetkiniz yok.');
  }

  group.members.push({ guestName, role: 'guest' });
  await group.save();

  return group;
};

export const getMembersService = async (groupId, requesterId) => {
  const group = await Group.findById(groupId).populate('members.user', 'firstName lastName email avatar');
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const isRequesterMember = group.members.some(
    (member) => member.user?._id?.toString() === requesterId.toString() || member.user?.toString() === requesterId.toString()
  );
  
  if (!isRequesterMember) {
    throw new ApiError(403, 'Grup üyelerini görüntüleme yetkisine sahip değilsiniz.');
  }

  return group.members;
};

export const removeMemberService = async (groupId, memberIdToRemove, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const isOwner = group.owner.toString() === requesterId.toString();
  const isSelfLeaving = memberIdToRemove.toString() === requesterId.toString();

  if (!isOwner && !isSelfLeaving) {
    throw new ApiError(403, 'Bu işlem için sadece Grup Sahibi yetkilidir veya yalnızca kendi isteğinizle gruptan ayrılabilirsiniz (403).');
  }

  if (group.owner.toString() === memberIdToRemove.toString()) {
    throw new ApiError(400, 'Grup sahibi gruptan çıkartılamaz! Önce yetki devri yapılmalıdır (400).');
  }

  const initialMemberCount = group.members.length;
  group.members = group.members.filter(
    (member) => member.user?.toString() !== memberIdToRemove.toString() && member._id.toString() !== memberIdToRemove.toString()
  );

  if (group.members.length === initialMemberCount) {
    throw new ApiError(400, 'Kullanıcı zaten grupta yok veya çıkartılamadı!'); 
  }

  await group.save();
  return group.members;
};

export const createExpenseViaAIScannerService = async (groupId, paidById, imageUrl) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı! İşlem iptal edildi.');

  const aiResult = await scanReceiptWithAI(imageUrl);

  if(!aiResult.success) {
    throw new ApiError(500, 'Fiş/Fatura okunurken bir hata oluştu.');
  }

  const { title, amount, confidenceScore, items, ocrText } = aiResult.extractedData;

  const newExpense = await Expense.create({
    title,
    totalAmount: amount,
    paidById: paidById,
    groupId: groupId,
    items: items && items.length > 0 ? items.map(item => ({ name: item.name, price: item.price, category: 'AI Taraması', assignedUserIds: [] })) : [{ name: title, price: amount, category: 'AI Taraması', assignedUserIds: [] }],
    receiptData: {
      imageUrl,
      confidenceScore,
      ocrText
    }
  });

  return newExpense;
};

export const getGroupDetailsService = async (groupId, requesterId) => {
  const group = await Group.findById(groupId).populate('members.user', 'firstName lastName avatar email');
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const isRequesterMember = group.members.some(
    (member) => member.user?.toString() === requesterId.toString()
  );
  if (!isRequesterMember) {
    throw new ApiError(403, 'Bu grubun detaylarını görüntüleme yetkisine sahip değilsiniz.');
  }

  const expenses = await Expense.find({ groupId: group._id })
      .populate('paidById', 'firstName lastName avatar')
      .populate('items.assignedUserIds', 'firstName lastName avatar')
      .sort({ createdAt: -1 });

  return {
    group,
    expenses
  };
};

export const calculateGroupDebtsService = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const expenses = await Expense.find({ groupId });
  const groupedExpenses = {};

  expenses.forEach(exp => {
    const cur = exp.currency || 'TRY';
    if (!groupedExpenses[cur]) groupedExpenses[cur] = [];
    groupedExpenses[cur].push(exp);
  });

  const allSettlements = [];

  for (const [currency, currExpenses] of Object.entries(groupedExpenses)) {
    const debtMap = new Map(); 

    currExpenses.forEach(expense => {
        const creditorId = expense.paidById.toString();
        
        expense.items.forEach(item => {
            const usersCount = item.assignedUserIds.length;
            if (usersCount === 0) return;
            const splitAmount = item.price / usersCount;
            
            item.assignedUserIds.forEach(userIdObj => {
                const debtorId = userIdObj.toString();
                if (debtorId === creditorId) return;

                const cBal = debtMap.get(creditorId) || 0;
                debtMap.set(creditorId, cBal + splitAmount);

                const dBal = debtMap.get(debtorId) || 0;
                debtMap.set(debtorId, dBal - splitAmount);
            });
        });
    });

    let debtors = []; 
    let creditors = []; 
    
    debtMap.forEach((balance, userId) => {
        if (balance > 0.01) creditors.push({ userId, balance });
        else if (balance < -0.01) debtors.push({ userId, balance: Math.abs(balance) });
    });

    debtors.sort((a,b) => b.balance - a.balance);
    creditors.sort((a,b) => b.balance - a.balance);

    let d = 0;
    let c = 0;

    while(d < debtors.length && c < creditors.length) {
        const debtor = debtors[d];
        const creditor = creditors[c];
        
        const minAmount = Math.min(debtor.balance, creditor.balance);
        
        allSettlements.push({
            from: debtor.userId,
            to: creditor.userId,
            amount: parseFloat(minAmount.toFixed(2)),
            currency: currency
        });
        
        debtor.balance -= minAmount;
        creditor.balance -= minAmount;
        
        if (debtor.balance < 0.01) d++;
        if (creditor.balance < 0.01) c++;
    }
  }

  return allSettlements;
};


export const settleDebtService = async (groupId, paidBy, paidTo, amount, currency = 'TRY') => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  const settlementExpense = await Expense.create({
    title: `💳 Ödeme Yapıldı`,
    totalAmount: amount,
    currency: currency,
    paidById: paidBy,
    groupId: groupId,
    isSettlement: true,
    items: [{
      name: 'Borç Ödemesi',
      price: amount,
      category: 'Ödeme',
      assignedUserIds: [paidTo]
    }]
  });

  return settlementExpense;
};

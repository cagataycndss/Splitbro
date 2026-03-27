import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import User from '../models/User.js';
import { scanReceiptMockAI } from './aiScannerService.js';
import ApiError from '../utils/ApiError.js';

export const createGroupService = async (groupData) => {
  // Yeni grubu, req.user._id referansıyla (sahibi olarak) db'ye kaydet
  const newGroup = await Group.create({
    name: groupData.name,
    description: groupData.description,
    owner: groupData.ownerId,
    members: [{ user: groupData.ownerId, role: 'owner' }],
  });

  return newGroup;
};

export const updateGroupService = async (group, updateData) => {
  // Req üzerindeki pre-fetched grubu alıp basitçe güncelliyoruz.
  if (updateData.name) group.name = updateData.name;
  if (updateData.description) group.description = updateData.description;

  const updatedGroup = await group.save({ runValidators: true });
  return updatedGroup;
};

export const deleteGroupService = async (group) => {
  // Gruba bağlı Expense'leri de silmeliyiz (Cascade Delete)
  await Expense.deleteMany({ groupId: group._id });
  
  // Grubu tamamen kaldır
  await Group.findByIdAndDelete(group._id);
};

export const addMemberService = async (groupId, newMemberId, role = 'member') => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  // Zaten üye mi kontrol et
  const isDuplicate = group.members.some(
    (member) => member.user.toString() === newMemberId.toString()
  );
  if (isDuplicate) throw new ApiError(400, 'Bu kullanıcı zaten grupta üye.');

  // Kullanıcı db'de gerçekten var mı?
  const isUserExist = await User.findById(newMemberId);
  if(!isUserExist) throw new ApiError(404, 'Eklenecek kullanıcı sistemde bulunamadı.');

  group.members.push({ user: newMemberId, role });
  await group.save();

  return group;
};

export const getMembersService = async (groupId) => {
  // Uyelerin ObjectId lerini asil bilgilerine populate et, ancak sifreleri getirme.
  const group = await Group.findById(groupId).populate('members.user', 'firstName lastName email avatar');
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  return group.members;
};

export const removeMemberService = async (groupId, memberIdToRemove, requesterId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı');

  // Yetki Kontrolü: 
  // İstekte bulunan kişi (requesterId), ya grubun sahibi (owner) olmalı
  // ya da gruptan çıkartılacak olan kişi ile birebir aynı kişi olmalı (Kendi isteğiyle ayrılma durumu)
  const isOwner = group.owner.toString() === requesterId.toString();
  const isSelfLeaving = memberIdToRemove.toString() === requesterId.toString();

  if (!isOwner && !isSelfLeaving) {
    throw new ApiError(403, 'Bu işlem için sadece Grup Sahibi yetkilidir veya yalnızca kendi isteğinizle gruptan ayrılabilirsiniz (403).');
  }

  // Sahibin kendini gruptan atmasını önleyelim
  if (group.owner.toString() === memberIdToRemove.toString()) {
    throw new ApiError(400, 'Grup sahibi gruptan çıkartılamaz! Önce yetki devri yapılmalıdır (400).');
  }

  const initialMemberCount = group.members.length;
  // Belirtilen üyeyi members dizisinden filtreliyoruz
  group.members = group.members.filter(
    (member) => member.user.toString() !== memberIdToRemove.toString()
  );

  if (group.members.length === initialMemberCount) {
    throw new ApiError(400, 'Kullanıcı zaten grupta yok veya çıkartılamadı!'); // 400 Geçersiz Veri Durumu
  }

  await group.save();
  return group.members;
};

export const createExpenseViaAIScannerService = async (groupId, paidById, imageUrl) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Grup bulunamadı! İşlem iptal edildi.');

  // Mock AI Servisini Çağırıyoruz
  const aiResult = await scanReceiptMockAI(imageUrl);

  if(!aiResult.success) {
    throw new ApiError(500, 'Fiş/Fatura okunurken bir hata oluştu.');
  }

  // Okunan OCR sonuçları üzerinden Expense modelinden Gider kaydı yaratıyoruz
  const { title, amount, confidenceScore, ocrText } = aiResult.extractedData;

  const newExpense = await Expense.create({
    title,
    totalAmount: amount,
    paidById: paidById,
    groupId: groupId,
    receiptData: {
      imageUrl,
      confidenceScore,
      ocrText
    }
  });

  return newExpense;
};

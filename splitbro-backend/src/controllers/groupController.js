import * as groupService from '../services/groupService.js';
import AiJob from '../models/AiJob.js';
import { publishMessage } from '../config/rabbitmq.js';
import { scanReceiptWithAI } from '../services/aiScannerService.js';

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

export const updateGroup = catchAsync(async (req, res, next) => {
  const updatedGroup = await groupService.updateGroupService(req.group, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      group: updatedGroup,
    },
  });
});


export const createGroup = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;
  const ownerId = req.user._id;

  const newGroup = await groupService.createGroupService({ name, description, ownerId });

  res.status(201).json({
    status: 'success',
    data: {
      group: newGroup,
    },
  });
});

export const addMember = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { email, role } = req.body; 
  const requesterId = req.user._id;

  const updatedGroup = await groupService.addMemberService(groupId, email, requesterId, role);

  res.status(200).json({
    status: 'success',
    message: 'Kullanıcı başarıyla eklendi.',
    data: {
      groupMembers: updatedGroup.members,
    },
  });
});

<<<<<<< HEAD
export const addGuestMember = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { guestName } = req.body; 
  const requesterId = req.user._id;

  if (!guestName) {
    return next(new ApiError(400, 'Lütfen misafir adını girin.'));
  }

  const updatedGroup = await groupService.addGuestMemberService(groupId, guestName, requesterId);
=======
export const addGuest = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { guestName } = req.body;
  const requesterId = req.user._id;

  if (!guestName || guestName.trim() === '') {
    return res.status(400).json({ status: 'fail', message: 'Misafir adı gereklidir.' });
  }

  const updatedGroup = await groupService.addGuestService(groupId, guestName, requesterId);
>>>>>>> 89ff04f (Geliştirmeler yapıldı)

  res.status(200).json({
    status: 'success',
    message: 'Misafir başarıyla eklendi.',
    data: {
      groupMembers: updatedGroup.members,
    },
  });
});

export const deleteGroup = catchAsync(async (req, res, next) => {
  await groupService.deleteGroupService(req.group);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


export const getMembers = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const requesterId = req.user._id;
  
  const { members, cached } = await groupService.getMembersService(groupId, requesterId);

  res.status(200).json({
    status: 'success',
    results: members.length,
    cached: cached || false,
    data: {
      members,
    },
  });
});


export const removeMember = catchAsync(async (req, res, next) => {
  const { groupId, userId } = req.params;
  const currentUserId = req.user._id;

  await groupService.removeMemberService(groupId, userId, currentUserId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


// Gökdeniz Erten – AI Fiş Okuma (RabbitMQ Asenkron)
export const scanAndAddExpense = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const paidById = req.user._id; 

  let imageData;
  if (req.file) {
    const base64Image = req.file.buffer.toString('base64');
    imageData = `data:${req.file.mimetype};base64,${base64Image}`;
  } else if (req.body.imageUrl) {
    imageData = req.body.imageUrl;
  } else {
    return res.status(400).json({ message: 'Lütfen bir fiş/fatura resmi yükleyin veya URL girin.' });
  }

  // 1. Job oluştur
  const job = await AiJob.create({
    type: 'receipt_scan',
    groupId: groupId,
    paidById: paidById,
    imageData: imageData.substring(0, 100) + '...' // Sadece referans kaydet, tam veri kuyruğa gider
  });

  // 2. RabbitMQ'ya mesaj gönder veya Direct Fallback uygula
  try {
    await publishMessage('ai_receipt_scan_queue', {
      jobId: job._id,
      groupId: groupId,
      paidById: paidById,
      imageData: imageData
    });
  } catch (error) {
    console.warn('[Gökdeniz] RabbitMQ is not available for receipt scan, falling back to direct processing...', error.message);

    // Direct background processing fallback (non-blocking)
    (async () => {
      try {
        await AiJob.findByIdAndUpdate(job._id, { status: 'processing' });
        
        const expense = await groupService.createExpenseViaAIScannerService(groupId, paidById, imageData);
        
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'completed',
          result: {
            expenseId: expense._id,
            title: expense.title,
            totalAmount: expense.totalAmount
          }
        });
        console.log(`[Gökdeniz] Direct Receipt Scan Job ${job._id} completed successfully.`);
      } catch (err) {
        console.error('[Gökdeniz] Direct Receipt Scan Fallback Error:', err);
        await AiJob.findByIdAndUpdate(job._id, {
          status: 'failed',
          error: err.message || 'Bilinmeyen bir hata oluştu'
        });
      }
    })();
  }

  // 3. İstemciye Job ID dön
  res.status(202).json({
    status: 'success',
    message: 'Fiş okuma işlemi sıraya alındı. Yapay zeka analiz ediyor...',
    jobId: job._id
  });
});


// Gökdeniz Erten – Fiş Okuma Durumu Sorgulama
export const getScanStatus = catchAsync(async (req, res, next) => {
  const { jobId } = req.params;
  const job = await AiJob.findById(jobId);

  if (!job) {
    return res.status(404).json({ status: 'fail', message: 'İşlem bulunamadı' });
  }

  res.status(200).json({ status: 'success', data: job });
});


export const getGroupDetails = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const requesterId = req.user._id;

  const groupDetails = await groupService.getGroupDetailsService(groupId, requesterId);

  res.status(200).json({
    status: 'success',
    data: groupDetails
  });
});

export const calculateGroupDebts = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const settlements = await groupService.calculateGroupDebtsService(groupId);
  res.status(200).json({ status: 'success', data: settlements });
});


export const settleDebt = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { paidBy, paidTo, amount, currency } = req.body;

  const settlement = await groupService.settleDebtService(groupId, paidBy, paidTo, amount, currency);

  res.status(201).json({
    status: 'success',
    message: 'Borç başarıyla kapatıldı! Hesaplaşma güncellendi.',
    data: settlement
  });
});

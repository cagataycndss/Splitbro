import * as groupService from '../services/groupService.js';

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
  
  const members = await groupService.getMembersService(groupId, requesterId);

  res.status(200).json({
    status: 'success',
    results: members.length,
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


export const scanAndAddExpense = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const paidById = req.user._id; 

  let imageUrl;
  if (req.file) {
    const base64Image = req.file.buffer.toString('base64');
    imageUrl = `data:${req.file.mimetype};base64,${base64Image}`;
  } else if (req.body.imageUrl) {
    imageUrl = req.body.imageUrl;
  } else {
    return res.status(400).json({ message: 'Lütfen bir fiş/fatura resmi yükleyin veya URL girin.' });
  }

  const expense = await groupService.createExpenseViaAIScannerService(groupId, paidById, imageUrl);

  res.status(201).json({
    status: 'success',
    message: 'Fiş Yapay Zeka (OCR) tarafından okundu ve sisteme Gider olarak işlendi.',
    data: {
      expense,
    },
  });
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
  const { paidBy, paidTo, amount } = req.body;

  const settlement = await groupService.settleDebtService(groupId, paidBy, paidTo, amount);

  res.status(201).json({
    status: 'success',
    message: 'Borç başarıyla kapatıldı! Hesaplaşma güncellendi.',
    data: settlement
  });
});

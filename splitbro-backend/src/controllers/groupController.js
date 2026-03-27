import * as groupService from '../services/groupService.js';

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 1. Grup Bilgilerini Güncelleme
 * PUT /groups/{groupId}
 */
export const updateGroup = catchAsync(async (req, res, next) => {
  // restrictToGroupOwner yapısı bize group'u req içerisine set ediyor.
  const updatedGroup = await groupService.updateGroupService(req.group, req.body);

  res.status(200).json({
    status: 'success',
    data: {
      group: updatedGroup,
    },
  });
});

/**
 * 2. Grup Silme
 * DELETE /groups/{groupId}
 */
export const deleteGroup = catchAsync(async (req, res, next) => {
  await groupService.deleteGroupService(req.group);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * 3. Grup Oluşturma
 * POST /groups
 */
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

/**
 * 4. Gruba Üye Ekleme
 * POST /groups/{groupId}/members
 */
export const addMember = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { userId, role } = req.body; // post body içerisinden gelen veriler

  const updatedGroup = await groupService.addMemberService(groupId, userId, role);

  res.status(200).json({
    status: 'success',
    message: 'Kullanıcı başarıyla eklendi.',
    data: {
      groupMembers: updatedGroup.members,
    },
  });
});

/**
 * 5. Grup Üyelerini Listeleme
 * GET /groups/{groupId}/members
 */
export const getMembers = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  
  const members = await groupService.getMembersService(groupId);

  res.status(200).json({
    status: 'success',
    results: members.length,
    data: {
      members,
    },
  });
});

/**
 * 6. Gruptan Üye Çıkarma
 * DELETE /groups/{groupId}/members/{userId}
 */
export const removeMember = catchAsync(async (req, res, next) => {
  const { groupId, userId } = req.params;
  const currentUserId = req.user._id;

  await groupService.removeMemberService(groupId, userId, currentUserId);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * 7. Yapay Zeka (AI) Destekli Fiş Okuma ve Otomatik Gider Ekleme
 * POST /groups/{groupId}/expenses/scan
 */
export const scanAndAddExpense = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { imageUrl } = req.body;
  const paidById = req.user._id; 

  const expense = await groupService.createExpenseViaAIScannerService(groupId, paidById, imageUrl);

  res.status(201).json({
    status: 'success',
    message: 'Fiş Yapay Zeka (OCR) tarafından okundu ve sisteme Gider olarak işlendi.',
    data: {
      expense,
    },
  });
});

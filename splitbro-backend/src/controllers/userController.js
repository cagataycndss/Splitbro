import * as userService from '../services/userService.js';
import catchAsync from '../utils/catchAsync.js';

export const changePassword = catchAsync(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const result = await userService.changePassword(req.user.id, oldPassword, newPassword);
  res.status(200).json(result);
});

export const getProfile = catchAsync(async (req, res) => {
  const result = await userService.getUserProfile(req.params.userId);
  res.status(200).json({ data: result });
});

export const deleteAccount = catchAsync(async (req, res) => {
  const result = await userService.deleteUserAccount(req.params.userId);
  res.status(200).json(result);
});

export const uploadUserAvatar = catchAsync(async (req, res) => {
  const result = await userService.uploadAvatar(req.params.userId, req.file);
  res.status(200).json({ message: 'Profil resmi başarıyla yüklendi', data: result });
});

export const getUserGroups = catchAsync(async (req, res) => {
  const result = await userService.getUserGroups(req.params.userId);
  res.status(200).json({ data: result });
});

import * as userService from '../services/userService.js';
import catchAsync from '../utils/catchAsync.js';






export const uploadUserAvatar = catchAsync(async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ message: 'Yetkisiz işlem' });
  const result = await userService.uploadAvatar(req.params.userId, req.file);
  res.status(200).json({ message: 'Profil resmi başarıyla yüklendi', data: result });
});



export const updateProfile = catchAsync(async (req, res) => {
  if (req.params.userId !== req.user.id) return res.status(403).json({ message: 'Yetkisiz işlem' });
  const result = await userService.updateUserProfile(req.params.userId, req.body);
  res.status(200).json({ message: 'Profil başarıyla güncellendi', data: result });
});



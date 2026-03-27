import User from '../models/User.js';
import Group from '../models/Group.js';
import ApiError from '../utils/ApiError.js';

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!user) throw new ApiError(404, 'Kullanıcı bulunamadı');

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Eski şifreniz yanlış');
  }

  user.password = newPassword;
  await user.save();
  return { message: 'Şifreniz başarıyla güncellendi' };
};

export const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-isDeleted -__v -password');
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }
  return user;
};

export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }
  
  // Soft Delete
  user.isDeleted = true;
  user.email = `${user.email}_deleted_${Date.now()}`; // Emaili boşa çıkararak serbest bırakmak için GDPR
  await user.save();

  return { message: 'Hesap başarıyla silindi' };
};

export const uploadAvatar = async (userId, file) => {
  if (!file) throw new ApiError(400, 'Lütfen bir dosya yükleyin');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  const avatarUrl = `/uploads/${file.filename}`;
  user.avatar = avatarUrl;
  await user.save();

  return { avatar: avatarUrl };
};

export const getUserGroups = async (userId) => {
  // Demo amaçlı populate işlemi
  const groups = await Group.find({ members: userId }).select('-__v');
  return groups;
};

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

export const updateUserProfile = async (userId, updateData) => {
  const user = await User.findById(userId).select('-isDeleted -__v -password');
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  if (updateData.email && updateData.email !== user.email) {
    const emailExists = await User.findOne({ email: updateData.email });
    if (emailExists) {
      throw new ApiError(400, 'Bu e-posta adresi zaten kullanılıyor');
    }
  }

  if (updateData.firstName) user.firstName = updateData.firstName;
  if (updateData.lastName) user.lastName = updateData.lastName;
  if (updateData.email) user.email = updateData.email;

  await user.save();
  return user;
};

export const deleteUserAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }
  
  user.isDeleted = true;
  user.email = `${user.email}_deleted_${Date.now()}`; 
  await user.save();

  return { message: 'Hesap başarıyla silindi' };
};

export const uploadAvatar = async (userId, file) => {
  if (!file) throw new ApiError(400, 'Lütfen bir dosya yükleyin');

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  const base64Image = file.buffer.toString('base64');
  const avatarUrl = `data:${file.mimetype};base64,${base64Image}`;
  
  user.avatar = avatarUrl;
  await user.save();

  return { avatar: avatarUrl };
};

export const deleteAvatar = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  if (!user.avatar) {
    throw new ApiError(400, 'Silinecek profil resmi zaten yok');
  }

  user.avatar = null;
  await user.save();

  return { message: 'Profil resmi başarıyla kaldırıldı' };
};

export const getUserGroups = async (userId) => {
  const groups = await Group.find({ 'members.user': userId }).select('-__v');
  return groups;
};

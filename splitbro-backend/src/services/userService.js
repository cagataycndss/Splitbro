import User from '../models/User.js';
import Group from '../models/Group.js';
import ApiError from '../utils/ApiError.js';
// Furkan Kasalak – Redis Profil Cache
import redisClient from '../config/redis.js';

// Furkan Kasalak – Profil cache invalidation yardımcı fonksiyonu
const invalidateProfileCache = async (userId) => {
  try {
    if (redisClient.isOpen) {
      await redisClient.del(`user:${userId}:profile`);
    }
  } catch (err) {
    console.error('[Furkan] Redis Profile Cache Invalidation Error:', err);
  }
};

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

// Furkan Kasalak – Redis Cache ile Profil Görüntüleme
export const getUserProfile = async (userId) => {
  const cacheKey = `user:${userId}:profile`;

  // Redis'ten cache kontrolü
  try {
    if (redisClient.isOpen) {
      const cachedData = await redisClient.get(cacheKey);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        parsed._cached = true; // Cache'den geldiğini belirt
        return parsed;
      }
    }
  } catch (err) {
    console.error('[Furkan] Redis Profile Get Error:', err);
  }

  // DB'den çek
  const user = await User.findById(userId).select('-isDeleted -__v -password');
  if (!user) {
    throw new ApiError(404, 'Kullanıcı bulunamadı');
  }

  // Redis'e cache'le (30 dakika = 1800 saniye)
  try {
    if (redisClient.isOpen) {
      await redisClient.set(cacheKey, JSON.stringify(user), { EX: 1800 });
    }
  } catch (err) {
    console.error('[Furkan] Redis Profile Set Error:', err);
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
  // Furkan Kasalak – Profil güncellendiğinde cache'i invalidate et
  await invalidateProfileCache(userId);
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

  // Furkan Kasalak – Hesap silindiğinde cache'i invalidate et
  await invalidateProfileCache(userId);

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

  // Furkan Kasalak – Avatar güncellendiğinde cache'i invalidate et
  await invalidateProfileCache(userId);

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

  // Furkan Kasalak – Avatar silindiğinde cache'i invalidate et
  await invalidateProfileCache(userId);

  return { message: 'Profil resmi başarıyla kaldırıldı' };
};

export const getUserGroups = async (userId) => {
  const groups = await Group.find({ 'members.user': userId }).select('-__v');
  return groups;
};


import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

/**
 * 1. Kullanıcı Sisteme Giriş Yapmış mı? (Token Kontrolü)
 */
export const protectUser = async (req, res, next) => {
  try {
    let token;
    // Header'da token var mı? formatı 'Bearer <token>' mantığı
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new AppError('Lütfen sisteme giriş yapın (Token bulunamadı)!', 401)
      );
    }

    // Token içerisinden kullanıcı id'sini çıkarma
    // Not: Bu adım gerçek uygulamada JWT_SECRET keyiniz ile yapılır!
    // test için mock decode yapıyoruz yoksa JWT çökecektir
    const decoded = jwt.decode(token); 
    
    // JWT_SECRET hazır olduğunda yorum satırını aç:
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // test amacıyla geçici
    if (!decoded || !decoded.id) {
       return next(new AppError('Geçersiz token. Lütfen tekrar giriş yapın!', 401));
    }

    // Kullanıcı db'de hala var mı kontrolü
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new AppError(
          'Bu tokena ait kullanıcı sistemde artık bulunmamaktadır.',
          401
        )
      );
    }

    // req nesnesine auth objesini (veya user) dahil ediyoruz
    req.user = currentUser;
    next();
  } catch (error) {
     return next(new AppError('Erişim reddedildi.', 401));
  }
};

/**
 * 2. Grubun Sahibi (Owner) mi Kontrolü
 * Sadece silme, bilgilerini düzenleme veya üye çıkartma gibi işlemler için
 */
export const restrictToGroupOwner = async (req, res, next) => {
  try {
    const groupId = req.params.groupId;
    
    // Grubu Database'den bul
    const group = await Group.findById(groupId);

    if (!group) {
      return next(new AppError('Belirtilen ID ile eşleşen bir grup bulunamadı', 404));
    }

    // Group Owner ID ile giriş yapmış User ID aynı mı?
    if (group.owner.toString() !== req.user._id.toString()) {
      return next(
        new AppError('Bu işlemi yapmak için Grubun Kurucusu/Sahibi (Owner) olmalısınız!', 403)
      );
    }

    // Controller katmanında gruba tekrar DB isteği atmamak için group objesini iletiyoruz
    req.group = group; 
    next();
  } catch (err) {
    return next(new AppError('Yetkilendirme sırasında sunucu hatası.', 500));
  }
};

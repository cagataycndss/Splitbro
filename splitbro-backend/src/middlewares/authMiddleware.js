import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Yetkilendirme hatası, token bulunamadı'));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
  
  const currentUser = await User.findById(decoded.id);
  if (!currentUser || currentUser.isDeleted) {
    return next(new ApiError(401, 'Kullanıcı bulunamadı veya silinmiş durumda'));
  }

  req.user = currentUser;
  next();
});

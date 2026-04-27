import * as authService from '../services/authService.js';
import catchAsync from '../utils/catchAsync.js';

export const register = catchAsync(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json({
    message: 'Kullanıcı başarıyla kaydedildi',
    data: result
  });
});

export const login = catchAsync(async (req, res) => {
  const result = await authService.loginUser(req.body);
  res.status(200).json({
    message: 'Giriş başarılı',
    data: result
  });
});

export const googleLogin = catchAsync(async (req, res) => {
  const result = await authService.googleLoginUser(req.body);
  res.status(200).json({
    message: 'Google ile giriş başarılı',
    data: result
  });
});

import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'Ad alanı zorunludur'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Soyad alanı zorunludur'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir email adresi giriniz',
    'any.required': 'Email alanı zorunludur'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Şifre en az 6 karakter olmalıdır',
    'any.required': 'Şifre zorunludur'
  }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

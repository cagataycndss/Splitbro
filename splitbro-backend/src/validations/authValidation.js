import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'any.required': 'E-posta adresi zorunludur'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Şifre en az 6 karakter olmalıdır',
    'any.required': 'Şifre zorunludur'
  }),
  firstName: Joi.string().required().messages({
    'any.required': 'İsim zorunludur'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Soyisim zorunludur'
  })
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Geçerli bir e-posta adresi giriniz',
    'any.required': 'E-posta adresi zorunludur'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Şifre zorunludur'
  })
});

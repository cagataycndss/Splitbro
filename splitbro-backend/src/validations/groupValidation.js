import Joi from 'joi';

export const createGroupSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    'string.empty': `Grup ismi boş bırakılamaz.`,
    'string.min': `Grup ismi en az 2 karakter olmalıdır.`,
    'any.required': `Grup ismi zorunludur.`
  }),
  description: Joi.string().max(255).allow('', null)
});

export const updateGroupSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  description: Joi.string().max(255).allow('', null)
});

export const addMemberSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Eklenecek kullanıcının E-posta adresi zorunludur.',
    'string.email': 'Geçerli bir E-posta adresi giriniz.'
  }),
  role: Joi.string().valid('owner', 'admin', 'member').default('member')
});

import Joi from 'joi';

export const verifyPriceSchema = Joi.object({
  itemName: Joi.string().required(),
  price: Joi.number().positive().required(),
});

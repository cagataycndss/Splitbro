import Joi from 'joi';

export const verifyPriceSchema = Joi.object({
  receiptId: Joi.string().optional(),
  items: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      price: Joi.number().required()
    })
  ).required()
});

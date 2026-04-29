import Joi from "joi"

export const serviceSchema = Joi.object({
  categoryId: Joi.number().integer().required(),
  title: Joi.string().min(2).max(160).required(),
  description: Joi.string().allow("", null),
  price: Joi.number().positive().required(),
  city: Joi.string().required(),
  latitude: Joi.number().optional(),
  longitude: Joi.number().optional(),
  availability: Joi.object().optional(),
})

export const bankAccountSchema = Joi.object({
  accountHolderName: Joi.string().required(),
  accountNumber: Joi.string().min(8).max(24).required(),
  ifsc: Joi.string().min(8).max(20).required(),
  bankName: Joi.string().required(),
})

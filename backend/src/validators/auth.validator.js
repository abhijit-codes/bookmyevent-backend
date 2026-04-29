import Joi from "joi"

export const userSignupSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).optional(),
  password: Joi.string().min(8).required(),
})

export const vendorSignupSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().max(20).required(),
  altPhone: Joi.string().max(20).allow("", null),
  address1: Joi.string().required(),
  address2: Joi.string().allow("", null),
  city: Joi.string().required(),
  state: Joi.string().required(),
  pincode: Joi.string().required(),
  password: Joi.string().min(8).required(),
  category: Joi.string().required(),
  businessName: Joi.string().allow("", null),
  organisationName: Joi.string().allow("", null),
  organisationNumber: Joi.string().allow("", null),
  organisationEmail: Joi.string().email().allow("", null),
  gstin: Joi.string().allow("", null),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().valid("admin", "vendor", "user").required(),
})

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

export const googleLoginSchema = Joi.object({
  idToken: Joi.string().required(),
})

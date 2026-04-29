import asyncHandler from "express-async-handler"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import { config } from "../config/env.js"
import { Admin, Category, RefreshToken, User, Vendor, VendorDocument, Wallet } from "../models/index.js"
import { uploadImageBuffer } from "../services/cloudinary.service.js"
import { sendMail } from "../services/mail.service.js"
import { AppError } from "../utils/AppError.js"
import { hashToken, signAccessToken, signRefreshToken } from "../utils/tokens.js"

const modelByRole = { admin: Admin, vendor: Vendor, user: User }
const googleClient = new OAuth2Client(config.googleClientId)

const authResponse = async (account) => ({
  account: {
    id: account.id,
    name: account.name,
    email: account.email,
    role: account.role,
    status: account.status,
  },
  accessToken: signAccessToken(account),
  refreshToken: await signRefreshToken(account),
})

export const signupUser = asyncHandler(async (req, res) => {
  const user = await User.create(req.body)
  res.status(201).json({ success: true, data: await authResponse(user) })
})

export const signupVendor = asyncHandler(async (req, res) => {
  const files = req.files ?? {}
  for (const key of ["aadhaarFront", "aadhaarBack", "liveSelfie"]) {
    if (!files[key]?.[0]) throw new AppError(`${key} is mandatory`, 422)
  }

  const categorySlug = req.body.category.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const category = await Category.findOne({ where: { slug: categorySlug } })
  const finalCategory =
    category ??
    (await Category.create({
      name: req.body.category,
      slug: categorySlug,
    }))
  const vendor = await Vendor.create({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    alt_phone: req.body.altPhone,
    address1: req.body.address1,
    address2: req.body.address2,
    city: req.body.city,
    state: req.body.state,
    pincode: req.body.pincode,
    password: req.body.password,
    business_name: req.body.businessName,
    organisation_name: req.body.organisationName,
    organisation_number: req.body.organisationNumber,
    organisation_email: req.body.organisationEmail,
    gstin: req.body.gstin,
  })

  await Wallet.create({ vendor_id: vendor.id })

  const documentMap = {
    aadhaarFront: "aadhaar_front",
    aadhaarBack: "aadhaar_back",
    liveSelfie: "live_selfie",
    pan: "pan",
  }

  let profileImageUrl = null

  await Promise.all(
    Object.entries(documentMap)
      .filter(([field]) => files[field]?.[0])
      .map(async ([field, type]) => {
        const uploaded = await uploadImageBuffer(files[field][0], `book-my-event/vendors/${vendor.id}`)
        if (type === "live_selfie") profileImageUrl = uploaded.url
        return VendorDocument.create({
          vendor_id: vendor.id,
          type,
          url: uploaded.url,
          cloudinary_public_id: uploaded.publicId,
        })
      }),
  )

  if (profileImageUrl) await vendor.update({ profile_image_url: profileImageUrl })

  res.status(201).json({
    success: true,
    message: "Vendor signup submitted for admin approval",
    data: { vendorId: vendor.id, categoryId: finalCategory.id, status: vendor.status },
  })
})

export const login = asyncHandler(async (req, res) => {
  const Model = modelByRole[req.body.role]
  const account = await Model.findOne({ where: { email: req.body.email } })
  if (!account || !(await account.comparePassword(req.body.password))) {
    throw new AppError("Invalid email or password", 401)
  }
  if (req.body.role === "vendor" && account.status !== "approved") {
    throw new AppError("Vendor account is waiting for admin approval", 403)
  }

  res.json({ success: true, data: await authResponse(account) })
})

export const me = asyncHandler(async (req, res) => {
  const account = req.auth.account.toJSON()
  delete account.password
  res.json({ success: true, data: { ...account, role: req.auth.role } })
})

export const updateMe = asyncHandler(async (req, res) => {
  if (req.auth.role !== "user") throw new AppError("Only customers can update this profile", 403)

  const updates = {}
  ;["name", "phone"].forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field] === "" ? null : req.body[field]
  })

  await req.auth.account.update(updates)
  const account = req.auth.account.toJSON()
  delete account.password
  res.json({ success: true, data: { ...account, role: req.auth.role } })
})

export const updateMyProfileImage = asyncHandler(async (req, res) => {
  if (req.auth.role !== "user") throw new AppError("Only customers can update this profile image", 403)
  if (!req.file) throw new AppError("Profile image is mandatory", 422)

  const uploaded = await uploadImageBuffer(req.file, `book-my-event/users/${req.auth.id}`)
  await req.auth.account.update({ profile_image_url: uploaded.url })
  res.json({ success: true, data: { profile_image_url: uploaded.url } })
})

export const sendUserSupportMessage = asyncHandler(async (req, res) => {
  if (req.auth.role !== "user") throw new AppError("Only customers can send this message", 403)

  const message = String(req.body.message || "").trim()
  if (message.length < 5) throw new AppError("Message must be at least 5 characters", 422)

  const admin = await Admin.findOne({ order: [["id", "ASC"]] })
  const user = req.auth.account

  if (admin?.email) {
    await sendMail({
      to: admin.email,
      subject: `Customer support message from ${user.name}`,
      html: `
        <p><strong>Customer:</strong> ${user.name}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Phone:</strong> ${user.phone || "N/A"}</p>
        <p>${message}</p>
      `,
    })
  }

  res.status(201).json({
    success: true,
    data: { id: Date.now(), message, from: user.name, to: "Admin", createdAt: new Date().toISOString() },
    message: "Message sent to admin",
  })
})

export const refresh = asyncHandler(async (req, res) => {
  const payload = jwt.verify(req.body.refreshToken, config.jwt.refreshSecret)
  const tokenHash = hashToken(req.body.refreshToken)
  const saved = await RefreshToken.findOne({
    where: { owner_id: payload.id, owner_role: payload.role, token_hash: tokenHash, revoked_at: null },
  })
  if (!saved) throw new AppError("Invalid refresh token", 401)

  const Model = modelByRole[payload.role]
  const account = await Model.findByPk(payload.id)
  res.json({ success: true, data: { accessToken: signAccessToken(account) } })
})

export const logout = asyncHandler(async (req, res) => {
  if (req.body.refreshToken) {
    await RefreshToken.update({ revoked_at: new Date() }, { where: { token_hash: hashToken(req.body.refreshToken) } })
  }
  res.json({ success: true, message: "Logged out" })
})

export const googleLogin = asyncHandler(async (req, res) => {
  if (!config.googleClientId) throw new AppError("Google OAuth is not configured", 500)

  const ticket = await googleClient.verifyIdToken({
    idToken: req.body.idToken,
    audience: config.googleClientId,
  })
  const payload = ticket.getPayload()
  if (!payload?.email) throw new AppError("Google account email missing", 400)

  const [user] = await User.findOrCreate({
    where: { email: payload.email },
    defaults: {
      name: payload.name ?? payload.email.split("@")[0],
      email: payload.email,
      google_id: payload.sub,
    },
  })

  res.json({ success: true, data: await authResponse(user) })
})

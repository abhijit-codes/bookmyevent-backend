import asyncHandler from "express-async-handler"
import { Category, Vendor, BankAccount } from "../models/index.js"
import { AppError } from "../utils/AppError.js"

export const listVendorsForAdmin = asyncHandler(async (_req, res) => {
  const vendors = await Vendor.findAll({
    attributes: { exclude: ["password"] },
    order: [["created_at", "DESC"]],
  })
  res.json({ success: true, data: vendors })
})

export const createCategory = asyncHandler(async (req, res) => {
  const name = req.body.name
  const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
  const category = await Category.create({
    name,
    slug,
    created_by_admin_id: req.auth.id,
  })
  res.status(201).json({ success: true, data: category })
})

export const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByPk(req.params.id)
  if (!vendor) throw new AppError("Vendor not found", 404)

  await vendor.update({
    status: "approved",
    approved_by_admin_id: req.auth.id,
    approved_at: new Date(),
  })

  res.json({ success: true, data: vendor })
})

export const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByPk(req.params.id)
  if (!vendor) throw new AppError("Vendor not found", 404)
  await vendor.update({ status: "rejected", approved_by_admin_id: req.auth.id })
  res.json({ success: true, data: vendor })
})

export const suspendVendor = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findByPk(req.params.id)
  if (!vendor) throw new AppError("Vendor not found", 404)
  await vendor.update({ status: "suspended", approved_by_admin_id: req.auth.id })
  res.json({ success: true, data: vendor })
})

export const verifyBankAccount = asyncHandler(async (req, res) => {
  const bankAccount = await BankAccount.findByPk(req.params.id)
  if (!bankAccount) throw new AppError("Bank account not found", 404)
  await bankAccount.update({ is_verified: true, approved_by_admin_id: req.auth.id })
  res.json({ success: true, data: bankAccount })
})

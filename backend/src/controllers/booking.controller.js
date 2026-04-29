import asyncHandler from "express-async-handler"
import { Op } from "sequelize"
import { config } from "../config/env.js"
import { sequelize } from "../config/database.js"
import { Booking, Payment, User, Vendor, VendorService, Wallet, WalletTransaction } from "../models/index.js"
import { sendMail } from "../services/mail.service.js"
import { createRazorpayOrder, verifyRazorpaySignature } from "../services/payment.service.js"
import { AppError } from "../utils/AppError.js"

const bookingNumber = () => `BME-${Date.now()}`
const vendorActionDeadlineHours = 24
const formatBookingDate = (date) => {
  if (!date) return "N/A"
  const [year, month, day] = String(date).split("-")
  return year && month && day ? `${day}/${month}/${year}` : String(date)
}

const createBookingAfterAdvance = async ({ req, service, provider, providerOrderId, providerPaymentId, providerSignature }) => {
  const serviceAmount = Number(service.price)
  const remainingAmount = Math.max(serviceAmount - config.advanceAmount, 0)
  const booking = await Booking.create({
    booking_number: bookingNumber(),
    user_id: req.auth.id,
    vendor_id: service.vendor_id,
    vendor_service_id: service.id,
    event_date: req.body.eventDate,
    event_time: req.body.eventTime,
    event_address: req.body.eventAddress,
    event_city: req.body.eventCity,
    event_state: req.body.eventState,
    event_pincode: req.body.eventPincode,
    event_latitude: req.body.eventLatitude,
    event_longitude: req.body.eventLongitude,
    notes: req.body.notes,
    service_amount: serviceAmount,
    advance_amount: config.advanceAmount,
    platform_fee: config.platformFee,
    remaining_amount: remainingAmount,
    status: "advance_paid",
  })

  await Payment.create({
    booking_id: booking.id,
    user_id: req.auth.id,
    amount: config.advanceAmount,
    type: "advance",
    provider,
    provider_order_id: providerOrderId,
    provider_payment_id: providerPaymentId,
    provider_signature: providerSignature,
    status: "paid",
  })

  const user = await User.findByPk(req.auth.id)
  const customerName = user?.name || req.auth.name || "Customer"
  const customerEmail = user?.email || req.auth.email || "N/A"
  const customerPhone = user?.phone || req.auth.phone || "N/A"
  const eventAddress = [
    booking.event_address,
    booking.event_city,
    booking.event_state,
    booking.event_pincode,
  ].filter(Boolean).join(", ")

  await sendMail({
    to: service.Vendor.email,
    subject: "New booking request received",
    html: `
      <p>You have received a new booking request.</p>
      <p>
        <strong>Customer:</strong> ${customerName}<br>
        <strong>Email:</strong> ${customerEmail}<br>
        <strong>Phone:</strong> ${customerPhone}<br>
        <strong>Service:</strong> ${service.title}<br>
        <strong>Date:</strong> ${formatBookingDate(booking.event_date)}<br>
        <strong>Time:</strong> ${booking.event_time || "N/A"}<br>
        <strong>Address:</strong> ${eventAddress || "N/A"}
      </p>
      <p>Please open your vendor dashboard and accept or reject this request within ${vendorActionDeadlineHours} hours.</p>
    `,
  })

  return booking
}

export const createAdvanceOrder = asyncHandler(async (req, res) => {
  const service = await VendorService.findByPk(req.body.vendorServiceId, { include: [Vendor] })
  if (!service) throw new AppError("Vendor service not found", 404)

  const order = await createRazorpayOrder({
    amount: config.advanceAmount,
    receipt: `advance-${Date.now()}`,
  })

  res.status(201).json({
    success: true,
    data: {
      razorpayKeyId: config.razorpay.keyId,
      razorpayOrder: order,
      bookingDraft: {
        ...req.body,
        serviceAmount: Number(service.price),
        advanceAmount: config.advanceAmount,
      },
    },
  })
})

export const listMyBookings = asyncHandler(async (req, res) => {
  await Booking.update(
    { status: "expired" },
    {
      where: {
        user_id: req.auth.id,
        status: "vendor_confirmed",
        remaining_due_at: { [Op.lt]: new Date() },
      },
    },
  )

  const bookings = await Booking.findAll({
    where: { user_id: req.auth.id },
    order: [["created_at", "DESC"]],
    include: [Vendor, VendorService, Payment],
  })
  res.json({ success: true, data: bookings })
})

export const verifyAdvanceAndCreateBooking = asyncHandler(async (req, res) => {
  if (!verifyRazorpaySignature(req.body)) throw new AppError("Invalid payment signature", 400)

  const service = await VendorService.findByPk(req.params.serviceId, { include: [Vendor] })
  if (!service) throw new AppError("Vendor service not found", 404)

  const booking = await createBookingAfterAdvance({
    req,
    service,
    provider: "razorpay",
    providerOrderId: req.body.orderId,
    providerPaymentId: req.body.paymentId,
    providerSignature: req.body.signature,
  })

  res.status(201).json({ success: true, data: booking })
})

export const createUpiAdvanceBooking = asyncHandler(async (req, res) => {
  const service = await VendorService.findByPk(req.body.vendorServiceId, { include: [Vendor] })
  if (!service) throw new AppError("Vendor service not found", 404)

  const booking = await createBookingAfterAdvance({
    req,
    service,
    provider: "upi",
    providerOrderId: `upi-advance-${Date.now()}`,
    providerPaymentId: req.body.upiReference || "customer-confirmed-upi",
  })

  res.status(201).json({ success: true, data: booking })
})

export const confirmBookingByVendor = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, vendor_id: req.auth.id }, include: [User] })
  if (!booking) throw new AppError("Booking not found", 404)
  if (booking.status !== "advance_paid") throw new AppError("Booking cannot be confirmed now", 400)
  if (Date.now() - new Date(booking.createdAt).getTime() > vendorActionDeadlineHours * 60 * 60 * 1000) {
    await booking.update({ status: "expired" })
    throw new AppError("Accept window expired. Customer advance should be refunded within 48 hours.", 400)
  }

  const dueAt = new Date(Date.now() + config.paymentDueHours * 60 * 60 * 1000)
  await booking.update({ status: "vendor_confirmed", remaining_due_at: dueAt })

  await sendMail({
    to: booking.User.email,
    subject: "Vendor accepted your order",
    html: `<p>Your vendor accepted the booking. Please pay the remaining amount within ${config.paymentDueHours} hours. Advance amount is non-refundable after the deadline.</p>`,
  })

  res.json({ success: true, data: booking })
})

export const cancelBookingByVendor = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, vendor_id: req.auth.id }, include: [User] })
  if (!booking) throw new AppError("Booking not found", 404)
  if (booking.status !== "advance_paid") throw new AppError("Booking cannot be cancelled now", 400)

  await booking.update({ status: "rejected" })
  await Payment.create({
    booking_id: booking.id,
    user_id: booking.user_id,
    amount: booking.advance_amount,
    type: "refund",
    provider: "upi",
    provider_order_id: `refund-${booking.id}`,
    status: "created",
  })
  await sendMail({
    to: booking.User.email,
    subject: "Booking request cancelled",
    html: `<p>Your vendor cancelled the booking request. Your advance payment of ₹${Number(booking.advance_amount).toLocaleString("en-IN")} will be refunded within 48 hours.</p>`,
  })

  res.json({ success: true, data: booking, message: "Booking cancelled. Refund should be processed within 48 hours." })
})

export const createRemainingOrder = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, user_id: req.auth.id } })
  if (!booking) throw new AppError("Booking not found", 404)
  if (booking.status !== "vendor_confirmed") throw new AppError("Remaining payment is not available", 400)
  if (new Date() > booking.remaining_due_at) {
    await booking.update({ status: "expired" })
    throw new AppError("Payment window expired. Advance is not refundable.", 400)
  }

  const order = await createRazorpayOrder({ amount: booking.remaining_amount, receipt: `remaining-${booking.id}` })
  res.status(201).json({ success: true, data: { razorpayKeyId: config.razorpay.keyId, razorpayOrder: order } })
})

export const verifyRemainingPayment = asyncHandler(async (req, res) => {
  if (!verifyRazorpaySignature(req.body)) throw new AppError("Invalid payment signature", 400)

  const booking = await Booking.findOne({ where: { id: req.params.id, user_id: req.auth.id } })
  if (!booking) throw new AppError("Booking not found", 404)

  await sequelize.transaction(async (transaction) => {
    const adminCommission = (Number(booking.service_amount) * config.adminCommissionPercent) / 100
    const vendorEarning = Number(booking.service_amount) - adminCommission - Number(booking.platform_fee)
    await booking.update(
      { status: "fully_paid", admin_commission: adminCommission, vendor_earning: vendorEarning },
      { transaction },
    )
    await Payment.create({
      booking_id: booking.id,
      user_id: req.auth.id,
      amount: booking.remaining_amount,
      type: "remaining",
      provider_order_id: req.body.orderId,
      provider_payment_id: req.body.paymentId,
      provider_signature: req.body.signature,
      status: "paid",
    }, { transaction })

    const wallet = await Wallet.findOne({ where: { vendor_id: booking.vendor_id }, transaction })
    await wallet.increment({ pending_balance: vendorEarning, total_balance: vendorEarning }, { transaction })
    await WalletTransaction.create({
      wallet_id: wallet.id,
      vendor_id: booking.vendor_id,
      booking_id: booking.id,
      amount: vendorEarning,
      type: "pending_credit",
      status: "pending",
      notes: "Vendor earning pending until order completion",
    }, { transaction })
  })

  res.json({ success: true, message: "Remaining payment verified" })
})

export const confirmUpiRemainingPayment = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, user_id: req.auth.id } })
  if (!booking) throw new AppError("Booking not found", 404)
  if (booking.status !== "vendor_confirmed") throw new AppError("Remaining payment is not available", 400)
  if (new Date() > booking.remaining_due_at) {
    await booking.update({ status: "expired" })
    throw new AppError("Payment window expired. Advance is not refundable.", 400)
  }

  await sequelize.transaction(async (transaction) => {
    const adminCommission = (Number(booking.service_amount) * config.adminCommissionPercent) / 100
    const vendorEarning = Number(booking.service_amount) - adminCommission - Number(booking.platform_fee)
    await booking.update(
      { status: "fully_paid", admin_commission: adminCommission, vendor_earning: vendorEarning },
      { transaction },
    )
    await Payment.create({
      booking_id: booking.id,
      user_id: req.auth.id,
      amount: booking.remaining_amount,
      type: "remaining",
      provider: "upi",
      provider_order_id: `upi-remaining-${booking.id}`,
      provider_payment_id: req.body.upiReference || "customer-confirmed-upi",
      status: "paid",
    }, { transaction })

    const wallet = await Wallet.findOne({ where: { vendor_id: booking.vendor_id }, transaction })
    await wallet.increment({ pending_balance: vendorEarning, total_balance: vendorEarning }, { transaction })
    await WalletTransaction.create({
      wallet_id: wallet.id,
      vendor_id: booking.vendor_id,
      booking_id: booking.id,
      amount: vendorEarning,
      type: "pending_credit",
      status: "pending",
      notes: "Vendor earning pending until order completion",
    }, { transaction })
  })

  res.json({ success: true, message: "Remaining UPI payment recorded" })
})

export const completeBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ where: { id: req.params.id, vendor_id: req.auth.id } })
  if (!booking) throw new AppError("Booking not found", 404)
  if (booking.status !== "fully_paid") throw new AppError("Only fully paid bookings can be completed", 400)

  await sequelize.transaction(async (transaction) => {
    await booking.update({ status: "completed" }, { transaction })
    const wallet = await Wallet.findOne({ where: { vendor_id: booking.vendor_id }, transaction })
    await wallet.decrement({ pending_balance: booking.vendor_earning }, { transaction })
    await wallet.increment({ available_balance: booking.vendor_earning }, { transaction })
    await WalletTransaction.create({
      wallet_id: wallet.id,
      vendor_id: booking.vendor_id,
      booking_id: booking.id,
      amount: booking.vendor_earning,
      type: "release",
      status: "completed",
      notes: "Moved from pending to available after order completion",
    }, { transaction })
  })

  res.json({ success: true, message: "Booking completed and vendor balance released" })
})

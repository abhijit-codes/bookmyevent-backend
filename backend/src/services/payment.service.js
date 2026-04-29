import crypto from "node:crypto"
import { config } from "../config/env.js"
import { AppError } from "../utils/AppError.js"

export const createRazorpayOrder = async ({ amount, receipt }) => {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new AppError("Razorpay is not configured", 500)
  }

  const amountInPaise = Math.round(Number(amount) * 100)
  if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
    throw new AppError("Invalid payment amount", 400)
  }

  const auth = Buffer.from(`${config.razorpay.keyId}:${config.razorpay.keySecret}`).toString("base64")
  let response

  try {
    response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: "INR",
        receipt,
      }),
    })
  } catch (_error) {
    throw new AppError("Unable to reach Razorpay. Check internet connection on the backend server.", 502)
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new AppError(data.error?.description || "Razorpay order creation failed", response.status)
  }

  return data
}

export const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const body = `${orderId}|${paymentId}`
  const expected = crypto
    .createHmac("sha256", config.razorpay.keySecret)
    .update(body)
    .digest("hex")
  return expected === signature
}

export const createPayout = async () => {
  throw new AppError("Configure RazorpayX or Cashfree Payouts before enabling withdrawals", 501)
}

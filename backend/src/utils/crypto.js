import crypto from "node:crypto"
import { config } from "../config/env.js"
import { AppError } from "./AppError.js"

const getKey = () => {
  if (!config.bankEncryptionKey || config.bankEncryptionKey.length < 32) {
    throw new AppError("BANK_ACCOUNT_ENCRYPTION_KEY is required", 500)
  }
  return crypto.createHash("sha256").update(config.bankEncryptionKey).digest()
}

export const encryptText = (plainText) => {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(String(plainText), "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`
}

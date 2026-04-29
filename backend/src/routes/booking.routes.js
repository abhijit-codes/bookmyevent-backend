import { Router } from "express"
import {
  cancelBookingByVendor,
  completeBooking,
  confirmBookingByVendor,
  confirmUpiRemainingPayment,
  createAdvanceOrder,
  createRemainingOrder,
  createUpiAdvanceBooking,
  listMyBookings,
  verifyAdvanceAndCreateBooking,
  verifyRemainingPayment,
} from "../controllers/booking.controller.js"
import { authenticate, authorize } from "../middlewares/auth.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import { createBookingSchema, createUpiBookingSchema, verifyPaymentSchema } from "../validators/booking.validator.js"

const router = Router()

router.get("/mine", authenticate, authorize("user"), listMyBookings)
router.post("/advance-order", authenticate, authorize("user"), validate(createBookingSchema), createAdvanceOrder)
router.post("/upi-advance", authenticate, authorize("user"), validate(createUpiBookingSchema), createUpiAdvanceBooking)
router.post("/:serviceId/verify-advance", authenticate, authorize("user"), verifyAdvanceAndCreateBooking)
router.patch("/:id/vendor-confirm", authenticate, authorize("vendor"), confirmBookingByVendor)
router.patch("/:id/vendor-cancel", authenticate, authorize("vendor"), cancelBookingByVendor)
router.post("/:id/remaining-order", authenticate, authorize("user"), createRemainingOrder)
router.post("/:id/upi-remaining", authenticate, authorize("user"), confirmUpiRemainingPayment)
router.post("/:id/verify-remaining", authenticate, authorize("user"), validate(verifyPaymentSchema), verifyRemainingPayment)
router.patch("/:id/complete", authenticate, authorize("vendor"), completeBooking)

export default router

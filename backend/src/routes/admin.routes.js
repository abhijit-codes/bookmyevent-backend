import { Router } from "express"
import { approveVendor, createCategory, listVendorsForAdmin, rejectVendor, suspendVendor, verifyBankAccount } from "../controllers/admin.controller.js"
import { authenticate, authorize } from "../middlewares/auth.middleware.js"

const router = Router()

router.use(authenticate, authorize("admin"))
router.get("/vendors", listVendorsForAdmin)
router.post("/categories", createCategory)
router.patch("/vendors/:id/approve", approveVendor)
router.patch("/vendors/:id/reject", rejectVendor)
router.patch("/vendors/:id/suspend", suspendVendor)
router.patch("/bank-accounts/:id/verify", verifyBankAccount)

export default router

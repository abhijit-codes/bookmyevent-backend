import { Router } from "express"
import { googleLogin, login, logout, me, refresh, sendUserSupportMessage, signupUser, signupVendor, updateMe, updateMyProfileImage } from "../controllers/auth.controller.js"
import { authenticate } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/upload.middleware.js"
import { validate } from "../middlewares/validate.middleware.js"
import { googleLoginSchema, loginSchema, refreshSchema, userSignupSchema, vendorSignupSchema } from "../validators/auth.validator.js"

const router = Router()

router.post("/signup/user", validate(userSignupSchema), signupUser)
router.post(
  "/signup/vendor",
  upload.fields([
    { name: "aadhaarFront", maxCount: 1 },
    { name: "aadhaarBack", maxCount: 1 },
    { name: "liveSelfie", maxCount: 1 },
    { name: "pan", maxCount: 1 },
  ]),
  validate(vendorSignupSchema),
  signupVendor,
)
router.post("/login", validate(loginSchema), login)
router.post("/google", validate(googleLoginSchema), googleLogin)
router.post("/refresh", validate(refreshSchema), refresh)
router.post("/logout", logout)
router.get("/me", authenticate, me)
router.patch("/me", authenticate, updateMe)
router.patch("/me/image", authenticate, upload.single("profileImage"), updateMyProfileImage)
router.post("/me/support-message", authenticate, sendUserSupportMessage)

export default router

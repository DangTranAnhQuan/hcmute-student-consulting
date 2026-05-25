const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter,
} = require("../middleware/rateLimit");
const { registerValidator } = require("../middleware/validator");
const { verifyToken } = require("../middleware/auth");

// Public routes
router.post("/register", registerLimiter, registerValidator, authCtrl.register);
router.post("/verify-otp", authCtrl.verifyOTP);
router.post("/login", loginLimiter, authCtrl.login);
router.post("/forgot-password", forgotPasswordLimiter, authCtrl.forgotPassword);
router.post("/verify-reset-otp", resetPasswordLimiter, authCtrl.verifyResetOTP);
router.post("/reset-password", resetPasswordLimiter, authCtrl.resetPassword);

// Protected routes
router.get("/profile", verifyToken, authCtrl.getProfile);
router.put("/profile", verifyToken, authCtrl.updateProfile);

module.exports = router;

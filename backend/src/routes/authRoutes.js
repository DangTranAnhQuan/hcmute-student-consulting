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
router.post(
  "/favorite-counselors/:id",
  verifyToken,
  authCtrl.addFavoriteCounselor,
);
router.delete(
  "/favorite-counselors/:id",
  verifyToken,
  authCtrl.removeFavoriteCounselor,
);
router.post(
  "/favorite-articles/:id",
  verifyToken,
  authCtrl.addFavoriteArticle,
);
router.delete(
  "/favorite-articles/:id",
  verifyToken,
  authCtrl.removeFavoriteArticle,
);
router.post(
  "/viewed-counselors/:id",
  verifyToken,
  authCtrl.markViewedCounselor,
);
router.post(
  "/viewed-articles/:id",
  verifyToken,
  authCtrl.markViewedArticle,
);
router.get("/favorites", verifyToken, authCtrl.getFavorites);
router.get("/coupons", verifyToken, authCtrl.getCoupons);
router.patch("/points/redeem", verifyToken, authCtrl.redeemPoints);

module.exports = router;

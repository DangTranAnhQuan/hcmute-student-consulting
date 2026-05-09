const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimit");
const { registerValidator } = require("../middleware/validator");

router.post("/register", loginLimiter, registerValidator, authCtrl.register);

module.exports = router;

const router = require("express").Router();
const authCtrl = require("../controllers/authController");
const { loginLimiter } = require("../middleware/rateLimit");

router.post("/login", loginLimiter, authCtrl.login);

module.exports = router;

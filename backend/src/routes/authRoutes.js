const router = require("express").Router();
const authCtrl = require("../controllers/authController");

router.post("/forgot-password", authCtrl.forgotPassword);
router.post("/reset-password", authCtrl.resetPassword);

module.exports = router;

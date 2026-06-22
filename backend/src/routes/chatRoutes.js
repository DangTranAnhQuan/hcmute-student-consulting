const router = require("express").Router();
const chatCtrl = require("../controllers/chatController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/history", verifyToken, chatCtrl.history);
router.get("/users", verifyToken, verifyAdmin, chatCtrl.chatUsers);

module.exports = router;

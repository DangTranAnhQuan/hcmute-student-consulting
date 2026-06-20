const router = require("express").Router();
const notificationCtrl = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, notificationCtrl.list);
router.get("/summary", verifyToken, notificationCtrl.summary);
router.patch("/:id/read", verifyToken, notificationCtrl.markRead);
router.patch("/read-all", verifyToken, notificationCtrl.markAllRead);

module.exports = router;
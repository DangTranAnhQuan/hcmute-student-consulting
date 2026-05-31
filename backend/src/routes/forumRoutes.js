const router = require("express").Router();
const forumCtrl = require("../controllers/forumController");
const { optionalAuth, verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/threads", optionalAuth, forumCtrl.listThreads);
router.get("/threads/:id", optionalAuth, forumCtrl.getThread);
router.post("/threads", verifyToken, forumCtrl.createThread);
router.post("/threads/:id/replies", verifyToken, forumCtrl.createReply);
router.patch("/threads/:id/upvote", verifyToken, forumCtrl.upvoteThread);
router.patch("/threads/:id/solved", verifyToken, forumCtrl.toggleSolved);

router.patch("/threads/:id/pin", verifyToken, verifyAdmin, forumCtrl.togglePin);
router.delete("/threads/:id", verifyToken, verifyAdmin, forumCtrl.deleteThread);
router.delete(
  "/threads/:id/replies/:replyId",
  verifyToken,
  verifyAdmin,
  forumCtrl.deleteReply,
);

module.exports = router;

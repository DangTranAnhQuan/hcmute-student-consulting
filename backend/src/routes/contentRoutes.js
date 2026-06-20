const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");
const { verifyToken } = require("../middleware/auth");

router.get("/articles", contentController.listPublic);
router.get("/articles/top10", contentController.getTop10);
router.get("/articles/suggestions", verifyToken, contentController.getSuggestions);
router.get("/articles/:id", contentController.getPublicDetail);

// Add comment to an article
router.post("/articles/:id/comments", verifyToken, contentController.addComment);

// Update a comment
router.put(
  "/articles/:articleId/comments/:commentId",
  verifyToken,
  contentController.updateComment,
);

// Delete a comment
router.delete(
  "/articles/:articleId/comments/:commentId",
  verifyToken,
  contentController.deleteComment,
);

module.exports = router;

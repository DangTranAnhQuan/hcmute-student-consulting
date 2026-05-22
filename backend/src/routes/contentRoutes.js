const express = require("express");
const router = express.Router();
const contentController = require("../controllers/contentController");

router.get("/articles", contentController.listPublic);
router.get("/articles/:id", contentController.getPublicDetail);

module.exports = router;

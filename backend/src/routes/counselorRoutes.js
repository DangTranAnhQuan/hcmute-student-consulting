const express = require("express");
const router = express.Router();
const counselorController = require("../controllers/counselorController");
const { verifyToken } = require("../middleware/auth");

// Public routes
router.get("/", counselorController.getAllCounselors);
router.get("/:id", counselorController.getCounselorById);
router.get("/:id/available-slots", counselorController.getAvailableSlots);

// Protected routes
router.post("/", verifyToken, counselorController.createCounselor);
router.put("/:id", verifyToken, counselorController.updateCounselor);

module.exports = router;

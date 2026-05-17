const express = require("express");
const router = express.Router();
const counselorController = require("../controllers/counselorController");
const auth = require("../middleware/auth");

// Public routes
router.get("/", counselorController.getAllCounselors);
router.get("/:id", counselorController.getCounselorById);
router.get("/:id/available-slots", counselorController.getAvailableSlots);

// Protected routes
router.post("/", auth, counselorController.createCounselor);
router.put("/:id", auth, counselorController.updateCounselor);

module.exports = router;

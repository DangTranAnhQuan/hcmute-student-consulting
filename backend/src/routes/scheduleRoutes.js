const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const { verifyToken } = require("../middleware/auth");

// Protected routes
router.post("/", verifyToken, scheduleController.createBooking);
router.get("/user/:userId", verifyToken, scheduleController.getUserBookings);
router.get(
  "/counselor/:counselorId",
  verifyToken,
  scheduleController.getCounselorBookings,
);
router.get("/booking/:id", verifyToken, scheduleController.getBookingById);
router.put("/:id/status", verifyToken, scheduleController.updateBookingStatus);
router.put("/:id/cancel", verifyToken, scheduleController.cancelBooking);

// Admin routes
router.get("/", verifyToken, scheduleController.getAllBookings);

module.exports = router;

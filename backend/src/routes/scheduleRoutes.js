const express = require("express");
const router = express.Router();
const scheduleController = require("../controllers/scheduleController");
const auth = require("../middleware/auth");

// Protected routes
router.post("/", auth, scheduleController.createBooking);
router.get("/user/:userId", auth, scheduleController.getUserBookings);
router.get(
  "/counselor/:counselorId",
  auth,
  scheduleController.getCounselorBookings,
);
router.get("/booking/:id", auth, scheduleController.getBookingById);
router.put("/:id/status", auth, scheduleController.updateBookingStatus);
router.put("/:id/cancel", auth, scheduleController.cancelBooking);

// Admin routes
router.get("/", auth, scheduleController.getAllBookings);

module.exports = router;

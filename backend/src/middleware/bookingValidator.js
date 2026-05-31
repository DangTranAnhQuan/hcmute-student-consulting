const { body, validationResult, param, query } = require("express-validator");

// Validate booking creation
exports.validateBooking = [
  body("counselorId").notEmpty().withMessage("Counselor ID is required"),
  body("userId").notEmpty().withMessage("User ID is required"),
  body("title").notEmpty().withMessage("Title is required"),
  body("startTime").isISO8601().withMessage("Valid start time is required"),
  body("endTime").isISO8601().withMessage("Valid end time is required"),
  body("meetingType")
    .isIn(["online", "in-person"])
    .withMessage("Invalid meeting type"),
  body("meetingLink")
    .if(body("meetingType").equals("online"))
    .notEmpty()
    .withMessage("Meeting link required for online meetings"),
  body("location")
    .if(body("meetingType").equals("in-person"))
    .notEmpty()
    .withMessage("Location required for in-person meetings"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate counselor creation
exports.validateCounselor = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("fullName").notEmpty().withMessage("Full name is required"),
  body("expertise").isArray().withMessage("Expertise must be an array"),
  body("hourlyRate").isNumeric().withMessage("Hourly rate must be a number"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate time validation
exports.validateTimeSlot = (req, res, next) => {
  const { startTime, endTime } = req.body;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (start >= end) {
    return res
      .status(400)
      .json({ message: "End time must be after start time" });
  }

  // Check if booking is not in the past
  if (start < new Date()) {
    return res.status(400).json({ message: "Cannot book in the past" });
  }

  next();
};

// Validate booking status update
exports.validateStatusUpdate = [
  body("status")
    .isIn(["pending", "confirmed", "completed", "cancelled"])
    .withMessage("Invalid status"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validate cancellation request
exports.validateCancellation = [
  body("cancelledBy")
    .isIn(["counselor", "user"])
    .withMessage("Invalid cancellation source"),
  body("cancellationReason")
    .notEmpty()
    .withMessage("Cancellation reason is required"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

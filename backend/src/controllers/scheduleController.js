const Schedule = require("../models/Schedule");
const Counselor = require("../models/Counselor");
const Availability = require("../models/Availability");

// Create booking
exports.createBooking = async (req, res) => {
  try {
    const {
      counselorId,
      userId,
      title,
      description,
      startTime,
      endTime,
      meetingType,
      meetingLink,
      location,
    } = req.body;

    // Validate counselor exists
    const counselor = await Counselor.findById(counselorId);
    if (!counselor) {
      return res.status(404).json({ message: "Counselor not found" });
    }

    // Check availability
    const bookingDate = new Date(startTime);
    const dayOfWeek = bookingDate.getDay();

    const availability = await Availability.findOne({
      counselorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability) {
      return res
        .status(400)
        .json({ message: "Counselor is not available on this day" });
    }

    // Check for conflicts
    const existingBooking = await Schedule.findOne({
      counselorId,
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) },
      status: { $ne: "cancelled" },
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    const booking = new Schedule({
      counselorId,
      userId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      meetingType,
      meetingLink: meetingType === "online" ? meetingLink : "",
      location: meetingType === "in-person" ? location : "",
    });

    const newBooking = await booking.save();

    // Update counselor total bookings
    await Counselor.findByIdAndUpdate(counselorId, {
      $inc: { totalBookings: 1 },
    });

    res.status(201).json(newBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user bookings
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.params.userId;
    const bookings = await Schedule.find({ userId })
      .populate("counselorId", "fullName expertise hourlyRate rating")
      .sort("-createdAt");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counselor bookings
exports.getCounselorBookings = async (req, res) => {
  try {
    const counselorId = req.params.counselorId;
    const bookings = await Schedule.find({ counselorId })
      .populate("userId", "email fullName")
      .sort("-createdAt");
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Schedule.findById(req.params.id).populate(
      "counselorId userId",
    );
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Schedule.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = status;
    booking.updatedAt = new Date();
    const updatedBooking = await booking.save();

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const { cancelledBy, cancellationReason } = req.body;
    const booking = await Schedule.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "cancelled";
    booking.cancelledBy = cancelledBy;
    booking.cancellationReason = cancellationReason;
    booking.updatedAt = new Date();

    const updatedBooking = await booking.save();
    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// List all bookings (admin)
exports.getAllBookings = async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const bookings = await Schedule.find(query)
      .populate("counselorId", "fullName expertise")
      .populate("userId", "email fullName")
      .sort("-createdAt");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

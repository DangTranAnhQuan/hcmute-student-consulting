const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counselor",
    required: true,
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6, // 0 = Sunday, 6 = Saturday
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "HH:mm"
  },
  endTime: {
    type: String,
    required: true, // Format: "HH:mm"
  },
  slotDuration: {
    type: Number,
    default: 60, // minutes
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  blackoutDates: [
    {
      date: Date,
      reason: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Availability", availabilitySchema);

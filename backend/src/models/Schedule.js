const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema({
  counselorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Counselor",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled"],
    default: "pending",
  },
  meetingType: {
    type: String,
    enum: ["online", "in-person"],
    default: "online",
  },
  meetingLink: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  notes: {
    type: String,
    default: "",
  },
  cancelledBy: {
    type: String,
    enum: ["counselor", "user"],
    default: null,
  },
  cancellationReason: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Schedule", scheduleSchema);

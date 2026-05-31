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
  consultationOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ConsultationOrder",
    default: null,
    index: true,
  },
  consultationOrderCode: {
    type: String,
    default: "",
    trim: true,
  },
  consultationOrderItemIndex: {
    type: Number,
    default: null,
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
    enum: ["counselor", "user", "admin", "system"],
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

const activeScheduleFilter = {
  status: { $in: ["pending", "confirmed", "completed"] },
};

scheduleSchema.index(
  { counselorId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: activeScheduleFilter,
  },
);
scheduleSchema.index(
  { userId: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: activeScheduleFilter,
  },
);
scheduleSchema.index({ counselorId: 1, startTime: 1, endTime: 1 });
scheduleSchema.index({ userId: 1, startTime: 1, endTime: 1 });

module.exports = mongoose.model("Schedule", scheduleSchema);

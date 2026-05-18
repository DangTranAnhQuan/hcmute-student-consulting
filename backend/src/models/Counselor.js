const mongoose = require("mongoose");

const counselorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  expertise: [
    {
      type: String,
      enum: [
        "Academic",
        "Career",
        "Mental Health",
        "Personal Development",
        "Financial",
      ],
    },
  ],
  bio: {
    type: String,
    default: "",
  },
  hourlyRate: {
    type: Number,
    default: 0,
  },
  availability: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Availability",
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalBookings: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
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

module.exports = mongoose.model("Counselor", counselorSchema);

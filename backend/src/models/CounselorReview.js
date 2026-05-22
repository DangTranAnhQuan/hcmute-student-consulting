const mongoose = require("mongoose");

const counselorReviewSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    consultationOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsultationOrder",
      required: true,
      index: true,
    },
    consultationOrderCode: {
      type: String,
      default: "",
      trim: true,
    },
    itemIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true },
);

counselorReviewSchema.index(
  { consultationOrderId: 1, itemIndex: 1 },
  { unique: true },
);

module.exports = mongoose.model("CounselorReview", counselorReviewSchema);

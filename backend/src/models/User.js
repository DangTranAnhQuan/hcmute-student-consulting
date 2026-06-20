const mongoose = require("mongoose");
const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    type: { type: String, enum: ["fixed", "percent"], default: "fixed" },
    value: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    minOrderValue: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    isUsed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  fullName: String,
  phone: String,
  address: String,
  faculty: String,
  major: String,
  avatar: String,
  loyaltyPoints: { type: Number, default: 0, min: 0 },
  favoriteCounselors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
    },
  ],
  favoriteArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
  recentlyViewedCounselors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
    },
  ],
  recentlyViewedArticles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
    },
  ],
  coupons: { type: [couponSchema], default: [] },
  otp: String,
  otpExpires: Date,
  isActivated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("User", userSchema);

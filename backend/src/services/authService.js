const User = require("../models/User");
const Counselor = require("../models/Counselor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendOtpMail } = require("./emailService");

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "7d";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const normalizeEmail = (email) =>
  String(email || "")
    .trim()
    .toLowerCase();

const signAccessToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });

const getUserPayload = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  fullName: user.fullName,
  phone: user.phone,
});

const isEmailConfigured = () =>
  process.env.EMAIL_USER &&
  process.env.EMAIL_PASS &&
  process.env.EMAIL_USER !== "your_gmail@gmail.com" &&
  process.env.EMAIL_PASS !== "your_gmail_app_password";

const createEmailConfigError = () => {
  const error = new Error(
    "Chưa cấu hình EMAIL_USER/EMAIL_PASS hợp lệ trong backend/.env.",
  );
  error.statusCode = 503;
  error.errorCode = "EMAIL_NOT_CONFIGURED";
  return error;
};

const assertEmailConfiguredInProduction = () => {
  if (process.env.NODE_ENV === "production" && !isEmailConfigured()) {
    throw createEmailConfigError();
  }
};

exports.login = async (email, password) => {
  const normalized = normalizeEmail(email);

  if (!normalized || !password) {
    const error = new Error("Thiếu thông tin đăng nhập");
    error.statusCode = 400;
    error.errorCode = "LOGIN_MISSING_FIELDS";
    throw error;
  }

  if (!EMAIL_REGEX.test(normalized)) {
    const error = new Error("Email không hợp lệ");
    error.statusCode = 400;
    error.errorCode = "LOGIN_INVALID_EMAIL";
    throw error;
  }

  const user = await User.findOne({ email: normalized });
  if (!user) {
    const error = new Error("Không tìm thấy tài khoản");
    error.statusCode = 404;
    error.errorCode = "LOGIN_EMAIL_NOT_FOUND";
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Mật khẩu không đúng");
    error.statusCode = 401;
    error.errorCode = "LOGIN_WRONG_PASSWORD";
    throw error;
  }

  if (!user.isActivated) {
    const error = new Error("Tài khoản chưa kích hoạt");
    error.statusCode = 403;
    error.errorCode = "LOGIN_ACCOUNT_NOT_ACTIVATED";
    throw error;
  }

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    role: user.role,
    user: getUserPayload(user),
  };
};

exports.register = async ({ username, email, password }) => {
  const normalized = normalizeEmail(email);

  const existingUser = await User.findOne({ email: normalized });
  if (existingUser) {
    const error = new Error("Email đã được sử dụng");
    error.statusCode = 409;
    error.errorCode = existingUser.isActivated
      ? "REGISTER_EMAIL_EXISTS"
      : "REGISTER_EMAIL_PENDING_ACTIVATION";
    throw error;
  }

  assertEmailConfiguredInProduction();

  const hashedPassword = await bcrypt.hash(password, 10);
  const otp = generateOTP();

  const user = new User({
    username: String(username || "").trim(),
    email: normalized,
    password: hashedPassword,
    otp,
    otpExpires: Date.now() + 5 * 60 * 1000,
  });

  await user.save();

  const emailResult = await sendOtpMail({
    to: normalized,
    subject: "Mã xác thực tài khoản Website Tư vấn SV",
    text: `Mã OTP của bạn là: ${otp}. Hiệu lực trong 5 phút.`,
    otp,
  });

  return emailResult;
};

exports.forgotPassword = async (email) => {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    const error = new Error("Thiếu email");
    error.statusCode = 400;
    error.errorCode = "FORGOT_PASSWORD_MISSING_EMAIL";
    throw error;
  }

  if (!EMAIL_REGEX.test(normalized)) {
    const error = new Error("Email không hợp lệ");
    error.statusCode = 400;
    error.errorCode = "FORGOT_PASSWORD_INVALID_EMAIL";
    throw error;
  }

  const user = await User.findOne({ email: normalized });
  if (!user) {
    const error = new Error("Không tìm thấy email");
    error.statusCode = 404;
    error.errorCode = "FORGOT_PASSWORD_EMAIL_NOT_FOUND";
    throw error;
  }

  assertEmailConfiguredInProduction();

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 5 * 60 * 1000;
  await user.save();

  const emailResult = await sendOtpMail({
    to: normalized,
    subject: "Cấp lại mật khẩu Website Tư vấn SV",
    text: `Mã OTP để đổi mật khẩu là: ${otp}. Hiệu lực trong 5 phút.`,
    otp,
  });

  return emailResult;
};

exports.verifyResetOTP = async (email, otp) => {
  const normalized = normalizeEmail(email);

  if (!normalized || !otp) {
    const error = new Error("Thiếu thông tin xác thực OTP");
    error.statusCode = 400;
    error.errorCode = "VERIFY_RESET_OTP_MISSING_FIELDS";
    throw error;
  }

  const user = await User.findOne({ email: normalized });
  if (!user) {
    const error = new Error("Không tìm thấy tài khoản");
    error.statusCode = 404;
    error.errorCode = "VERIFY_RESET_OTP_EMAIL_NOT_FOUND";
    throw error;
  }

  if (user.otp !== otp) {
    const error = new Error("Mã OTP không đúng");
    error.statusCode = 400;
    error.errorCode = "VERIFY_RESET_OTP_INVALID";
    throw error;
  }

  if (!user.otpExpires || user.otpExpires < Date.now()) {
    const error = new Error("Mã OTP đã hết hạn");
    error.statusCode = 400;
    error.errorCode = "VERIFY_RESET_OTP_EXPIRED";
    throw error;
  }

  return { message: "Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới." };
};

exports.resetPassword = async (email, otp, newPassword) => {
  const normalized = normalizeEmail(email);
  if (!normalized || !otp || !newPassword) {
    const error = new Error("Thiếu thông tin đặt lại mật khẩu");
    error.statusCode = 400;
    error.errorCode = "RESET_PASSWORD_MISSING_FIELDS";
    throw error;
  }

  const user = await User.findOne({ email: normalized });
  if (!user) {
    const error = new Error("Không tìm thấy tài khoản");
    error.statusCode = 404;
    error.errorCode = "RESET_PASSWORD_EMAIL_NOT_FOUND";
    throw error;
  }

  if (user.otp !== otp) {
    const error = new Error("Mã OTP không đúng");
    error.statusCode = 400;
    error.errorCode = "RESET_PASSWORD_INVALID_OTP";
    throw error;
  }

  if (!user.otpExpires || user.otpExpires < Date.now()) {
    const error = new Error("Mã OTP đã hết hạn");
    error.statusCode = 400;
    error.errorCode = "RESET_PASSWORD_OTP_EXPIRED";
    throw error;
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return { message: "Đổi mật khẩu thành công!" };
};

exports.verifyOTP = async (email, otp) => {
  const normalized = normalizeEmail(email);
  const user = await User.findOne({ email: normalized });

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    error.errorCode = "VERIFY_OTP_USER_NOT_FOUND";
    throw error;
  }

  if (user.otp !== otp) {
    const error = new Error("Mã OTP không đúng");
    error.statusCode = 400;
    error.errorCode = "VERIFY_OTP_INVALID";
    throw error;
  }

  if (!user.otpExpires || user.otpExpires < Date.now()) {
    const error = new Error("Mã OTP đã hết hạn");
    error.statusCode = 400;
    error.errorCode = "VERIFY_OTP_EXPIRED";
    throw error;
  }

  user.isActivated = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  const accessToken = signAccessToken(user);

  return {
    accessToken,
    role: user.role,
    user: getUserPayload(user),
  };
};

exports.getProfile = async (userId) => {
  const user = await User.findById(userId)
    .select("-password -otp -otpExpires")
    .populate({
      path: "favoriteCounselors",
      select:
        "fullName expertise hourlyRate rating image currentStatus currentStatusLabel",
    })
    .populate({
      path: "recentlyViewedCounselors",
      select:
        "fullName expertise hourlyRate rating image currentStatus currentStatusLabel",
    });

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.updateProfile = async (userId, updateData) => {
  const { username, fullName, phone, address } = updateData;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      username,
      fullName,
      phone,
      address,
      updatedAt: Date.now(),
    },
    { new: true },
  ).select("-password -otp -otpExpires");

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const counselExists = async (counselorId) => {
  if (!counselorId) return false;
  const counselor = await Counselor.findById(counselorId).select("_id");
  return Boolean(counselor);
};

exports.addFavoriteCounselor = async (userId, counselorId) => {
  if (!counselorId) {
    const error = new Error("Dữ liệu yêu cầu không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  if (!(await counselExists(counselorId))) {
    const error = new Error("Không tìm thấy tư vấn viên");
    error.statusCode = 404;
    throw error;
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $addToSet: { favoriteCounselors: counselorId },
      updatedAt: Date.now(),
    },
    { new: true },
  ).select("-password -otp -otpExpires");
  return user;
};

exports.removeFavoriteCounselor = async (userId, counselorId) => {
  if (!counselorId) {
    const error = new Error("Dữ liệu yêu cầu không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $pull: { favoriteCounselors: counselorId },
      updatedAt: Date.now(),
    },
    { new: true },
  ).select("-password -otp -otpExpires");
  return user;
};

exports.markViewedCounselor = async (userId, counselorId) => {
  if (!counselorId) {
    const error = new Error("Dữ liệu yêu cầu không hợp lệ");
    error.statusCode = 400;
    throw error;
  }
  if (!(await counselExists(counselorId))) {
    const error = new Error("Không tìm thấy tư vấn viên");
    error.statusCode = 404;
    throw error;
  }
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }
  user.recentlyViewedCounselors = [
    counselorId,
    ...new Set(
      user.recentlyViewedCounselors.filter(
        (id) => id.toString() !== counselorId,
      ),
    ),
  ].slice(0, 10);
  user.updatedAt = Date.now();
  await user.save();
  return user;
};

exports.getFavorites = async (userId) => {
  const user = await User.findById(userId)
    .select("favoriteCounselors")
    .populate({
      path: "favoriteCounselors",
      select:
        "fullName expertise hourlyRate rating image currentStatus currentStatusLabel",
    });
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user.favoriteCounselors || [];
};

exports.getCoupons = async (userId) => {
  const user = await User.findById(userId).select("coupons");
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  const now = new Date();
  const coupons = user.coupons || [];
  return {
    active: coupons.filter(
      (c) => !c.isUsed && (!c.expiresAt || new Date(c.expiresAt) > now),
    ),
    used: coupons.filter((c) => c.isUsed),
    expired: coupons.filter(
      (c) => !c.isUsed && c.expiresAt && new Date(c.expiresAt) <= now,
    ),
  };
};

exports.redeemPoints = async (userId, pointsToConvert) => {
  const points = Math.floor(Math.max(0, Number(pointsToConvert || 0)));
  const MIN_POINTS = 100;

  if (points < MIN_POINTS) {
    const error = new Error(`Cần ít nhất ${MIN_POINTS} điểm để đổi mã giảm giá`);
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  if (user.loyaltyPoints < points) {
    const error = new Error("Không đủ điểm tích lũy");
    error.statusCode = 400;
    throw error;
  }

  const code = `DIEM${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const coupon = {
    code,
    type: "fixed",
    value: points,
    description: `Đổi ${points} điểm lấy mã giảm ${points.toLocaleString("vi-VN")}đ`,
    minOrderValue: 0,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isUsed: false,
  };

  user.loyaltyPoints -= points;
  user.coupons.push(coupon);
  user.updatedAt = Date.now();
  await user.save();

  return {
    message: `Đổi thành công! Mã giảm giá ${code} đã được thêm vào ví.`,
    coupon,
    remainingPoints: user.loyaltyPoints,
  };
};

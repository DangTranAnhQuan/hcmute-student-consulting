const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || "7d";
const ACCESS_TOKEN_MAX_AGE =
  Number(process.env.ACCESS_TOKEN_MAX_AGE_MS) || 7 * 24 * 60 * 60 * 1000;
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

const setAccessTokenCookie = (res, accessToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
    maxAge: ACCESS_TOKEN_MAX_AGE,
  });
};

const isProduction = process.env.NODE_ENV === "production";

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
  if (isProduction && !isEmailConfigured()) {
    throw createEmailConfigError();
  }
};

const sendOtpMail = async ({ to, subject, text, otp }) => {
  if (!isEmailConfigured()) {
    if (isProduction) {
      throw createEmailConfigError();
    }

    console.warn(
      `[auth:otp] EMAIL_USER/EMAIL_PASS is not configured. Dev OTP for ${to}: ${otp}`,
    );
    return {
      sent: false,
      devOtp: otp,
      message:
        "Chưa cấu hình email nên hệ thống không gửi OTP qua Gmail. Dùng mã OTP thử nghiệm hiển thị bên dưới để tiếp tục.",
    };
  }

  try {
    await transporter.sendMail({ to, subject, text });
    return { sent: true };
  } catch (error) {
    error.statusCode = 502;
    error.errorCode = "EMAIL_SEND_FAILED";
    error.details =
      "Không gửi được email OTP. Vui lòng kiểm tra Gmail App Password, EMAIL_USER/EMAIL_PASS hoặc kết nối mạng.";
    throw error;
  }
};

const sendServerError = (res, action, err, extra = {}) => {
  console.error(`[auth:${action}] server error`, {
    message: err.message,
    stack: err.stack,
    ...extra,
  });

  return res.status(err.statusCode || 500).json({
    message: err.statusCode
      ? "Không thể hoàn tất yêu cầu"
      : "Lỗi server khi xử lý yêu cầu",
    details:
      err.details ||
      err.message ||
      "Vui lòng kiểm tra lại dữ liệu hoặc thử lại sau.",
    errorCode: err.errorCode || "AUTH_SERVER_ERROR",
  });
};

const getUserPayload = (user) => ({
  id: user._id,
  username: user.username,
  email: user.email,
  role: user.role,
  fullName: user.fullName,
  phone: user.phone,
});

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) {
      return res.status(400).json({
        message: "Thiếu thông tin đăng nhập",
        details: "Vui lòng nhập đầy đủ email và mật khẩu.",
        errorCode: "LOGIN_MISSING_FIELDS",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Email không hợp lệ",
        details:
          "Email đăng nhập phải đúng định dạng, ví dụ: student@hcmute.edu.vn.",
        errorCode: "LOGIN_INVALID_EMAIL",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản",
        details: `Không có tài khoản nào đăng ký với email ${email}. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.`,
        errorCode: "LOGIN_EMAIL_NOT_FOUND",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Mật khẩu không đúng",
        details: "Mật khẩu bạn nhập không khớp với tài khoản này.",
        errorCode: "LOGIN_WRONG_PASSWORD",
      });
    }

    if (!user.isActivated) {
      return res.status(403).json({
        message: "Tài khoản chưa kích hoạt",
        details:
          "Tài khoản đã đăng ký nhưng chưa xác thực OTP. Vui lòng kiểm tra email nhận OTP trước khi đăng nhập.",
        errorCode: "LOGIN_ACCOUNT_NOT_ACTIVATED",
      });
    }

    const accessToken = signAccessToken(user);
    setAccessTokenCookie(res, accessToken);

    res.json({
      message: "Đăng nhập thành công!",
      role: user.role,
      accessToken,
      user: getUserPayload(user),
    });
  } catch (err) {
    return sendServerError(res, "login", err);
  }
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Đăng ký không thành công",
      details: "Một số thông tin đăng ký chưa hợp lệ.",
      errorCode: "REGISTER_VALIDATION_ERROR",
      errors: errors.array().map((error) => ({
        field: error.path,
        message: error.msg,
      })),
    });
  }

  try {
    const username = String(req.body?.username || "").trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "Email đã được sử dụng",
        details: existingUser.isActivated
          ? "Email này đã thuộc về một tài khoản đã kích hoạt. Vui lòng đăng nhập hoặc dùng chức năng quên mật khẩu."
          : "Email này đã đăng ký nhưng chưa kích hoạt OTP. Vui lòng kiểm tra email nhận OTP hoặc liên hệ quản trị viên để cấp lại mã.",
        errorCode: existingUser.isActivated
          ? "REGISTER_EMAIL_EXISTS"
          : "REGISTER_EMAIL_PENDING_ACTIVATION",
      });
    }

    assertEmailConfiguredInProduction();

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    const user = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    });

    await user.save();
    const emailResult = await sendOtpMail({
      to: email,
      subject: "Mã xác thực tài khoản Website Tư vấn SV",
      text: `Mã OTP của bạn là: ${otp}. Hiệu lực trong 5 phút.`,
      otp,
    });

    res.status(201).json({
      message: emailResult.sent
        ? "Đã gửi mã OTP qua email, vui lòng kiểm tra!"
        : emailResult.message,
      devOtp: emailResult.devOtp,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Email đã được sử dụng",
        details:
          "Email này đã tồn tại trong hệ thống. Vui lòng dùng email khác.",
        errorCode: "REGISTER_DUPLICATE_EMAIL",
      });
    }

    return sendServerError(res, "register", err, {
      email: req.body?.email,
      username: req.body?.username,
    });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);

    if (!email) {
      return res.status(400).json({
        message: "Thiếu email",
        details: "Vui lòng nhập email đã dùng để đăng ký tài khoản.",
        errorCode: "FORGOT_PASSWORD_MISSING_EMAIL",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({
        message: "Email không hợp lệ",
        details:
          "Email quên mật khẩu phải đúng định dạng, ví dụ: student@hcmute.edu.vn.",
        errorCode: "FORGOT_PASSWORD_INVALID_EMAIL",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy email",
        details: `Không có tài khoản nào đăng ký với email ${email}. Vui lòng kiểm tra lại email hoặc tạo tài khoản mới.`,
        errorCode: "FORGOT_PASSWORD_EMAIL_NOT_FOUND",
      });
    }

    assertEmailConfiguredInProduction();

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000;
    await user.save();

    const emailResult = await sendOtpMail({
      to: email,
      subject: "Cấp lại mật khẩu Website Tư vấn SV",
      text: `Mã OTP để đổi mật khẩu là: ${otp}. Hiệu lực trong 5 phút.`,
      otp,
    });

    res.json({
      message: emailResult.sent
        ? "Đã gửi OTP đổi mật khẩu!"
        : emailResult.message,
      devOtp: emailResult.devOtp,
    });
  } catch (err) {
    return sendServerError(res, "forgotPassword", err, {
      email: req.body?.email,
    });
  }
};

exports.verifyResetOTP = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const otp = req.body?.otp;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Thiếu thông tin xác thực OTP",
        details: "Vui lòng nhập đầy đủ email và mã OTP.",
        errorCode: "VERIFY_RESET_OTP_MISSING_FIELDS",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản",
        details: `Không có tài khoản nào đăng ký với email ${email}.`,
        errorCode: "VERIFY_RESET_OTP_EMAIL_NOT_FOUND",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Mã OTP không đúng",
        details: "Mã OTP bạn nhập không khớp với mã mới nhất đã gửi qua email.",
        errorCode: "VERIFY_RESET_OTP_INVALID",
      });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn",
        details:
          "Mã OTP chỉ có hiệu lực trong 5 phút. Vui lòng gửi lại yêu cầu quên mật khẩu.",
        errorCode: "VERIFY_RESET_OTP_EXPIRED",
      });
    }

    return res.json({
      message: "Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.",
    });
  } catch (err) {
    return sendServerError(res, "verifyResetOTP", err, {
      email: req.body?.email,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const email = normalizeEmail(req.body?.email);
    const user = await User.findOne({ email });

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Thiếu thông tin đặt lại mật khẩu",
        details: "Vui lòng nhập email, mã OTP và mật khẩu mới.",
        errorCode: "RESET_PASSWORD_MISSING_FIELDS",
      });
    }

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy tài khoản",
        details: `Không có tài khoản nào đăng ký với email ${email}.`,
        errorCode: "RESET_PASSWORD_EMAIL_NOT_FOUND",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Mã OTP không đúng",
        details: "Mã OTP bạn nhập không khớp với mã mới nhất đã gửi qua email.",
        errorCode: "RESET_PASSWORD_INVALID_OTP",
      });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn",
        details:
          "Mã OTP chỉ có hiệu lực trong 5 phút. Vui lòng gửi lại yêu cầu quên mật khẩu.",
        errorCode: "RESET_PASSWORD_OTP_EXPIRED",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    return sendServerError(res, "resetPassword", err, {
      email: req.body?.email,
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const email = normalizeEmail(req.body?.email);
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Không tìm thấy người dùng",
        details: `Không có tài khoản nào đăng ký với email ${email}.`,
        errorCode: "VERIFY_OTP_USER_NOT_FOUND",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        message: "Mã OTP không đúng",
        details: "Mã OTP bạn nhập không khớp với mã mới nhất đã gửi qua email.",
        errorCode: "VERIFY_OTP_INVALID",
      });
    }

    if (!user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
        message: "Mã OTP đã hết hạn",
        details:
          "Mã OTP chỉ có hiệu lực trong 5 phút. Vui lòng đăng ký lại hoặc yêu cầu cấp lại mã.",
        errorCode: "VERIFY_OTP_EXPIRED",
      });
    }

    user.isActivated = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    const accessToken = signAccessToken(user);
    setAccessTokenCookie(res, accessToken);

    res.json({
      message: "Xác thực OTP thành công!",
      role: user.role,
      accessToken,
      user: getUserPayload(user),
    });
  } catch (err) {
    return sendServerError(res, "verifyOTP", err, {
      email: req.body?.email,
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }

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
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (err) {
    return sendServerError(res, "getProfile", err, {
      userId: req.user?.id,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không được xác thực" });
    }

    const { username, fullName, phone, address } = req.body;

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
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (err) {
    return sendServerError(res, "updateProfile", err, {
      userId: req.user?.id,
    });
  }
};

const counselExists = async (counselorId) => {
  if (!counselorId) return false;
  const counselor = await require("../models/Counselor")
    .findById(counselorId)
    .select("_id");
  return Boolean(counselor);
};

exports.addFavoriteCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    if (!userId || !counselorId) {
      return res.status(400).json({ message: "Dữ liệu yêu cầu không hợp lệ" });
    }
    if (!(await counselExists(counselorId))) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $addToSet: { favoriteCounselors: counselorId },
        updatedAt: Date.now(),
      },
      { new: true },
    ).select("-password -otp -otpExpires");
    res.json(user);
  } catch (err) {
    return sendServerError(res, "addFavoriteCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.removeFavoriteCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    if (!userId || !counselorId) {
      return res.status(400).json({ message: "Dữ liệu yêu cầu không hợp lệ" });
    }
    const user = await User.findByIdAndUpdate(
      userId,
      {
        $pull: { favoriteCounselors: counselorId },
        updatedAt: Date.now(),
      },
      { new: true },
    ).select("-password -otp -otpExpires");
    res.json(user);
  } catch (err) {
    return sendServerError(res, "removeFavoriteCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.markViewedCounselor = async (req, res) => {
  try {
    const userId = req.user?.id;
    const counselorId = req.params.id;
    if (!userId || !counselorId) {
      return res.status(400).json({ message: "Dữ liệu yêu cầu không hợp lệ" });
    }
    if (!(await counselExists(counselorId))) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
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
    res.json(user);
  } catch (err) {
    return sendServerError(res, "markViewedCounselor", err, {
      userId: req.user?.id,
      counselorId: req.params.id,
    });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });

    const user = await User.findById(userId)
      .select("favoriteCounselors")
      .populate({
        path: "favoriteCounselors",
        select:
          "fullName expertise hourlyRate rating image currentStatus currentStatusLabel",
      });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json(user.favoriteCounselors || []);
  } catch (err) {
    return sendServerError(res, "getFavorites", err, { userId: req.user?.id });
  }
};

exports.getCoupons = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });

    const user = await User.findById(userId).select("coupons");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const now = new Date();
    const coupons = user.coupons || [];
    res.json({
      active: coupons.filter(
        (c) => !c.isUsed && (!c.expiresAt || new Date(c.expiresAt) > now),
      ),
      used: coupons.filter((c) => c.isUsed),
      expired: coupons.filter(
        (c) => !c.isUsed && c.expiresAt && new Date(c.expiresAt) <= now,
      ),
    });
  } catch (err) {
    return sendServerError(res, "getCoupons", err, { userId: req.user?.id });
  }
};

exports.redeemPoints = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Không được xác thực" });

    const pointsToConvert = Math.floor(
      Math.max(0, Number(req.body?.pointsToConvert || 0)),
    );
    const MIN_POINTS = 100;

    if (pointsToConvert < MIN_POINTS) {
      return res.status(400).json({
        message: `Cần ít nhất ${MIN_POINTS} điểm để đổi mã giảm giá`,
      });
    }

    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (user.loyaltyPoints < pointsToConvert) {
      return res.status(400).json({ message: "Không đủ điểm tích lũy" });
    }

    const code = `DIEM${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const coupon = {
      code,
      type: "fixed",
      value: pointsToConvert,
      description: `Đổi ${pointsToConvert} điểm lấy mã giảm ${pointsToConvert.toLocaleString("vi-VN")}đ`,
      minOrderValue: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isUsed: false,
    };

    user.loyaltyPoints -= pointsToConvert;
    user.coupons.push(coupon);
    user.updatedAt = Date.now();
    await user.save();

    res.json({
      message: `Đổi thành công! Mã giảm giá ${code} đã được thêm vào ví.`,
      coupon,
      remainingPoints: user.loyaltyPoints,
    });
  } catch (err) {
    return sendServerError(res, "redeemPoints", err, { userId: req.user?.id });
  }
};

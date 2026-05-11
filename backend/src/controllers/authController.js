const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// --- CHỨC NĂNG ĐĂNG KÝ ---
exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    user = new User({
      username,
      email,
      password: hashedPassword,
      otp,
      otpExpires: Date.now() + 5 * 60 * 1000,
    });

    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "Mã xác thực tài khoản Website Tư vấn SV",
      text: `Mã OTP của bạn là: ${otp}. Hiệu lực trong 5 phút.`,
    });

    res
      .status(201)
      .json({ message: "Đã gửi mã OTP qua email, vui lòng kiểm tra!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

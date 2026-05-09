const User = require("../models/User");
const bcrypt = require("bcryptjs");
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

// --- QUÊN MẬT KHẨU ---
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  const user = await User.findOneAndUpdate(
    { email },
    { otp, otpExpires: Date.now() + 5 * 60 * 1000 },
  );
  if (!user) return res.status(404).json({ message: "Không tìm thấy email" });

  await transporter.sendMail({
    to: email,
    subject: "Cấp lại mật khẩu Website Tư vấn SV",
    text: `Mã OTP để đổi mật khẩu là: ${otp}`,
  });
  res.json({ message: "Đã gửi OTP đổi mật khẩu!" });
};

// --- XÁC NHẬN OTP VÀ ĐỔI MẬT KHẨU MỚI ---
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res
        .status(400)
        .json({ message: "Mã OTP không đúng hoặc đã hết hạn" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
};

const User = require("../models/User");

/**
 * Lấy danh sách người dùng kèm phân trang và tìm kiếm
 */
exports.listUsers = async ({ q, page = 1, limit = 10 }) => {
  const filter = {};
  if (q) {
    const regex = new RegExp(q, "i");
    filter.$or = [
      { username: regex },
      { email: regex },
      { fullName: regex },
    ];
  }

  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password -otp -otpExpires")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Cập nhật quyền (Role) cho người dùng
 */
exports.updateRole = async (userId, newRole) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole, updatedAt: Date.now() },
    { new: true },
  ).select("-password");

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

/**
 * Khóa hoặc mở khóa tài khoản
 */
exports.toggleBan = async (userId, isBanned) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isBanned, updatedAt: Date.now() },
    { new: true },
  ).select("-password");

  if (!user) {
    const error = new Error("Không tìm thấy người dùng");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

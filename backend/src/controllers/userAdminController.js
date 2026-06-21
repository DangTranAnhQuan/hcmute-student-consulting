const userService = require("../services/userService");
const { validationResult } = require("express-validator");

/**
 * Lấy danh sách người dùng
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { q, page, limit } = req.query;
    const result = await userService.listUsers({ q, page, limit });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy danh sách người dùng", error: error.message });
  }
};

/**
 * Cập nhật Role
 */
exports.updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { newRole } = req.body;
    const user = await userService.updateRole(id, newRole);
    res.json({ message: "Cập nhật quyền thành công", user });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * Khóa/Mở khóa tài khoản
 */
exports.toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body;
    const user = await userService.toggleBan(id, isBanned);
    res.json({
      message: isBanned ? "Đã khóa tài khoản thành công" : "Đã mở khóa tài khoản thành công",
      user
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

const router = require("express").Router();
const userAdminCtrl = require("../controllers/userAdminController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { adminLimiter } = require("../middleware/rateLimit");
const { updateRoleValidator } = require("../middleware/adminValidator");

// Tất cả các route trong này đều yêu cầu Admin và giới hạn Rate Limit
router.use(verifyToken, verifyAdmin, adminLimiter);

/**
 * @route GET /api/admin/users
 * @desc Lấy danh sách người dùng
 */
router.get("/", userAdminCtrl.getAllUsers);

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Cập nhật quyền (Role) cho User
 */
router.patch("/:id/role", updateRoleValidator, userAdminCtrl.updateUserRole);

/**
 * @route PATCH /api/admin/users/:id/ban
 * @desc Khóa/Mở khóa tài khoản
 */
router.patch("/:id/ban", userAdminCtrl.toggleUserBan);

module.exports = router;

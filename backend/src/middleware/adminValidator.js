const { body } = require("express-validator");

/**
 * Validator cho việc cập nhật Role của User
 */
exports.updateRoleValidator = [
  body("newRole")
    .isIn(["user", "counselor", "admin"])
    .withMessage("Role mới không hợp lệ. Chỉ chấp nhận: user, counselor, admin."),
];

/**
 * Validator cho cài đặt hệ thống
 */
exports.systemSettingValidator = [
  body("siteTitle")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Tiêu đề trang web không được để trống"),

  body("contactEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email liên hệ không đúng định dạng"),

  body("contactPhone")
    .optional()
    .trim(),

  body("contactAddress")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Địa chỉ liên hệ không được để trống"),

  body("maintenanceMode")
    .optional()
    .isBoolean()
    .withMessage("Chế độ bảo trì phải là giá trị Boolean"),
];

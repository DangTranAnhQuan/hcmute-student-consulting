const router = require("express").Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const systemCtrl = require("../controllers/systemController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");
const { adminLimiter } = require("../middleware/rateLimit");
const { systemSettingValidator } = require("../middleware/adminValidator");

// Cấu hình Multer để lưu ảnh Banner local
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/uploads/banners");
    // Tạo thư mục nếu chưa tồn tại
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "banner-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file ảnh!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn 5MB
});

// Route lấy cấu hình - Có thể cho phép User xem (nếu cần public)
// Nhưng theo yêu cầu REVISED_ADMIN_PLAN, chúng ta để trong luồng Admin
router.get("/", verifyToken, verifyAdmin, systemCtrl.getSettings);

/**
 * @route PUT /api/admin/system-settings
 * @desc Cập nhật cấu hình hệ thống và upload banner
 */
router.put(
  "/",
  verifyToken,
  verifyAdmin,
  adminLimiter,
  upload.array("banners", 5), // Chấp nhận tối đa 5 ảnh
  systemSettingValidator,
  systemCtrl.updateSettings
);

module.exports = router;

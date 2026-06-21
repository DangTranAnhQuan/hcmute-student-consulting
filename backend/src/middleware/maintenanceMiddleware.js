const SystemSetting = require("../models/SystemSetting");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const maintenanceMiddleware = async (req, res, next) => {
  try {
    // 1. Luôn cho phép truy cập các route Auth cơ bản để có thể đăng nhập/lấy profile Admin
    if (req.path.startsWith("/auth/login") || req.path.startsWith("/auth/profile") || req.path.startsWith("/auth/verify-otp")) {
      return next();
    }

    // 2. Lấy cài đặt hệ thống
    const settings = await SystemSetting.findOne();

    // 3. Nếu không ở chế độ bảo trì, cho phép đi tiếp
    if (!settings || !settings.maintenanceMode) {
      return next();
    }

    // 4. Nếu đang bảo trì, kiểm tra xem người dùng có phải Admin không
    // Chúng ta cần tự giải mã token ở đây vì middleware này chạy trước authMiddleware chung
    const token = req.cookies?.accessToken || req.headers.authorization?.split(" ")[1];
    let isAdmin = false;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decoded.id);
        if (user && user.role === "admin") {
          isAdmin = true;
          req.user = user; // Gắn user vào req để các middleware sau sử dụng luôn
        }
      } catch (err) {
        // Token không hợp lệ hoặc hết hạn -> không phải admin
      }
    }

    if (isAdmin) {
      return next();
    }

    // 5. Đối với người dùng không phải admin, kiểm tra các ngoại lệ
    // Cho phép lấy thông tin hệ thống để Frontend biết đang bảo trì
    if (req.path === "/admin/system-settings" && req.method === "GET") {
      return next();
    }

    // Còn lại chặn hết
    return res.status(503).json({
      message: "Hệ thống đang bảo trì. Vui lòng quay lại sau.",
      errorCode: "MAINTENANCE_MODE"
    });
  } catch (error) {
    console.error("Maintenance Middleware Error:", error);
    next();
  }
};

module.exports = maintenanceMiddleware;

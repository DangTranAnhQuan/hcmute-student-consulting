const mongoose = require("mongoose");

const systemSettingSchema = new mongoose.Schema(
  {
    siteTitle: {
      type: String,
      default: "HCMUTE Student Consulting",
      trim: true,
    },
    banners: {
      type: [String], // Mảng chứa URL của các ảnh banner
      default: [],
    },
    contactInfo: {
      email: {
        type: String,
        default: "support@hcmute.edu.vn",
        trim: true,
      },
      phone: {
        type: String,
        default: "028 1234 5678",
        trim: true,
      },
      address: {
        type: String,
        default: "01 Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP. HCM",
        trim: true,
      },
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Đảm bảo chỉ có một document duy nhất cho cài đặt hệ thống
module.exports = mongoose.model("SystemSetting", systemSettingSchema);

const systemService = require("../services/systemService");
const { validationResult } = require("express-validator");

/**
 * Lấy cài đặt hệ thống
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await systemService.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy cấu hình hệ thống", error: error.message });
  }
};

/**
 * Cập nhật cài đặt hệ thống
 */
exports.updateSettings = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { siteTitle, contactEmail, contactPhone, contactAddress, maintenanceMode, replaceBanners } = req.body;

    const updateData = {};
    if (siteTitle !== undefined) updateData.siteTitle = siteTitle;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode === "true" || maintenanceMode === true;

    // Gom nhóm thông tin liên hệ
    if (contactEmail || contactPhone || contactAddress) {
      updateData.contactInfo = {};
      if (contactEmail) updateData.contactInfo.email = contactEmail;
      if (contactPhone) updateData.contactInfo.phone = contactPhone;
      if (contactAddress) updateData.contactInfo.address = contactAddress;
    }

    // Nếu có file upload từ multer (banners)
    if (req.files && req.files.length > 0) {
      const newBannerUrls = req.files.map(file => `/uploads/banners/${file.filename}`);

      if (replaceBanners === "true") {
        updateData.banners = newBannerUrls;
      } else {
        const currentSettings = await systemService.getSettings();
        updateData.banners = [...currentSettings.banners, ...newBannerUrls];
      }
    }

    const settings = await systemService.updateSettings(updateData);
    res.json({ message: "Cập nhật cấu hình thành công", settings });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi cập nhật cấu hình", error: error.message });
  }
};

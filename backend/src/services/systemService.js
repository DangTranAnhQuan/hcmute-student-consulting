const SystemSetting = require("../models/SystemSetting");

/**
 * Lấy cấu hình hệ thống duy nhất. Nếu chưa có thì tạo mới document mặc định.
 */
exports.getSettings = async () => {
  let settings = await SystemSetting.findOne();
  if (!settings) {
    settings = await SystemSetting.create({});
  }
  return settings;
};

/**
 * Cập nhật cấu hình hệ thống
 */
exports.updateSettings = async (updateData) => {
  let settings = await SystemSetting.findOne();

  if (!settings) {
    settings = new SystemSetting(updateData);
  } else {
    // Chỉ cập nhật các trường được gửi lên
    if (updateData.siteTitle !== undefined) settings.siteTitle = updateData.siteTitle;
    if (updateData.maintenanceMode !== undefined) settings.maintenanceMode = updateData.maintenanceMode;

    // Cập nhật contactInfo
    if (updateData.contactInfo) {
      settings.contactInfo = {
        ...settings.contactInfo,
        ...updateData.contactInfo
      };
    }

    // Cập nhật banners nếu có (thường qua controller xử lý file)
    if (updateData.banners) {
      settings.banners = updateData.banners;
    }
  }

  await settings.save();
  return settings;
};

/**
 * Thêm banner mới vào danh sách
 */
exports.addBanners = async (newBannerUrls) => {
  const settings = await this.getSettings();
  settings.banners = [...settings.banners, ...newBannerUrls];
  await settings.save();
  return settings;
};

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSystemSettings,
  updateSystemSettings,
  clearSettingsError,
} from "../../redux/systemSettingsSlice";
import { clearAdminError } from "../../redux/adminSlice";
import { Spinner } from "../UI";
import { useCustomToast } from "../../context/CustomToastContext";

const SystemSettingsForm = () => {
  const dispatch = useDispatch();
  const { showToast } = useCustomToast();
  const {
    settings,
    isLoading,
    isUpdating,
    error: settingsError,
  } = useSelector((state) => state.systemSettings);

  const [formData, setFormData] = useState({
    siteTitle: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    maintenanceMode: false,
  });
  const [banners, setBanners] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    dispatch(clearAdminError());
    dispatch(fetchSystemSettings());
  }, [dispatch]);

  // Theo dõi lỗi settings để hiện Toast Rate Limit
  useEffect(() => {
    if (
      settingsError &&
      (settingsError.includes("quá nhiều thao tác") ||
        settingsError.includes("15 phút"))
    ) {
      showToast(settingsError, "error");
      dispatch(clearSettingsError());
    }
  }, [settingsError, dispatch, showToast]);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteTitle: settings.siteTitle || "",
        contactEmail: settings.contactInfo?.email || "",
        contactPhone: settings.contactInfo?.phone || "",
        contactAddress: settings.contactInfo?.address || "",
        maintenanceMode: settings.maintenanceMode || false,
      });
      setPreviews(settings.banners || []);
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Xóa lỗi của field khi người dùng sửa
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setBanners(files);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFieldErrors({});

    const data = new FormData();
    data.append("siteTitle", formData.siteTitle);
    data.append("contactEmail", formData.contactEmail);
    data.append("contactPhone", formData.contactPhone);
    data.append("contactAddress", formData.contactAddress);
    data.append("maintenanceMode", formData.maintenanceMode);

    banners.forEach((file) => {
      data.append("banners", file);
    });

    dispatch(updateSystemSettings(data)).then((action) => {
      if (updateSystemSettings.fulfilled.match(action)) {
        showToast("Cập nhật hệ thống thành công!", "success");
        setBanners([]);
      } else {
        const errorPayload = action.payload;

        if (
          errorPayload?.status === 429 ||
          errorPayload?.errorCode === "ADMIN_RATE_LIMIT"
        ) {
          showToast(
            errorPayload?.message ||
              "Bạn đã thực hiện quá nhiều thao tác. Vui lòng thử lại sau 15 phút.",
            "error",
          );
        } else if (errorPayload?.errors) {
          // Xử lý validation errors từ express-validator
          const errors = {};
          errorPayload.errors.forEach((err) => {
            errors[err.path] = err.msg;
          });
          setFieldErrors(errors);
          showToast("Dữ liệu nhập vào không hợp lệ", "error");
        } else {
          showToast(
            errorPayload?.message || "Lỗi khi cập nhật hệ thống",
            "error",
          );
        }
      }
    });
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-xl shadow-md space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tiêu đề Website
          </label>
          <input
            name="siteTitle"
            value={formData.siteTitle}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.siteTitle ? "border-red-500" : "border-gray-300"}`}
          />
          {fieldErrors.siteTitle && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.siteTitle}</p>
          )}
        </div>

        <div className="flex items-center space-x-3 pt-6">
          <input
            type="checkbox"
            name="maintenanceMode"
            checked={formData.maintenanceMode}
            onChange={handleChange}
            id="maintenance"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="maintenance"
            className="text-sm font-medium text-gray-700"
          >
            Chế độ bảo trì
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email liên hệ
          </label>
          <input
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.contactEmail ? "border-red-500" : "border-gray-300"}`}
          />
          {fieldErrors.contactEmail && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.contactEmail}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Số điện thoại
          </label>
          <input
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.contactPhone ? "border-red-500" : "border-gray-300"}`}
          />
          {fieldErrors.contactPhone && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.contactPhone}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Địa chỉ
          </label>
          <input
            name="contactAddress"
            value={formData.contactAddress}
            onChange={handleChange}
            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.contactAddress ? "border-red-500" : "border-gray-300"}`}
          />
          {fieldErrors.contactAddress && (
            <p className="mt-1 text-xs text-red-500">
              {fieldErrors.contactAddress}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Banners
        </label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        <div className="mt-4 flex flex-wrap gap-4">
          {previews.map((src, index) => (
            <img
              key={index}
              src={
                src.startsWith("http") || src.startsWith("blob")
                  ? src
                  : `http://localhost:3001${src}`
              }
              alt="Banner Preview"
              className="h-24 w-40 object-cover rounded-lg border"
            />
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isUpdating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isUpdating ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
};

export default SystemSettingsForm;

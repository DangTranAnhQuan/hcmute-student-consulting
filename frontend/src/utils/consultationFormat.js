export const ORDER_STATUS_LABELS = {
  NEW: "Yêu cầu mới",
  CONFIRMED: "Đã xác nhận",
  PREPARING: "Đang chuẩn bị hồ sơ",
  PROCESSING: "Đang tư vấn/đang xử lý",
  COMPLETED: "Đã hoàn tất",
  CANCELLED: "Đã hủy",
  CANCEL_REQUESTED: "Gửi yêu cầu hủy",
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: "Chưa thanh toán",
  PENDING: "Chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  EXPIRED: "Hết hạn thanh toán",
  CANCELLED: "Đã hủy thanh toán",
  REFUND_REQUIRED: "Cần xử lý hoàn tiền",
  REFUNDED: "Đã hoàn tiền",
};

export const statusClass = (status) => {
  const styles = {
    NEW: "bg-blue-50 text-blue-700 border-blue-200",
    CONFIRMED: "bg-indigo-50 text-indigo-700 border-indigo-200",
    PREPARING: "bg-amber-50 text-amber-700 border-amber-200",
    PROCESSING: "bg-purple-50 text-purple-700 border-purple-200",
    COMPLETED: "bg-green-50 text-green-700 border-green-200",
    CANCELLED: "bg-red-50 text-red-700 border-red-200",
    CANCEL_REQUESTED: "bg-orange-50 text-orange-700 border-orange-200",
  };
  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

export const paymentClass = (status) => {
  const styles = {
    UNPAID: "bg-slate-50 text-slate-700 border-slate-200",
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    PAID: "bg-green-50 text-green-700 border-green-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    EXPIRED: "bg-gray-50 text-gray-700 border-gray-200",
    CANCELLED: "bg-gray-50 text-gray-700 border-gray-200",
    REFUND_REQUIRED: "bg-orange-50 text-orange-700 border-orange-200",
    REFUNDED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDuration = (minutes = 60) => {
  const value = Number(minutes || 60);
  if (value < 60) return `${value} phút`;

  const hours = Math.floor(value / 60);
  const remainingMinutes = value % 60;
  if (remainingMinutes === 0) return `${hours} giờ`;
  return `${hours} giờ ${remainingMinutes} phút`;
};

export const formatDateTime = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
};

export const toDateTimeLocalValue = (date) => {
  const value = date instanceof Date ? date : new Date(date);
  const offsetMs = value.getTimezoneOffset() * 60 * 1000;
  return new Date(value.getTime() - offsetMs).toISOString().slice(0, 16);
};

export const defaultPreferredDate = () => {
  const value = new Date();
  value.setDate(value.getDate() + 1);
  value.setHours(9, 0, 0, 0);
  return toDateTimeLocalValue(value);
};

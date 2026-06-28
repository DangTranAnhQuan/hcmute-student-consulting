import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/UI";
import { consultationOrderAPI } from "../services/api";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatCurrency,
  formatDateTime,
  paymentClass,
  statusClass,
} from "../utils/consultationFormat";

const STATUS_OPTIONS = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
  "CANCEL_REQUESTED",
];
const PAYMENT_OPTIONS = [
  "UNPAID",
  "PENDING",
  "PAID",
  "FAILED",
  "EXPIRED",
  "CANCELLED",
  "REFUND_REQUIRED",
  "REFUNDED",
];
const PAYMENT_METHOD_OPTIONS = [
  ["COD", "COD"],
  ["MOMO_SANDBOX", "MoMo Sandbox"],
];
const SORT_OPTIONS = [
  ["latest", "Mới nhất"],
  ["oldest", "Cũ nhất"],
  ["totalDesc", "Tiền cao đến thấp"],
  ["totalAsc", "Tiền thấp đến cao"],
  ["status", "Theo trạng thái đơn"],
  ["payment", "Theo trạng thái tiền"],
];
const DEFAULT_FILTERS = {
  status: "",
  paymentStatus: "",
  paymentMethod: "",
  search: "",
  dateFrom: "",
  dateTo: "",
  minTotal: "",
  maxTotal: "",
  sortBy: "latest",
};

const nextActions = (order) => {
  const actions = {
    NEW: [
      { status: "CONFIRMED", label: "Xác nhận" },
      { status: "CANCELLED", label: "Hủy" },
    ],
    CONFIRMED: [
      { status: "PREPARING", label: "Chuẩn bị hồ sơ" },
      { status: "CANCELLED", label: "Hủy" },
    ],
    PREPARING: [
      { status: "PROCESSING", label: "Chuyển xử lý/giao" },
      { status: "CANCELLED", label: "Hủy thủ công" },
    ],
    CANCEL_REQUESTED: [
      { status: "CANCELLED", label: "Duyệt hủy" },
      { status: "PREPARING", label: "Từ chối hủy" },
    ],
    PROCESSING: [{ status: "COMPLETED", label: "Hoàn tất" }],
  };
  return actions[order.status] || [];
};

const requiresPaidMomoBeforeProcessing = (order, status) =>
  order.paymentMethod === "MOMO_SANDBOX" &&
  ["CONFIRMED", "PREPARING", "PROCESSING"].includes(status) &&
  order.paymentStatus !== "PAID";

const paymentActions = (order) => {
  if (order.paymentStatus === "REFUND_REQUIRED") {
    return [{ paymentStatus: "REFUNDED", label: "Đã hoàn tiền" }];
  }
  return [];
};

export default function ConsultationAdminOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [orders, setOrders] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, search: initialSearch });
  const [actionModal, setActionModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [dashboardResponse, ordersResponse] = await Promise.all([
        consultationOrderAPI.adminDashboard(),
        consultationOrderAPI.adminList(filters),
      ]);
      setDashboard(dashboardResponse.data);
      setOrders(ordersResponse.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu quản trị");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Đồng bộ URL search với filters
  useEffect(() => {
    if (filters.search !== searchParams.get("search")) {
      const newParams = new URLSearchParams(searchParams);
      if (filters.search) {
        newParams.set("search", filters.search);
      } else {
        newParams.delete("search");
      }
      setSearchParams(newParams, { replace: true });
    }
  }, [filters.search, searchParams, setSearchParams]);

  const activeFilterCount = useMemo(
    () =>
      Object.entries(filters).filter(([key, value]) => {
        if (key === "sortBy") return value !== "latest";
        return Boolean(value);
      }).length,
    [filters],
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const openStatusModal = (order, action) => {
    setError("");
    setSuccess("");
    setActionModal({
      type: "status",
      order,
      label: action.label,
      status: action.status,
      note: "",
      title: `${action.label} yêu cầu ${order.orderCode}`,
      message: `Chuyển trạng thái từ "${order.statusLabel}" sang "${ORDER_STATUS_LABELS[action.status]}".`,
    });
  };

  const openPaymentModal = (order, action) => {
    setError("");
    setSuccess("");
    setActionModal({
      type: "payment",
      order,
      label: action.label,
      paymentStatus: action.paymentStatus,
      note: "",
      title: `${action.label} cho yêu cầu ${order.orderCode}`,
      message: `Cập nhật thanh toán từ "${order.paymentStatusLabel}" sang "${PAYMENT_STATUS_LABELS[action.paymentStatus]}".`,
    });
  };

  const closeActionModal = () => {
    if (updatingId) return;
    setActionModal(null);
  };

  const updateModalNote = (value) => {
    setActionModal((current) => (current ? { ...current, note: value } : current));
  };

  const submitActionModal = async () => {
    if (!actionModal) return;
    const { order, note = "" } = actionModal;
    try {
      setUpdatingId(order._id);
      setError("");
      setSuccess("");
      if (actionModal.type === "status") {
        await consultationOrderAPI.updateStatus(
          order._id,
          actionModal.status,
          note.trim(),
        );
        setSuccess(`Đã cập nhật yêu cầu ${order.orderCode}`);
      } else {
        await consultationOrderAPI.updatePaymentStatus(
          order._id,
          actionModal.paymentStatus,
          note.trim(),
        );
        setSuccess(`Đã cập nhật thanh toán yêu cầu ${order.orderCode}`);
      }
      setActionModal(null);
      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (actionModal.type === "status"
            ? "Không cập nhật được trạng thái"
            : "Không cập nhật được thanh toán"),
      );
    } finally {
      setUpdatingId("");
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">
            Quản trị yêu cầu tư vấn
          </h1>
          <p className="mt-2 text-gray-600">
            Admin kiểm soát trạng thái yêu cầu, thanh toán COD/MoMo, yêu cầu hủy và doanh thu.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
            {success}
          </div>
        )}

        {dashboard && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Tổng yêu cầu</p>
              <p className="mt-1 text-3xl font-bold text-gray-900">
                {dashboard.totalOrders}
              </p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Đã thu MoMo/COD</p>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {formatCurrency(dashboard.collectedRevenue)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-gray-500">COD chờ thu</p>
              <p className="mt-1 text-2xl font-bold text-amber-600">
                {formatCurrency(dashboard.pendingCOD)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Cần hoàn tiền</p>
              <p className="mt-1 text-2xl font-bold text-orange-600">
                {formatCurrency(dashboard.refundRequired)}
              </p>
            </div>
            <div className="rounded-lg bg-white p-5 shadow">
              <p className="text-sm text-gray-500">Yêu cầu hủy</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {dashboard.cancelRequests}
              </p>
            </div>
          </div>
        )}

        <section className="mb-6 rounded-lg bg-white p-5 shadow">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Bộ lọc thông minh</h2>
              <p className="text-sm text-gray-600">
                Danh sách tự cập nhật theo mã, trạng thái, phương thức, ngày tạo và khoảng tiền.
              </p>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
              >
                Xóa {activeFilterCount} bộ lọc
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <input
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Tìm mã, tên, SĐT, email, MSSV"
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả trạng thái</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select
              value={filters.paymentStatus}
              onChange={(e) => updateFilter("paymentStatus", e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả thanh toán</option>
              {PAYMENT_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {PAYMENT_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <select
              value={filters.paymentMethod}
              onChange={(e) => updateFilter("paymentMethod", e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Tất cả phương thức</option>
              {PAYMENT_METHOD_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <label className="text-sm font-medium text-gray-700">
              Từ ngày
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Đến ngày
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Tiền từ
              <input
                type="number"
                min="0"
                value={filters.minTotal}
                onChange={(e) => updateFilter("minTotal", e.target.value)}
                placeholder="0"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Tiền đến
              <input
                type="number"
                min="0"
                value={filters.maxTotal}
                onChange={(e) => updateFilter("maxTotal", e.target.value)}
                placeholder="500000"
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="text-sm font-medium text-gray-700">
              Sắp xếp
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter("sortBy", e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {SORT_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </section>

        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-lg border border-gray-100 bg-white p-6 shadow"
            >
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_1fr_1fr]">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      #{order.orderCode}
                    </h2>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                    >
                      {order.statusLabel}
                    </span>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${paymentClass(order.paymentStatus)}`}
                    >
                      {order.paymentStatusLabel}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Người yêu cầu: {order.contactInfo?.fullName} -{" "}
                    {order.contactInfo?.phone}
                  </p>
                  {(order.contactInfo?.email || order.contactInfo?.studentCode) && (
                    <p className="text-sm text-gray-600">
                      {order.contactInfo?.email || "Chưa có email"}
                      {order.contactInfo?.studentCode
                        ? ` - MSSV: ${order.contactInfo.studentCode}`
                        : ""}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    Tài khoản:{" "}
                    {order.userId?.email || order.userId?.username || "Không rõ"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tạo lúc {formatDateTime(order.createdAt)}
                  </p>
                  {order.contactInfo?.note && (
                    <p className="mt-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                      Ghi chú liên hệ: {order.contactInfo.note}
                    </p>
                  )}
                  {order.cancelReason && (
                    <p className="mt-2 rounded-lg bg-orange-50 p-3 text-sm text-orange-700">
                      Lý do hủy: {order.cancelReason}
                    </p>
                  )}
                </div>

                <div>
                  <p className="mb-2 font-semibold text-gray-900">
                    Nội dung tư vấn
                  </p>
                  <div className="space-y-2">
                    {(order.items || []).map((item, index) => (
                      <div key={`${order._id}-${index}`} className="text-sm text-gray-700">
                        <p className="font-medium">{item.counselorName}</p>
                        <p>{item.topic}</p>
                        <p className="text-gray-500">
                          {formatDateTime(item.preferredDate)} -{" "}
                          {item.meetingType === "online" ? "Online" : "Trực tiếp"}
                        </p>
                        {item.note && (
                          <p className="text-gray-500">Ghi chú: {item.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Tổng tiền</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.total)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    {order.paymentMethodLabel}
                  </p>
                  {order.paymentMethod === "MOMO_SANDBOX" &&
                    ["PENDING", "FAILED", "EXPIRED"].includes(
                      order.paymentStatus,
                    ) && (
                      <p className="mt-1 text-sm text-amber-600">
                        Chưa được phép xác nhận/xử lý khi MoMo chưa thanh toán thành công.
                      </p>
                    )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {nextActions(order).map((action) => (
                      <button
                        key={`${order._id}-${action.status}-${action.label}`}
                        type="button"
                        disabled={
                          updatingId === order._id ||
                          requiresPaidMomoBeforeProcessing(order, action.status)
                        }
                        onClick={() => openStatusModal(order, action)}
                        title={
                          requiresPaidMomoBeforeProcessing(order, action.status)
                            ? "Đơn MoMo phải thanh toán thành công trước khi xác nhận/xử lý"
                            : ""
                        }
                        className={`rounded-lg px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
                          action.status === "CANCELLED"
                            ? "bg-danger text-white hover:bg-red-600"
                            : "bg-primary text-white hover:bg-primary-dark"
                        }`}
                      >
                        {action.label}
                      </button>
                    ))}
                    {paymentActions(order).map((action) => (
                      <button
                        key={`${order._id}-${action.paymentStatus}`}
                        type="button"
                        disabled={updatingId === order._id}
                        onClick={() => openPaymentModal(order, action)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {action.label}
                      </button>
                    ))}
                    {nextActions(order).length === 0 &&
                      paymentActions(order).length === 0 && (
                      <span className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-500">
                        Không còn thao tác
                      </span>
                    )}
                    <Link
                      to={`/consultation-orders/${order._id}`}
                      className="rounded-lg border border-primary px-3 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {orders.length === 0 && (
            <div className="rounded-lg bg-white p-8 text-center shadow">
              <p className="text-gray-600">Không có yêu cầu phù hợp bộ lọc.</p>
            </div>
          )}
        </div>

        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <button
              type="button"
              aria-label="Đóng hộp thoại"
              className="absolute inset-0 bg-gray-950/50"
              onClick={closeActionModal}
            />
            <div className="relative w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {actionModal.title}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  {actionModal.message}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Người yêu cầu:</span>{" "}
                  {actionModal.order.contactInfo?.fullName || "Không rõ"}
                </p>
                <p>
                  <span className="font-semibold">Tổng tiền:</span>{" "}
                  {formatCurrency(actionModal.order.total)}
                </p>
                <p>
                  <span className="font-semibold">Thanh toán:</span>{" "}
                  {actionModal.order.paymentMethodLabel} -{" "}
                  {actionModal.order.paymentStatusLabel}
                </p>
              </div>

              <label className="mt-4 block text-sm font-semibold text-gray-700">
                Ghi chú cho timeline
                <textarea
                  value={actionModal.note}
                  onChange={(event) => updateModalNote(event.target.value)}
                  rows="4"
                  placeholder="Ví dụ: Đã gọi xác nhận với sinh viên, hồ sơ hợp lệ..."
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 font-normal text-gray-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </label>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeActionModal}
                  disabled={Boolean(updatingId)}
                  className="rounded-lg border border-gray-300 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Không thực hiện
                </button>
                <button
                  type="button"
                  onClick={submitActionModal}
                  disabled={Boolean(updatingId)}
                  className={`rounded-lg px-4 py-2 font-semibold text-white disabled:opacity-60 ${
                    actionModal.status === "CANCELLED"
                      ? "bg-danger hover:bg-red-600"
                      : "bg-primary hover:bg-primary-dark"
                  }`}
                >
                  {updatingId ? "Đang xử lý..." : "Xác nhận"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

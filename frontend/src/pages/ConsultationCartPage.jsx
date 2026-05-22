import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/UI";
import AvailableSlotPicker from "../components/booking/AvailableSlotPicker";
import { consultationCartAPI } from "../services/api";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  toDateTimeLocalValue,
} from "../utils/consultationFormat";

const CHECKOUT_KEY = "consultation_checkout_item_ids";
const CART_PAGE_SIZE = 3;
const fallbackImage =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=720&h=520&fit=crop";

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

export default function ConsultationCartPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [viewMode, setViewMode] = useState("compact");
  const [page, setPage] = useState(1);
  const [expandedItems, setExpandedItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await consultationCartAPI.get();
      setCart(response.data);
      const items = response.data.items || [];
      setSelectedIds((current) => {
        const itemIds = items.map((item) => item._id);
        const next = current.filter((id) => itemIds.includes(id));
        return next.length > 0 ? next : itemIds;
      });
      setDrafts(
        items.reduce((result, item) => {
          result[item._id] = {
            topic: item.topic || "",
            preferredDate: toDateTimeLocalValue(item.preferredDate),
            meetingType: item.meetingType || "online",
            note: item.note || "",
          };
          return result;
        }, {}),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được giỏ tư vấn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const items = useMemo(() => cart?.items || [], [cart]);
  const selectedItems = useMemo(
    () => items.filter((item) => selectedIds.includes(item._id)),
    [items, selectedIds],
  );
  const selectedTotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );
  const totalPages = Math.max(1, Math.ceil(items.length / CART_PAGE_SIZE));
  const paginatedItems = useMemo(
    () => items.slice((page - 1) * CART_PAGE_SIZE, page * CART_PAGE_SIZE),
    [items, page],
  );
  const rangeStart = items.length === 0 ? 0 : (page - 1) * CART_PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * CART_PAGE_SIZE, items.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const setDraft = (itemId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        [field]: value,
      },
    }));
  };

  const toggleItem = (itemId) => {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId],
    );
  };

  const toggleAll = () => {
    setSelectedIds((current) =>
      current.length === items.length ? [] : items.map((item) => item._id),
    );
  };

  const toggleEditor = (itemId) => {
    setExpandedItems((current) => ({
      ...current,
      [itemId]: !current[itemId],
    }));
  };

  const updateItem = async (itemId) => {
    const draft = drafts[itemId];
    if (!draft.preferredDate) {
      setError("Vui lòng chọn một slot tư vấn còn trống");
      return;
    }
    try {
      setSavingId(itemId);
      setError("");
      setSuccess("");
      const response = await consultationCartAPI.updateItem(itemId, {
        ...draft,
        preferredDate: new Date(draft.preferredDate).toISOString(),
      });
      setCart(response.data);
      setSuccess("Đã cập nhật mục trong giỏ");
    } catch (err) {
      setError(err.response?.data?.message || "Không cập nhật được mục trong giỏ");
    } finally {
      setSavingId("");
    }
  };

  const removeItem = async (itemId) => {
    try {
      setSavingId(itemId);
      setError("");
      setSuccess("");
      const response = await consultationCartAPI.removeItem(itemId);
      setCart(response.data);
      setSelectedIds((current) => current.filter((id) => id !== itemId));
      setSuccess("Đã xóa mục khỏi giỏ");
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa được mục khỏi giỏ");
    } finally {
      setSavingId("");
    }
  };

  const clearCart = async () => {
    if (!window.confirm("Xóa toàn bộ giỏ tư vấn?")) return;
    try {
      setError("");
      setSuccess("");
      const response = await consultationCartAPI.clear();
      setCart(response.data);
      setSelectedIds([]);
      setDrafts({});
      setSuccess("Đã xóa toàn bộ giỏ tư vấn");
    } catch (err) {
      setError(err.response?.data?.message || "Không xóa được giỏ tư vấn");
    }
  };

  const goCheckout = () => {
    if (selectedIds.length === 0) {
      setError("Vui lòng chọn ít nhất một mục để thanh toán");
      return;
    }
    localStorage.setItem(CHECKOUT_KEY, JSON.stringify(selectedIds));
    navigate("/consultation-checkout");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Giỏ tư vấn</h1>
            <p className="text-gray-600">
              Chọn riêng từng tư vấn viên hoặc nhóm mục cần đặt, không bắt buộc thanh toán toàn bộ giỏ.
            </p>
          </div>
          <Link
            to="/book-counselor"
            className="inline-flex justify-center rounded-lg border border-primary px-5 py-2.5 font-semibold text-primary hover:bg-blue-50"
          >
            Thêm tư vấn viên
          </Link>
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

        {items.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Giỏ tư vấn đang trống
            </h2>
            <p className="mb-6 text-gray-600">
              Hãy chọn tư vấn viên phù hợp trước khi tạo yêu cầu.
            </p>
            <Link
              to="/book-counselor"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
            >
              Chọn tư vấn viên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-lg bg-white p-4 shadow">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <label className="flex items-center gap-3 font-medium text-gray-800">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === items.length}
                      onChange={toggleAll}
                      className="h-4 w-4"
                    />
                    Chọn tất cả
                  </label>

                  <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1 md:w-56">
                    <button
                      type="button"
                      onClick={() => setViewMode("compact")}
                      className={`rounded-md px-3 py-2 text-sm font-semibold ${
                        viewMode === "compact"
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-600 hover:text-primary"
                      }`}
                    >
                      Thu gọn
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("expanded")}
                      className={`rounded-md px-3 py-2 text-sm font-semibold ${
                        viewMode === "expanded"
                          ? "bg-white text-primary shadow-sm"
                          : "text-gray-600 hover:text-primary"
                      }`}
                    >
                      Mở rộng
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm font-semibold text-danger hover:text-red-700"
                  >
                    Xóa giỏ
                  </button>
                </div>

                <p className="mt-3 text-sm text-gray-500">
                  Hiển thị {rangeStart}-{rangeEnd} trong {items.length} mục tư vấn
                </p>
              </div>

              {paginatedItems.map((item) => {
                const counselor = item.counselorId || {};
                const draft = drafts[item._id] || {};
                const showEditor =
                  viewMode === "expanded" || expandedItems[item._id];
                return (
                  <div
                    key={item._id}
                    className="rounded-lg border border-gray-100 bg-white p-5 shadow"
                  >
                    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <label className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item._id)}
                          onChange={() => toggleItem(item._id)}
                          className="mt-1 h-4 w-4"
                        />
                        <img
                          src={counselor.image || fallbackImage}
                          alt={counselor.fullName || "Tư vấn viên"}
                          onError={handleImageError}
                          className="h-16 w-20 rounded object-cover"
                        />
                        <span>
                          <span className="block text-lg font-bold text-gray-900">
                            {counselor.fullName || "Tư vấn viên"}
                          </span>
                          <span className="text-sm text-gray-600">
                            {(counselor.expertise || []).join(", ") || "Tư vấn sinh viên"}
                          </span>
                        </span>
                      </label>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Phí tư vấn ({formatDuration(item.durationMinutes)})
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>

                    {!showEditor && (
                      <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-3 text-sm md:grid-cols-3">
                        <div>
                          <p className="text-gray-500">Chủ đề</p>
                          <p className="font-semibold text-gray-900">
                            {item.topic || "Chưa nhập chủ đề"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Thời gian</p>
                          <p className="font-semibold text-gray-900">
                            {formatDateTime(item.preferredDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Hình thức</p>
                          <p className="font-semibold text-gray-900">
                            {item.meetingType === "online" ? "Online" : "Trực tiếp"}
                          </p>
                        </div>
                      </div>
                    )}

                    {showEditor && (
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)]">
                        <div className="space-y-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Chủ đề
                            </label>
                            <input
                              value={draft.topic || ""}
                              onChange={(e) =>
                                setDraft(item._id, "topic", e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Hình thức
                            </label>
                            <select
                              value={draft.meetingType || "online"}
                              onChange={(e) =>
                                setDraft(item._id, "meetingType", e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="online">Online</option>
                              <option value="in-person">Trực tiếp</option>
                            </select>
                          </div>

                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Ghi chú
                            </label>
                            <textarea
                              rows="4"
                              value={draft.note || ""}
                              onChange={(e) =>
                                setDraft(item._id, "note", e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                          </div>

                          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                            Thời lượng {formatDuration(item.durationMinutes)} ·{" "}
                            {formatCurrency(item.price || 0)} ·{" "}
                            {draft.meetingType === "online" ? "Online" : "Trực tiếp"}
                          </div>
                        </div>

                        <AvailableSlotPicker
                          counselorId={counselor._id}
                          value={draft.preferredDate || ""}
                          onChange={(value) =>
                            setDraft(item._id, "preferredDate", value)
                          }
                          variant="compact"
                        />
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500">
                        Thời gian hiện tại: {formatDateTime(item.preferredDate)} ·{" "}
                        {formatDuration(item.durationMinutes)} ·{" "}
                        {item.meetingType === "online" ? "Online" : "Trực tiếp"}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        {viewMode === "compact" && (
                          <button
                            type="button"
                            onClick={() => toggleEditor(item._id)}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
                          >
                            {showEditor ? "Thu gọn" : "Chỉnh sửa"}
                          </button>
                        )}
                        {showEditor && (
                          <button
                            type="button"
                            onClick={() => updateItem(item._id)}
                            disabled={savingId === item._id}
                            className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50 disabled:opacity-60"
                          >
                            Cập nhật
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeItem(item._id)}
                          disabled={savingId === item._id}
                          className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-danger hover:bg-red-50 disabled:opacity-60"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {totalPages > 1 && (
                <div className="flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang trước
                  </button>
                  <div className="flex flex-wrap justify-center gap-2">
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (pageNumber) => (
                        <button
                          key={pageNumber}
                          type="button"
                          onClick={() => setPage(pageNumber)}
                          className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold ${
                            pageNumber === page
                              ? "bg-primary text-white"
                              : "border border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setPage((current) => Math.min(totalPages, current + 1))
                    }
                    disabled={page === totalPages}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </div>

            <aside className="h-fit rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Tóm tắt thanh toán
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số mục đã chọn</span>
                  <span className="font-semibold">{selectedItems.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-semibold">{formatCurrency(selectedTotal)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {formatCurrency(selectedTotal)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={goCheckout}
                disabled={selectedIds.length === 0}
                className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                Thanh toán mục đã chọn
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

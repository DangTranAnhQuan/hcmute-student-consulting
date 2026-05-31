import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Spinner } from "../components/UI";
import { consultationCartAPI, consultationOrderAPI } from "../services/api";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
} from "../utils/consultationFormat";

const CHECKOUT_KEY = "consultation_checkout_item_ids";
const fallbackImage =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=720&h=520&fit=crop";

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

export default function ConsultationCheckoutPage() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [cart, setCart] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [pointsToUse, setPointsToUse] = useState(0);
  const [contactInfo, setContactInfo] = useState({
    fullName: user?.fullName || user?.username || "",
    phone: user?.phone || "",
    email: user?.email || "",
    studentCode: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        const response = await consultationCartAPI.get();
        const storedIds = JSON.parse(
          localStorage.getItem(CHECKOUT_KEY) || "[]",
        );
        const itemIds = (response.data.items || []).map((item) => item._id);
        const validStoredIds = storedIds.filter((id) => itemIds.includes(id));
        setCart(response.data);
        setSelectedIds(validStoredIds.length > 0 ? validStoredIds : itemIds);
        const methodsResponse = await consultationOrderAPI.paymentMethods();
        setPaymentMethods(methodsResponse.data.methods || []);
      } catch (err) {
        setError(
          err.response?.data?.message || "Không tải được thông tin thanh toán",
        );
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  const selectedItems = useMemo(() => {
    const items = cart?.items || [];
    return items.filter((item) => selectedIds.includes(item._id));
  }, [cart, selectedIds]);

  const subtotal = selectedItems.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0,
  );
  const total = subtotal;
  const momoMethod = paymentMethods.find(
    (method) => method.code === "MOMO_SANDBOX",
  );
  const codMethod = paymentMethods.find((method) => method.code === "COD");

  const updateContact = (field, value) => {
    setContactInfo((current) => ({ ...current, [field]: value }));
  };

  const availablePoints = Number(user?.loyaltyPoints || 0);
  const maxPointsToUse = Math.min(availablePoints, subtotal);
  const estimatedPointsDiscount = Math.min(
    Math.max(0, Number(pointsToUse || 0)),
    subtotal,
  );
  const estimatedTotal = Math.max(0, subtotal - estimatedPointsDiscount);

  const now = new Date();
  const activeCoupons = (user?.coupons || []).filter(
    (c) => !c.isUsed && (!c.expiresAt || new Date(c.expiresAt) > now),
  );

  const submitCheckout = async (event) => {
    event.preventDefault();
    if (selectedItems.length === 0) {
      setError("Không có mục nào được chọn để thanh toán");
      return;
    }

    if (pointsToUse < 0 || pointsToUse > availablePoints) {
      setError("Số điểm sử dụng không hợp lệ");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const response = await consultationOrderAPI.checkout({
        selectedItemIds: selectedIds,
        paymentMethod,
        couponCode: couponCode.trim(),
        pointsToUse: Number(pointsToUse || 0),
        contactInfo,
      });
      localStorage.removeItem(CHECKOUT_KEY);
      if (response.data.payment?.payUrl) {
        window.location.href = response.data.payment.payUrl;
        return;
      }
      navigate(`/consultation-orders/${response.data.order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Không tạo được yêu cầu tư vấn");
    } finally {
      setSubmitting(false);
    }
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
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <Link
            to="/consultation-cart"
            className="text-primary hover:text-primary-dark"
          >
            ← Quay lại giỏ tư vấn
          </Link>
          <h1 className="mt-3 text-4xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-2 text-gray-600">
            Xác nhận thông tin liên hệ và chọn COD hoặc MoMo Sandbox.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <form
          onSubmit={submitCheckout}
          className="grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Thông tin người yêu cầu
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Họ tên
                  </label>
                  <input
                    required
                    value={contactInfo.fullName}
                    onChange={(e) => updateContact("fullName", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Số điện thoại
                  </label>
                  <input
                    required
                    value={contactInfo.phone}
                    onChange={(e) => updateContact("phone", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => updateContact("email", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Mã sinh viên
                  </label>
                  <input
                    value={contactInfo.studentCode}
                    onChange={(e) =>
                      updateContact("studentCode", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Ghi chú cho ban tư vấn
                  </label>
                  <textarea
                    rows="3"
                    value={contactInfo.note}
                    onChange={(e) => updateContact("note", e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Phương thức thanh toán
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:border-primary">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === "COD"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-bold text-gray-900">COD</span>
                      <span className="text-sm text-gray-600">
                        {codMethod?.description ||
                          "Thanh toán sau khi yêu cầu tư vấn hoàn tất."}
                      </span>
                    </span>
                  </div>
                </label>
                <label
                  className={`rounded-lg border p-4 ${
                    momoMethod?.enabled
                      ? "cursor-pointer border-gray-200 hover:border-primary"
                      : "cursor-not-allowed border-gray-200 bg-gray-50 opacity-75"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="MOMO_SANDBOX"
                      checked={paymentMethod === "MOMO_SANDBOX"}
                      disabled={!momoMethod?.enabled}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-bold text-gray-900">
                        MoMo Sandbox
                      </span>
                      <span className="text-sm text-gray-600">
                        {momoMethod?.description ||
                          "Chuyển sang cổng MoMo sandbox. Nếu thoát giữa chừng, đơn sẽ ở trạng thái chờ thanh toán và có thể thanh toán lại."}
                      </span>
                    </span>
                  </div>
                </label>
              </div>
              {paymentMethod === "MOMO_SANDBOX" && total <= 0 && (
                <p className="mt-3 text-sm text-red-600">
                  MoMo Sandbox cần số tiền lớn hơn 0. Dịch vụ miễn phí hãy chọn
                  COD.
                </p>
              )}
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Mã ưu đãi và điểm thưởng
              </h2>
              <div className="space-y-4 text-sm text-gray-700">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="font-semibold text-gray-900">Điểm tích lũy</p>
                  <p>{availablePoints} điểm</p>
                  <p className="mt-2 text-xs text-gray-500">
                    1 điểm = 1đ khi thanh toán. Điểm chỉ được sử dụng tối đa
                    bằng tổng đơn.
                  </p>
                </div>

                {activeCoupons.length > 0 && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="font-semibold text-green-900">
                      Mã giảm giá khả dụng
                    </p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {activeCoupons.slice(0, 3).map((coupon) => (
                        <li
                          key={coupon.code}
                          className="cursor-pointer rounded-lg bg-white p-3 shadow-sm hover:border-green-400 border border-transparent"
                          onClick={() => setCouponCode(coupon.code)}
                        >
                          <p className="font-semibold">{coupon.code}</p>
                          <p>
                            {coupon.description ||
                              (coupon.type === "percent"
                                ? `Giảm ${coupon.value}%`
                                : `Giảm ${coupon.value.toLocaleString("vi-VN")}đ`)}
                          </p>
                          {coupon.expiresAt && (
                            <p className="text-xs text-gray-500">
                              Hết hạn:{" "}
                              {new Date(coupon.expiresAt).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Mã giảm giá
                    </label>
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Sử dụng điểm
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={maxPointsToUse}
                      value={pointsToUse}
                      onChange={(e) =>
                        setPointsToUse(Number(e.target.value || 0))
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Tối đa {maxPointsToUse} điểm có thể dùng cho đơn này.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-lg bg-white p-6 shadow">
            <h2 className="mb-4 text-xl font-bold text-gray-900">
              Yêu cầu đã chọn
            </h2>
            <div className="space-y-4">
              {selectedItems.map((item) => {
                const counselor = item.counselorId || {};
                return (
                  <div key={item._id} className="border-b border-gray-100 pb-4">
                    <div className="flex gap-3">
                      <img
                        src={counselor.image || fallbackImage}
                        alt={counselor.fullName || "Tư vấn viên"}
                        onError={handleImageError}
                        className="h-14 w-16 rounded object-cover"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">
                          {counselor.fullName || "Tư vấn viên"}
                        </p>
                        <p className="text-sm text-gray-600">{item.topic}</p>
                        <p className="text-sm text-gray-500">
                          {formatDateTime(item.preferredDate)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDuration(item.durationMinutes)} ·{" "}
                          {item.meetingType === "online"
                            ? "Online"
                            : "Trực tiếp"}
                        </p>
                        <p className="mt-1 font-semibold text-green-600">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {estimatedPointsDiscount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Điểm tích lũy ({pointsToUse} điểm)</span>
                  <span>-{formatCurrency(estimatedPointsDiscount)}</span>
                </div>
              )}
              {couponCode.trim() && (
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Mã: {couponCode.trim().toUpperCase()}</span>
                  <span>Tính khi đặt</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-2">
                <span>Ước tính</span>
                <span className="text-green-600">{formatCurrency(estimatedTotal)}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={
                submitting ||
                selectedItems.length === 0 ||
                (paymentMethod === "MOMO_SANDBOX" && total <= 0)
              }
              className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? "Đang tạo yêu cầu..."
                : paymentMethod === "MOMO_SANDBOX"
                  ? "Thanh toán qua MoMo"
                  : "Đặt yêu cầu COD"}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}

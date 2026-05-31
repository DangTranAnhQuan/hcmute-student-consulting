import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/UI";
import { consultationOrderAPI } from "../services/api";
import {
  formatCurrency,
  formatDateTime,
  formatDuration,
  paymentClass,
  statusClass,
} from "../utils/consultationFormat";

const canRepay = (order) =>
  order.paymentMethod === "MOMO_SANDBOX" &&
  order.status === "NEW" &&
  ["PENDING", "FAILED", "EXPIRED"].includes(order.paymentStatus);

export default function ConsultationOrdersPage() {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState("");
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await consultationOrderAPI.list();
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được lịch sử yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const payAgain = async (order) => {
    try {
      setPayingId(order._id);
      setError("");
      const response = await consultationOrderAPI.payMomo(order._id);
      if (response.data.payment?.payUrl) {
        window.location.href = response.data.payment.payUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không tạo lại được phiên MoMo");
    } finally {
      setPayingId("");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  const momoMessage =
    searchParams.get("momoResult") === "error" ? searchParams.get("message") : "";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Yêu cầu tư vấn của tôi
            </h1>
            <p className="text-gray-600">
              Xem lịch sử, trạng thái thanh toán và tiến độ xử lý từng yêu cầu.
            </p>
          </div>
          <Link
            to="/book-counselor"
            className="inline-flex justify-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
          >
            Tạo yêu cầu mới
          </Link>
        </div>

        {(error || momoMessage) && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error || momoMessage}
          </div>
        )}

        {orders.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Chưa có yêu cầu nào
            </h2>
            <p className="mb-6 text-gray-600">
              Bạn có thể chọn tư vấn viên và tạo yêu cầu tư vấn từ giỏ.
            </p>
            <Link
              to="/book-counselor"
              className="inline-flex rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
            >
              Chọn tư vấn viên
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="rounded-lg border border-gray-100 bg-white p-6 shadow"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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
                      Tạo lúc {formatDateTime(order.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {order.paymentMethodLabel}
                    </p>
                    <div className="mt-3 space-y-1">
                      {(order.items || []).map((item, index) => (
                        <p key={`${order._id}-${index}`} className="text-sm text-gray-700">
                          {item.counselorName} - {item.topic} -{" "}
                          {formatDuration(item.durationMinutes)}
                        </p>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-gray-500">
                      {order.cancelPolicy?.message}
                    </p>
                  </div>

                  <div className="min-w-[220px] text-left lg:text-right">
                    <p className="text-sm text-gray-500">Tổng tiền</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(order.total)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3 lg:justify-end">
                      {canRepay(order) && (
                        <button
                          type="button"
                          onClick={() => payAgain(order)}
                          disabled={payingId === order._id}
                          className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
                        >
                          {payingId === order._id ? "Đang tạo..." : "Thanh toán lại"}
                        </button>
                      )}
                      <Link
                        to={`/consultation-orders/${order._id}`}
                        className="rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
                      >
                        Theo dõi chi tiết
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

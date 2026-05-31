import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { Spinner } from "../components/UI";
import { consultationOrderAPI } from "../services/api";
import {
  ORDER_STATUS_LABELS,
  formatCurrency,
  formatDateTime,
  formatDuration,
  paymentClass,
  statusClass,
} from "../utils/consultationFormat";

const ORDER_STEPS = [
  "NEW",
  "CONFIRMED",
  "PREPARING",
  "PROCESSING",
  "COMPLETED",
];
const STATUS_INDEX = ORDER_STEPS.reduce((result, status, index) => {
  result[status] = index;
  return result;
}, {});
const REASONS = [
  "Đổi lịch tư vấn",
  "Không còn nhu cầu",
  "Chọn nhầm tư vấn viên",
  "Muốn bổ sung thông tin trước khi đặt lại",
  "Lý do khác",
];

const canRepay = (order) =>
  order?.paymentMethod === "MOMO_SANDBOX" &&
  order.status === "NEW" &&
  ["PENDING", "FAILED", "EXPIRED"].includes(order.paymentStatus);

export default function ConsultationOrderDetailPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [reason, setReason] = useState(REASONS[0]);
  const [reasonNote, setReasonNote] = useState("");
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [reviewingIndex, setReviewingIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);
      const response = await consultationOrderAPI.detail(id);
      setOrder(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Không tải được chi tiết yêu cầu",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (!order) return;
    setReviewDrafts(
      (order.items || []).reduce((result, _, index) => {
        const review = (order.reviews || []).find(
          (item) => Number(item.itemIndex) === index,
        );
        result[index] = {
          rating: review?.rating || 5,
          comment: review?.comment || "",
        };
        return result;
      }, {}),
    );
  }, [order]);

  useEffect(() => {
    const momoResult = searchParams.get("momoResult");
    if (momoResult === "0") {
      setSuccess("Thanh toán MoMo thành công. Yêu cầu đang chờ xác nhận.");
    } else if (momoResult && momoResult !== "0") {
      setError(
        "Thanh toán MoMo chưa thành công. Bạn có thể thanh toán lại trước khi yêu cầu được xử lý.",
      );
    }
  }, [searchParams]);

  const timelineByStatus = useMemo(() => {
    const result = {};
    (order?.timeline || []).forEach((entry) => {
      result[entry.status] = entry;
    });
    return result;
  }, [order]);

  const reviewsByIndex = useMemo(() => {
    const result = {};
    (order?.reviews || []).forEach((review) => {
      result[Number(review.itemIndex)] = review;
    });
    return result;
  }, [order]);

  const rewardsByIndex = useMemo(() => {
    const result = {};
    (order?.reviewRewards || []).forEach((reward) => {
      result[Number(reward.itemIndex)] = reward;
    });
    return result;
  }, [order]);

  const submitCancel = async (event) => {
    event.preventDefault();
    if (!order?.cancelPolicy?.canCancel) return;

    const finalReason =
      reason === "Lý do khác"
        ? reasonNote.trim()
        : `${reason}${reasonNote.trim() ? ` - ${reasonNote.trim()}` : ""}`;

    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      const response = await consultationOrderAPI.cancel(
        order._id,
        finalReason,
      );
      setOrder(response.data);
      setSuccess(
        response.data.status === "CANCEL_REQUESTED"
          ? "Đã gửi yêu cầu hủy, đang chờ admin xác nhận"
          : "Yêu cầu đã được hủy",
      );
    } catch (err) {
      setError(err.response?.data?.message || "Không xử lý được yêu cầu hủy");
    } finally {
      setSubmitting(false);
    }
  };

  const payAgain = async () => {
    try {
      setPaying(true);
      setError("");
      const response = await consultationOrderAPI.payMomo(order._id);
      if (response.data.payment?.payUrl) {
        window.location.href = response.data.payment.payUrl;
      }
    } catch (err) {
      setError(err.response?.data?.message || "Không tạo lại được phiên MoMo");
    } finally {
      setPaying(false);
    }
  };

  const updateReviewDraft = (index, field, value) => {
    setReviewDrafts((current) => ({
      ...current,
      [index]: {
        ...(current[index] || { rating: 5, comment: "" }),
        [field]: value,
      },
    }));
  };

  const submitReview = async (index) => {
    const draft = reviewDrafts[index] || { rating: 5, comment: "" };
    try {
      setReviewingIndex(index);
      setError("");
      setSuccess("");
      const response = await consultationOrderAPI.reviewItem(order._id, index, {
        rating: Number(draft.rating),
        comment: draft.comment,
      });
      setOrder(response.data.order);
      setSuccess("Đã lưu đánh giá tư vấn viên");
    } catch (err) {
      setError(err.response?.data?.message || "Không lưu được đánh giá");
    } finally {
      setReviewingIndex(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-700">Không tìm thấy yêu cầu.</p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_INDEX[order.status] ?? -1;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <Link
            to="/consultation-orders"
            className="text-primary hover:text-primary-dark"
          >
            ← Quay lại lịch sử
          </Link>
          <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Theo dõi yêu cầu #{order.orderCode}
              </h1>
              <p className="mt-2 text-gray-600">
                Tạo lúc {formatDateTime(order.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusClass(order.status)}`}
              >
                {order.statusLabel}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-sm font-semibold ${paymentClass(order.paymentStatus)}`}
              >
                {order.paymentStatusLabel}
              </span>
            </div>
          </div>
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Tiến độ xử lý
              </h2>
              <div className="space-y-4">
                {ORDER_STEPS.map((status, index) => {
                  const entry = timelineByStatus[status];
                  const active =
                    order.status === "CANCELLED" ||
                    order.status === "CANCEL_REQUESTED"
                      ? Boolean(entry)
                      : index <= currentIndex;
                  return (
                    <div key={status} className="flex gap-4">
                      <div
                        className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                          active
                            ? "border-primary bg-primary text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div className="pb-2">
                        <p className="font-semibold text-gray-900">
                          {ORDER_STATUS_LABELS[status]}
                        </p>
                        <p className="text-sm text-gray-600">
                          {entry?.note || "Chưa thực hiện"}
                        </p>
                        {entry?.at && (
                          <p className="mt-1 text-xs text-gray-500">
                            {formatDateTime(entry.at)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {["CANCELLED", "CANCEL_REQUESTED"].includes(order.status) && (
                <div className="mt-5 rounded-lg border border-orange-200 bg-orange-50 p-4">
                  <p className="font-semibold text-orange-800">
                    {order.status === "CANCELLED"
                      ? "Yêu cầu đã hủy"
                      : "Yêu cầu hủy đang chờ admin xác nhận"}
                  </p>
                  {order.cancelReason && (
                    <p className="mt-1 text-sm text-orange-700">
                      Lý do: {order.cancelReason}
                    </p>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Dịch vụ tư vấn
              </h2>
              <div className="space-y-4">
                {(order.items || []).map((item, index) => (
                  <div
                    key={`${item.counselorId}-${index}`}
                    className="rounded-lg border border-gray-100 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-lg font-bold text-gray-900">
                          {item.counselorName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {(item.expertise || []).join(", ") ||
                            "Tư vấn sinh viên"}
                        </p>
                        <p className="mt-2 text-gray-700">{item.topic}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDateTime(item.preferredDate)} -{" "}
                          {formatDuration(item.durationMinutes)} -{" "}
                          {item.meetingType === "online"
                            ? "Online"
                            : "Trực tiếp"}
                        </p>
                        {item.note && (
                          <p className="mt-1 text-sm text-gray-500">
                            Ghi chú: {item.note}
                          </p>
                        )}
                        {order.status === "COMPLETED" && (
                          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
                            <p className="mb-2 text-sm font-semibold text-blue-900">
                              Đánh giá tư vấn viên
                            </p>
                            {reviewsByIndex[index] && (
                              <p className="mb-2 text-xs text-blue-700">
                                Bạn đã đánh giá {reviewsByIndex[index].rating}
                                /5. Có thể cập nhật lại nếu cần.
                              </p>
                            )}
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_auto]">
                              <select
                                value={reviewDrafts[index]?.rating || 5}
                                onChange={(e) =>
                                  updateReviewDraft(
                                    index,
                                    "rating",
                                    e.target.value,
                                  )
                                }
                                className="rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              >
                                {[5, 4, 3, 2, 1].map((value) => (
                                  <option key={value} value={value}>
                                    {value} sao
                                  </option>
                                ))}
                              </select>
                              <input
                                value={reviewDrafts[index]?.comment || ""}
                                onChange={(e) =>
                                  updateReviewDraft(
                                    index,
                                    "comment",
                                    e.target.value,
                                  )
                                }
                                placeholder="Nhận xét ngắn sau buổi tư vấn"
                                className="rounded-lg border border-blue-200 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                              />
                              <button
                                type="button"
                                onClick={() => submitReview(index)}
                                disabled={reviewingIndex === index}
                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
                              >
                                {reviewingIndex === index
                                  ? "Đang lưu..."
                                  : "Lưu"}
                              </button>
                            </div>
                            {rewardsByIndex[index] && (
                              <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                                <span className="font-semibold">Phần thưởng đã nhận: </span>
                                {rewardsByIndex[index].message}
                                {rewardsByIndex[index].code && (
                                  <span className="ml-1 font-mono font-bold">
                                    ({rewardsByIndex[index].code})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-bold text-green-600">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Thanh toán
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Phương thức</span>
                  <span className="text-right font-semibold">
                    {order.paymentMethodLabel}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-600">Trạng thái tiền</span>
                  <span className="text-right font-semibold">
                    {order.paymentStatusLabel}
                  </span>
                </div>
                {order.paymentExpiresAt &&
                  ["PENDING", "EXPIRED"].includes(order.paymentStatus) && (
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-600">Hạn thanh toán</span>
                      <span className="text-right font-semibold">
                        {formatDateTime(order.paymentExpiresAt)}
                      </span>
                    </div>
                  )}
                {order.subtotal > 0 && order.subtotal !== order.total && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Tạm tính</span>
                    <span className="text-right">{formatCurrency(order.subtotal)}</span>
                  </div>
                )}
                {order.discountAmount > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">
                      Mã giảm giá{order.couponCode ? ` (${order.couponCode})` : ""}
                    </span>
                    <span className="text-right text-red-600">
                      -{formatCurrency(order.discountAmount)}
                    </span>
                  </div>
                )}
                {(order.loyaltyPointsApplied || order.pointsUsed) > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Điểm tích lũy dùng</span>
                    <span className="text-right text-red-600">
                      -{formatCurrency(order.loyaltyPointsApplied || order.pointsUsed)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Tổng cộng</span>
                    <span className="text-green-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
                {order.rewardInfo?.type && order.rewardInfo.type !== "none" && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                    <p className="font-semibold">Ưu đãi sau đánh giá</p>
                    <p className="mt-2">{order.rewardInfo.message}</p>
                    {order.rewardInfo.code && (
                      <p className="mt-2 font-semibold">
                        Mã giảm giá: {order.rewardInfo.code}
                      </p>
                    )}
                  </div>
                )}
              </div>
              {canRepay(order) && (
                <button
                  type="button"
                  onClick={payAgain}
                  disabled={paying}
                  className="mt-5 w-full rounded-lg bg-pink-600 px-4 py-3 font-semibold text-white hover:bg-pink-700 disabled:opacity-60"
                >
                  {paying ? "Đang tạo phiên..." : "Thanh toán lại qua MoMo"}
                </button>
              )}
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-2 text-xl font-bold text-gray-900">
                Chính sách hủy
              </h2>
              <p className="mb-4 text-sm text-gray-600">
                {order.cancelPolicy?.message}
              </p>
              <p className="mb-4 text-xs text-gray-500">
                Hạn hủy trực tiếp: {formatDateTime(order.cancelDeadlineAt)}
              </p>

              {order.cancelPolicy?.canCancel ? (
                <form onSubmit={submitCancel} className="space-y-3">
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {REASONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <textarea
                    rows="3"
                    value={reasonNote}
                    onChange={(e) => setReasonNote(e.target.value)}
                    placeholder="Bổ sung lý do để admin xử lý rõ hơn"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="submit"
                    disabled={
                      submitting ||
                      (reason === "Lý do khác" && reasonNote.trim().length < 6)
                    }
                    className="w-full rounded-lg bg-danger px-4 py-3 font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {submitting
                      ? "Đang xử lý..."
                      : order.cancelPolicy.mode === "REQUEST"
                        ? "Gửi yêu cầu hủy"
                        : "Hủy yêu cầu"}
                  </button>
                </form>
              ) : (
                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  Không thể gửi thao tác hủy ở trạng thái hiện tại.
                </div>
              )}
            </section>

            <section className="rounded-lg bg-white p-6 shadow">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Thông tin liên hệ
              </h2>
              <div className="space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Họ tên:</span>{" "}
                  {order.contactInfo?.fullName}
                </p>
                <p>
                  <span className="font-semibold">SĐT:</span>{" "}
                  {order.contactInfo?.phone}
                </p>
                {order.contactInfo?.email && (
                  <p>
                    <span className="font-semibold">Email:</span>{" "}
                    {order.contactInfo.email}
                  </p>
                )}
                {order.contactInfo?.studentCode && (
                  <p>
                    <span className="font-semibold">MSSV:</span>{" "}
                    {order.contactInfo.studentCode}
                  </p>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

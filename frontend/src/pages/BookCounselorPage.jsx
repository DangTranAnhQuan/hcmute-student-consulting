import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Spinner } from "../components/UI";
import AvailableSlotPicker from "../components/booking/AvailableSlotPicker";
import { consultationCartAPI, counselorAPI, userAPI } from "../services/api";
import { useAppSelector } from "../redux/hooks";
import { updateProfileSuccess } from "../redux/authSlice";
import {
  defaultPreferredDate,
  formatCurrency,
  formatDateTime,
  formatDuration,
} from "../utils/consultationFormat";

const fallbackImage =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=900&h=520&fit=crop";

const topicDescriptions = {
  Academic: "Kế hoạch học tập, đăng ký học phần, cảnh báo học vụ.",
  Career: "CV, thực tập, portfolio, phỏng vấn và định hướng nghề nghiệp.",
  "Mental Health": "Stress, lo âu, cân bằng học tập và cuộc sống.",
  "Personal Development":
    "Quản lý thời gian, làm việc nhóm, kỹ năng trình bày.",
  Financial: "Học bổng, miễn giảm học phí và quản lý chi phí sinh viên.",
};

const defaultTopic = (counselor) =>
  `Tư vấn ${counselor?.expertise?.[0] || "sinh viên"}`;

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

export default function BookCounselorPage() {
  const { counselorId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [counselor, setCounselor] = useState(null);
  const [form, setForm] = useState({
    topic: "",
    preferredDate: defaultPreferredDate(),
    meetingType: "online",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [similarCounselors, setSimilarCounselors] = useState([]);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsTotal, setReviewsTotal] = useState(0);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const { user } = useAppSelector((state) => state.auth);

  const isFavorite = useMemo(() => {
    const favoriteIds = (user?.favoriteCounselors || []).map(c =>
      typeof c === 'string' ? c : (c._id || c.id)
    );
    return favoriteIds.includes(String(counselorId));
  }, [user, counselorId]);

  useEffect(() => {
    const loadCounselor = async () => {
      try {
        setLoading(true);
        setError("");
        setSimilarCounselors([]);
        setReviews([]);
        setReviewsTotal(0);
        setReviewsPage(1);
        const response = await counselorAPI.detail(counselorId);
        const counselorData = response.data;
        setCounselor(counselorData);
        setForm((current) => ({
          ...current,
          topic: current.topic || defaultTopic(counselorData),
        }));

        if (user) {
          userAPI.markViewedCounselor(counselorId).catch(() => {});
        }

        const [similarResult, reviewsResult] = await Promise.allSettled([
          counselorAPI.similar(counselorId),
          counselorAPI.reviews(counselorId, 1),
        ]);
        if (similarResult.status === "fulfilled") {
          setSimilarCounselors(similarResult.value.data);
        }
        if (reviewsResult.status === "fulfilled") {
          setReviews(reviewsResult.value.data.reviews || []);
          setReviewsTotal(reviewsResult.value.data.total || 0);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được tư vấn viên");
      } finally {
        setLoading(false);
      }
    };

    loadCounselor();
  }, [counselorId, user?.id || user?._id]);

  const loadMoreReviews = async () => {
    try {
      setReviewsLoading(true);
      const nextPage = reviewsPage + 1;
      const res = await counselorAPI.reviews(counselorId, nextPage);
      setReviews((prev) => [...prev, ...(res.data.reviews || [])]);
      setReviewsPage(nextPage);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải thêm được bình luận");
    } finally {
      setReviewsLoading(false);
    }
  };

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleFavoriteCounselor = async () => {
    if (!counselorId || !user) return;
    try {
      setFavoriteLoading(true);
      let res;
      if (isFavorite) {
        res = await userAPI.removeFavoriteCounselor(counselorId);
      } else {
        res = await userAPI.addFavoriteCounselor(counselorId);
      }

      if (res.data.user) {
        dispatch(updateProfileSuccess(res.data.user));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Không cập nhật được tư vấn viên yêu thích",
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  const slotDuration = counselor?.availability?.slotDuration || 60;
  const counselorStatusClass =
    counselor?.currentStatus === "busy"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : counselor?.currentStatus === "inactive"
        ? "border-gray-200 bg-gray-50 text-gray-700"
        : "border-green-200 bg-green-50 text-green-700";

  const addToCart = async (event) => {
    event.preventDefault();
    if (!form.topic.trim()) {
      setError("Vui lòng nhập chủ đề cần tư vấn");
      return;
    }
    if (!form.preferredDate) {
      setError("Vui lòng chọn một slot tư vấn còn trống");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await consultationCartAPI.addItem({
        counselorId: counselor._id,
        topic: form.topic,
        preferredDate: new Date(form.preferredDate).toISOString(),
        meetingType: form.meetingType,
        note: form.note,
      });
      navigate("/consultation-cart");
    } catch (err) {
      setError(err.response?.data?.message || "Không thêm được vào giỏ tư vấn");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-lg bg-white p-8 text-center shadow">
            <p className="text-gray-700">Không tìm thấy tư vấn viên.</p>
            <Link
              to="/book-counselor"
              className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2 font-semibold text-white"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <Link
          to="/book-counselor"
          className="text-primary hover:text-primary-dark"
        >
          ← Quay lại danh sách tư vấn viên
        </Link>

        {error && (
          <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <section className="overflow-hidden rounded-lg bg-white shadow lg:col-span-1">
            <img
              src={counselor.image || fallbackImage}
              alt={counselor.fullName}
              onError={handleImageError}
              className="h-64 w-full object-cover"
            />
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {counselor.fullName}
                  </h1>
                  <p className="mt-2 text-gray-600">Tư vấn viên HCMUTE</p>
                </div>
                <button
                  type="button"
                  onClick={toggleFavoriteCounselor}
                  disabled={favoriteLoading}
                  title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition ${
                    isFavorite
                      ? "border-red-200 bg-red-500 text-white"
                      : "border-gray-200 bg-white text-gray-400 hover:border-red-200 hover:text-red-500"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                >
                  <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${counselorStatusClass}`}
                >
                  {counselor.currentStatusLabel || "Đang rảnh"}
                </span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {Number(counselor.totalBookings || 0)} lượt đặt
                </span>
                <span className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                  {Number(counselor.rating || 0).toFixed(1)}/5 ·{" "}
                  {Number(counselor.reviewCount || 0)} đánh giá
                </span>
              </div>
              {counselor.nextBookingAt && (
                <p className="mt-3 text-sm text-gray-500">
                  Lịch gần nhất: {formatDateTime(counselor.nextBookingAt)}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {(counselor.expertise || []).map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-primary"
                  >
                    {item}
                  </span>
                ))}
              </div>
              {counselor.bio && (
                <p className="mt-4 text-sm leading-6 text-gray-700">
                  {counselor.bio}
                </p>
              )}
              <div className="mt-5 rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Đơn giá theo giờ</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(counselor.hourlyRate || 0)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Mỗi buổi {formatDuration(slotDuration)}; online và trực tiếp
                  cùng giá.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-lg bg-white p-6 shadow lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900">
              Thêm vào giỏ tư vấn
            </h2>
            <p className="mt-2 text-gray-600">
              Sau bước này, bạn có thể chọn một hoặc nhiều mục trong giỏ để
              thanh toán COD hoặc MoMo.
            </p>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(counselor.expertise || []).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => updateForm("topic", `Tư vấn ${item}`)}
                  className="rounded-lg border border-gray-200 p-4 text-left hover:border-primary hover:bg-blue-50"
                >
                  <p className="font-semibold text-gray-900">{item}</p>
                  <p className="mt-1 text-sm text-gray-600">
                    {topicDescriptions[item] ||
                      "Tư vấn theo nhu cầu sinh viên."}
                  </p>
                </button>
              ))}
            </div>

            <form onSubmit={addToCart} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Chủ đề cần tư vấn
                </label>
                <input
                  required
                  value={form.topic}
                  onChange={(event) => updateForm("topic", event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <AvailableSlotPicker
                  counselorId={counselor._id}
                  value={form.preferredDate}
                  onChange={(value) => updateForm("preferredDate", value)}
                />
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Hình thức
                  </label>
                  <select
                    value={form.meetingType}
                    onChange={(event) =>
                      updateForm("meetingType", event.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="online">Online</option>
                    <option value="in-person">Trực tiếp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ghi chú
                </label>
                <textarea
                  rows="4"
                  value={form.note}
                  onChange={(event) => updateForm("note", event.target.value)}
                  placeholder="Mô tả ngắn vấn đề, tài liệu cần chuẩn bị hoặc thời gian có thể linh hoạt"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
                Thời lượng dự kiến là {formatDuration(slotDuration)}. Giá được
                tính theo đơn giá giờ của tư vấn viên; online và trực tiếp hiện
                không phụ thu. COD được thu khi yêu cầu hoàn tất, MoMo phải
                thanh toán thành công trước khi admin xác nhận và xử lý yêu cầu.
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang thêm..." : "Thêm vào giỏ tư vấn"}
              </button>
            </form>
          </section>
        </div>

        <div className="mx-auto mt-8 max-w-6xl px-4">
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900">
                Đánh giá từ sinh viên
              </h2>
              <span className="text-sm text-gray-500">
                {reviewsTotal} bình luận có nội dung
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                Chưa có bình luận nào. Hãy là người đầu tiên đánh giá sau khi hoàn tất tư vấn!
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <li key={review._id} className="py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {(review.reviewer || "S")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {review.reviewer}
                          </span>
                          <span className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={star <= review.rating ? "text-yellow-400" : "text-gray-200"}
                              >
                                ★
                              </span>
                            ))}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {reviews.length < reviewsTotal && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={loadMoreReviews}
                  disabled={reviewsLoading}
                  className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {reviewsLoading ? "Đang tải..." : `Xem thêm (${reviewsTotal - reviews.length} bình luận)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {similarCounselors.length > 0 && (
          <div className="mx-auto mt-8 max-w-6xl px-4">
            <div className="rounded-lg bg-white p-6 shadow">
              <h2 className="text-2xl font-bold text-gray-900">
                Tư vấn viên tương tự bạn có thể quan tâm
              </h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {similarCounselors.map((item) => (
                  <Link
                    key={item._id}
                    to={`/book-counselor/${item._id}`}
                    className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <img
                      src={item.image || fallbackImage}
                      alt={item.fullName}
                      onError={handleImageError}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.fullName}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">
                        {item.expertise?.slice(0, 2).join(" · ")}
                      </p>
                      <p className="mt-3 text-sm font-semibold text-green-600">
                        {formatCurrency(item.hourlyRate || 0)} / giờ
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

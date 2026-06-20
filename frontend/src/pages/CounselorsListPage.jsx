import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../components/UI";
import AvailableSlotPicker from "../components/booking/AvailableSlotPicker";
import { consultationCartAPI, counselorAPI, userAPI } from "../services/api";
import { useAuth } from "../redux/hooks";
import {
  defaultPreferredDate,
  formatCurrency,
  formatDateTime,
  formatDuration,
} from "../utils/consultationFormat";

const defaultTopic = (counselor) =>
  `Tư vấn ${counselor.expertise?.[0] || "sinh viên"}`;

const fallbackImage =
  "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=720&h=520&fit=crop";
const PAGE_SIZE = 4;

const topicCards = [
  {
    key: "Academic",
    title: "Học vụ",
    description: "Đăng ký học phần, cảnh báo học vụ, kế hoạch tín chỉ.",
    image:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=720&h=520&fit=crop",
  },
  {
    key: "Career",
    title: "Nghề nghiệp",
    description: "CV, portfolio, thực tập, phỏng vấn và định hướng công việc.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=720&h=520&fit=crop",
  },
  {
    key: "Mental Health",
    title: "Tâm lý",
    description: "Stress, áp lực thi cử, cân bằng học tập và cuộc sống.",
    image:
      "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=720&h=520&fit=crop",
  },
  {
    key: "Personal Development",
    title: "Kỹ năng cá nhân",
    description: "Quản lý thời gian, làm việc nhóm, thuyết trình, đồ án.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=520&fit=crop",
  },
  {
    key: "Financial",
    title: "Tài chính",
    description: "Học bổng, miễn giảm học phí và quản lý chi phí sinh viên.",
    image:
      "https://images.unsplash.com/photo-1559526324-593bc073d938?w=720&h=520&fit=crop",
  },
];

const imageForCounselor = (counselor) => {
  if (counselor.image) return counselor.image;
  const matched = topicCards.find((topic) =>
    (counselor.expertise || []).includes(topic.key),
  );
  return matched?.image || fallbackImage;
};

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

export default function CounselorsListPage() {
  const { user, getProfile } = useAuth();
  const [counselors, setCounselors] = useState([]);
  const [filterExpertise, setFilterExpertise] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("compact");
  const [page, setPage] = useState(1);
  const [expandedCards, setExpandedCards] = useState({});
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const favoriteCounselorIds = useMemo(() =>
    (user?.favoriteCounselors || []).map(c => typeof c === 'string' ? c : c._id)
  , [user]);

  const toggleFavorite = async (id, e) => {
    e.preventDefault();
    if (!user) return;
    try {
      if (favoriteCounselorIds.includes(id)) {
        await userAPI.removeFavoriteCounselor(id);
      } else {
        await userAPI.addFavoriteCounselor(id);
      }
      await getProfile(); // Sync Redux state
    } catch (err) {
      console.error("Toggle favorite failed", err);
    }
  };

  useEffect(() => {
    const loadCounselors = async () => {
      try {
        setLoading(true);
        const response = await counselorAPI.list();
        setCounselors(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Không tải được danh sách tư vấn viên");
      } finally {
        setLoading(false);
      }
    };

    loadCounselors();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterExpertise, searchTerm]);

  const filteredCounselors = useMemo(
    () =>
      counselors.filter((counselor) => {
        const name = counselor.fullName || "";
        const keyword = searchTerm.toLowerCase();
        const searchable = [
          name,
          counselor.bio || "",
          ...(counselor.expertise || []),
        ]
          .join(" ")
          .toLowerCase();
        const matchesSearch = searchable.includes(keyword);
        const matchesExpertise =
          filterExpertise === "all" ||
          (counselor.expertise || []).includes(filterExpertise);
        return matchesSearch && matchesExpertise;
      }),
    [counselors, filterExpertise, searchTerm],
  );

  const uniqueExpertise = useMemo(
    () => [...new Set(counselors.flatMap((c) => c.expertise || []))],
    [counselors],
  );

  const totalPages = Math.max(1, Math.ceil(filteredCounselors.length / PAGE_SIZE));
  const paginatedCounselors = useMemo(
    () =>
      filteredCounselors.slice(
        (page - 1) * PAGE_SIZE,
        page * PAGE_SIZE,
      ),
    [filteredCounselors, page],
  );
  const rangeStart =
    filteredCounselors.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filteredCounselors.length);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const getDraft = (counselor) => ({
    topic: defaultTopic(counselor),
    preferredDate: defaultPreferredDate(),
    meetingType: "online",
    note: "",
    ...(drafts[counselor._id] || {}),
  });

  const getSlotDuration = (counselor) =>
    counselor.availability?.slotDuration || 60;

  const updateDraft = (counselorId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [counselorId]: {
        ...(current[counselorId] || {}),
        [field]: value,
      },
    }));
  };

  const toggleQuickBooking = (counselorId) => {
    setExpandedCards((current) => ({
      ...current,
      [counselorId]: !current[counselorId],
    }));
  };

  const addToCart = async (counselor) => {
    const draft = getDraft(counselor);
    if (!draft.preferredDate) {
      setError("Vui lòng chọn một slot tư vấn còn trống");
      return;
    }
    try {
      setSavingId(counselor._id);
      setError("");
      setSuccess("");
      await consultationCartAPI.addItem({
        counselorId: counselor._id,
        topic: draft.topic,
        preferredDate: new Date(draft.preferredDate).toISOString(),
        meetingType: draft.meetingType,
        note: draft.note,
      });
      setSuccess(`Đã thêm ${counselor.fullName} vào giỏ tư vấn`);
    } catch (err) {
      setError(err.response?.data?.message || "Không thêm được vào giỏ tư vấn");
    } finally {
      setSavingId("");
    }
  };

  const renderRating = (rating = 0) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <span
          key={index}
          className={`text-lg ${
            index < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      ))}
      <span className="text-sm text-gray-600 ml-1">({Number(rating).toFixed(1)})</span>
    </div>
  );

  const statusClass = (status) =>
    status === "busy"
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : status === "inactive"
        ? "border-gray-200 bg-gray-50 text-gray-700"
        : "border-green-200 bg-green-50 text-green-700";

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Danh sách tư vấn viên
            </h1>
            <p className="text-gray-600">
              Chọn tư vấn viên, thời gian mong muốn và thêm từng mục vào giỏ tư vấn.
            </p>
          </div>
          <Link
            to="/consultation-cart"
            className="inline-flex justify-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
          >
            Xem giỏ tư vấn
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm tư vấn viên
              </label>
              <input
                type="text"
                placeholder="Nhập tên tư vấn viên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên môn
              </label>
              <select
                value={filterExpertise}
                onChange={(e) => setFilterExpertise(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả chuyên môn</option>
                {uniqueExpertise.map((expertise) => (
                  <option key={expertise} value={expertise}>
                    {expertise}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chế độ hiển thị
              </label>
              <div className="grid grid-cols-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
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
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-green-700">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <span>{success}</span>
              <Link
                to="/consultation-cart"
                className="inline-flex justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Mở giỏ tư vấn
              </Link>
            </div>
          </div>
        )}

        <section className="mb-6">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chọn chủ đề tư vấn
              </h2>
              <p className="text-gray-600">
                Chọn đúng nhóm vấn đề để lọc tư vấn viên phù hợp trước khi thêm vào giỏ.
              </p>
            </div>
            {filterExpertise !== "all" && (
              <button
                type="button"
                onClick={() => setFilterExpertise("all")}
                className="text-sm font-semibold text-primary hover:text-primary-dark"
              >
                Xem tất cả
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            {topicCards.map((topic) => {
              const active = filterExpertise === topic.key;
              return (
                <button
                  key={topic.key}
                  type="button"
                  onClick={() =>
                    setFilterExpertise((current) =>
                      current === topic.key ? "all" : topic.key,
                    )
                  }
                  className={`overflow-hidden rounded-lg border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    active ? "border-primary ring-2 ring-primary/20" : "border-gray-100"
                  }`}
                >
                  <img
                    src={topic.image}
                    alt={topic.title}
                    onError={handleImageError}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-4">
                    <p className="font-bold text-gray-900">{topic.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                      {topic.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {filteredCounselors.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg">
              Không tìm thấy tư vấn viên phù hợp
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {rangeStart}-{rangeEnd}
                </span>{" "}
                trong{" "}
                <span className="font-semibold text-gray-900">
                  {filteredCounselors.length}
                </span>{" "}
                tư vấn viên
              </p>
              {totalPages > 1 && (
                <p className="text-sm text-gray-500">
                  Trang {page}/{totalPages}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {paginatedCounselors.map((counselor) => {
              const draft = getDraft(counselor);
              const showBookingForm =
                viewMode === "expanded" || expandedCards[counselor._id];
              return (
                <div
                  key={counselor._id}
                  className="bg-white rounded-lg shadow-md border border-gray-100 p-6"
                >
                  <div
                    className={`flex flex-col gap-5 ${
                      showBookingForm ? "md:flex-row" : ""
                    }`}
                  >
                    <div className={showBookingForm ? "md:w-2/5" : "w-full"}>
                      <div className="relative group">
                        <button
                          onClick={(e) => toggleFavorite(counselor._id, e)}
                          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full backdrop-blur-md transition ${
                            favoriteCounselorIds.includes(counselor._id)
                              ? "bg-red-500 text-white"
                              : "bg-white/30 text-white hover:bg-white/50"
                          }`}
                        >
                          <svg className="w-4 h-4" fill={favoriteCounselorIds.includes(counselor._id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                        <img
                          src={imageForCounselor(counselor)}
                          alt={counselor.fullName}
                          onError={handleImageError}
                          className="mb-4 h-44 w-full rounded-lg object-cover"
                        />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {counselor.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        Tư vấn viên HCMUTE
                      </p>
                      <div className="mb-3">{renderRating(counselor.rating || 0)}</div>
                      <div className="mb-3 flex flex-wrap gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(counselor.currentStatus)}`}
                        >
                          {counselor.currentStatusLabel || "Đang rảnh"}
                        </span>
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {Number(counselor.totalBookings || 0)} lượt đặt
                        </span>
                      </div>
                      {counselor.nextBookingAt && (
                        <p className="mb-3 text-xs text-gray-500">
                          Lịch gần nhất: {formatDateTime(counselor.nextBookingAt)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(counselor.expertise || []).length > 0 ? (
                          counselor.expertise.map((exp) => (
                            <span
                              key={exp}
                              className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                            >
                              {exp}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">
                            Chưa có chuyên môn
                          </span>
                        )}
                      </div>
                      {counselor.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {counselor.bio}
                        </p>
                      )}
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm text-gray-600">Đơn giá theo giờ</p>
                        <p className="text-lg font-bold text-green-600">
                          {formatCurrency(counselor.hourlyRate || 0)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Mỗi buổi {formatDuration(getSlotDuration(counselor))};
                          online và trực tiếp cùng giá.
                        </p>
                      </div>
                      <div
                        className={
                          showBookingForm
                            ? "mt-3 flex flex-col gap-2"
                            : "mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2"
                        }
                      >
                        <Link
                          to={`/book-counselor/${counselor._id}`}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary"
                        >
                          Xem chi tiết
                        </Link>
                        {viewMode === "compact" && (
                          <button
                            type="button"
                            onClick={() => toggleQuickBooking(counselor._id)}
                            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                          >
                            {showBookingForm ? "Thu gọn" : "Đặt nhanh"}
                          </button>
                        )}
                      </div>
                    </div>

                    {showBookingForm && (
                    <div className="space-y-4 md:w-3/5 md:border-l md:border-gray-100 md:pl-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chủ đề cần tư vấn
                        </label>
                        <input
                          value={draft.topic}
                          onChange={(e) =>
                            updateDraft(counselor._id, "topic", e.target.value)
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <AvailableSlotPicker
                          counselorId={counselor._id}
                          value={draft.preferredDate}
                          onChange={(value) =>
                            updateDraft(counselor._id, "preferredDate", value)
                          }
                          variant="compact"
                        />
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Hình thức
                          </label>
                          <select
                            value={draft.meetingType}
                            onChange={(e) =>
                              updateDraft(counselor._id, "meetingType", e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          >
                            <option value="online">Online</option>
                            <option value="in-person">Trực tiếp</option>
                          </select>
                        </div>
                      </div>

                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
                        Thời lượng dự kiến:{" "}
                        <span className="font-semibold">
                          {formatDuration(getSlotDuration(counselor))}
                        </span>
                        . Giá được tính theo đơn giá giờ của tư vấn viên; hình thức
                        online/trực tiếp hiện không phụ thu.
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ghi chú
                        </label>
                        <textarea
                          value={draft.note}
                          onChange={(e) =>
                            updateDraft(counselor._id, "note", e.target.value)
                          }
                          rows="3"
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="Mô tả ngắn vấn đề cần hỗ trợ"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(counselor)}
                        disabled={savingId === counselor._id}
                        className="w-full rounded-lg bg-primary px-4 py-2.5 font-semibold text-white hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {savingId === counselor._id
                          ? "Đang thêm..."
                          : "Thêm vào giỏ tư vấn"}
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col gap-3 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
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
          </>
        )}

        <p className="mt-8 text-center text-sm text-gray-600">
          Tổng cộng <span className="font-bold">{filteredCounselors.length}</span>{" "}
          tư vấn viên{filterExpertise !== "all" && ` (${filterExpertise})`}
        </p>
      </div>
    </div>
  );
}

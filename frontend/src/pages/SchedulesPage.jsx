import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserBookings, cancelBooking } from "../redux/scheduleSlice";
import { useAuth } from "../redux/hooks";

const statusLabels = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const meetingTypeLabels = {
  online: "Online",
  "in-person": "Trực tiếp",
};

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "upcoming", label: "Sắp tới" },
  { value: "past", label: "Đã qua" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Đã hủy" },
];

const sortOptions = [
  { value: "dateAsc", label: "Gần nhất trước" },
  { value: "dateDesc", label: "Mới tạo sau" },
  { value: "status", label: "Trạng thái" },
];

const formatDate = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));

const formatDay = (value) =>
  new Intl.DateTimeFormat("vi-VN", { day: "2-digit" }).format(new Date(value));

const formatMonth = (value) =>
  new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(new Date(value));

const formatTime = (value) =>
  new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const getStatusBadgeClass = (status) => {
  const statusStyles = {
    confirmed: "border-green-200 bg-green-50 text-green-700",
    pending: "border-amber-200 bg-amber-50 text-amber-700",
    completed: "border-blue-200 bg-blue-50 text-blue-700",
    cancelled: "border-red-200 bg-red-50 text-red-700",
  };
  return statusStyles[status] || "border-gray-200 bg-gray-50 text-gray-700";
};

const getScheduleAccentClass = (status) => {
  const accents = {
    confirmed: "border-l-green-500",
    pending: "border-l-amber-500",
    completed: "border-l-blue-500",
    cancelled: "border-l-red-500",
  };
  return accents[status] || "border-l-gray-300";
};

export default function SchedulesPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("dateAsc");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [cancelingBookingId, setCancelingBookingId] = useState(null);

  const { bookings, loading, error } = useSelector((state) => state.schedule);

  useEffect(() => {
    if (user?._id) {
      dispatch(getUserBookings(user._id));
    }
  }, [user, dispatch]);

  const nowTime = Date.now();
  const stats = {
    total: bookings.length,
    upcoming: bookings.filter(
      (booking) =>
        new Date(booking.startTime).getTime() > nowTime &&
        !["cancelled", "completed"].includes(booking.status),
    ).length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };

  const filteredBookings = bookings.filter((booking) => {
    const startTime = new Date(booking.startTime).getTime();
    if (filter === "upcoming") {
      return (
        startTime > nowTime &&
        !["cancelled", "completed"].includes(booking.status)
      );
    }
    if (filter === "past") {
      return startTime < nowTime || booking.status === "completed";
    }
    if (filter === "all") {
      return true;
    }
    return booking.status === filter;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === "dateAsc") {
      return new Date(a.startTime) - new Date(b.startTime);
    }
    if (sortBy === "dateDesc") {
      return new Date(b.startTime) - new Date(a.startTime);
    }
    return (statusLabels[a.status] || a.status || "").localeCompare(
      statusLabels[b.status] || b.status || "",
      "vi",
    );
  });

  const cancelingBooking = bookings.find(
    (booking) => booking._id === cancelingBookingId,
  );

  const handleCancelClick = (bookingId) => {
    setCancelingBookingId(bookingId);
    setShowConfirmModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelingBookingId) return;

    await dispatch(
      cancelBooking({
        bookingId: cancelingBookingId,
        reason: "Người dùng yêu cầu hủy lịch",
      }),
    );
    setShowConfirmModal(false);
    setCancelingBookingId(null);
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
    setCancelingBookingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lịch tư vấn của tôi
            </h1>
            <p className="mt-2 text-gray-600">
              Theo dõi lịch đã đặt, trạng thái xử lý và thông tin buổi tư vấn.
            </p>
          </div>
          <Link
            to="/book-counselor"
            className="inline-flex justify-center rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
          >
            Đặt lịch mới
          </Link>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Tổng lịch</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-green-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Sắp tới</p>
            <p className="mt-2 text-3xl font-bold text-green-600">
              {stats.upcoming}
            </p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Chờ xác nhận</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">Hoàn thành</p>
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {stats.completed}
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Bộ lọc
              </label>
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFilter(option.value)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold ${
                      filter === option.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-32 animate-pulse rounded-lg bg-white shadow-sm"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : sortedBookings.length === 0 ? (
          <div className="rounded-lg bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Chưa có lịch tư vấn phù hợp
            </h2>
            <p className="mt-2 text-gray-600">
              Thử đổi bộ lọc hoặc đặt một lịch tư vấn mới.
            </p>
            <Link
              to="/book-counselor"
              className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 font-semibold text-white hover:bg-primary-dark"
            >
              Chọn tư vấn viên
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedBookings.map((booking) => {
              const canCancel =
                !["cancelled", "completed"].includes(booking.status) &&
                new Date(booking.startTime) > new Date();
              const counselorName =
                booking.counselorId?.fullName || "Tư vấn viên";

              return (
                <article
                  key={booking._id}
                  className={`rounded-lg border border-gray-100 border-l-4 bg-white p-5 shadow-sm ${getScheduleAccentClass(
                    booking.status,
                  )}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex gap-4">
                      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-center">
                        <span className="text-2xl font-bold text-gray-900">
                          {formatDay(booking.startTime)}
                        </span>
                        <span className="text-xs font-semibold uppercase text-gray-500">
                          {formatMonth(booking.startTime)}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-bold text-gray-900">
                            {booking.title || "Lịch tư vấn"}
                          </h2>
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadgeClass(
                              booking.status,
                            )}`}
                          >
                            {statusLabels[booking.status] || booking.status}
                          </span>
                        </div>
                        {booking.description && (
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {booking.description}
                          </p>
                        )}

                        <div className="mt-4 grid grid-cols-1 gap-3 text-sm text-gray-700 sm:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Tư vấn viên
                            </p>
                            <p className="font-semibold text-gray-900">
                              {counselorName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Ngày
                            </p>
                            <p className="font-semibold text-gray-900">
                              {formatDate(booking.startTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Giờ
                            </p>
                            <p className="font-semibold text-gray-900">
                              {formatTime(booking.startTime)} -{" "}
                              {formatTime(booking.endTime)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold uppercase text-gray-400">
                              Hình thức
                            </p>
                            <p className="font-semibold text-gray-900">
                              {meetingTypeLabels[booking.meetingType] ||
                                booking.meetingType ||
                                "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      {booking.meetingType === "online" && booking.meetingLink && (
                        <a
                          href={booking.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary hover:bg-blue-50"
                        >
                          Vào phòng tư vấn
                        </a>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          onClick={() => handleCancelClick(booking._id)}
                          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Hủy lịch
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900">
                Hủy lịch tư vấn
              </h2>
              <p className="mt-3 text-gray-600">
                Bạn có chắc muốn hủy lịch{" "}
                <span className="font-semibold text-gray-900">
                  {cancelingBooking?.title || "tư vấn"}
                </span>{" "}
                không? Trạng thái lịch sẽ được cập nhật thành đã hủy.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-gray-300 px-4 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Giữ lịch
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="rounded-lg bg-red-600 px-4 py-2.5 font-semibold text-white hover:bg-red-700"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

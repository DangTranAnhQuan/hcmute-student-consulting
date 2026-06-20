import React from "react";
import { useRealtimeNotifications } from "../context/RealtimeNotificationContext";
import { Badge } from "../components/common/CommonUI";

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "";

const NotificationsPage = () => {
  const {
    notifications,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refresh,
  } = useRealtimeNotifications();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Realtime
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950">
            Trung tâm thông báo
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Xem thông báo mới từ đơn tư vấn, bài viết, sự kiện và đánh giá.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={refresh}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-700"
          >
            Làm mới
          </button>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Đánh dấu đã đọc
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          Đang tải thông báo...
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600 shadow-sm">
          Chưa có thông báo nào.
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 shadow-sm transition ${
                item.isRead
                  ? "border-slate-200 bg-white"
                  : "border-blue-200 bg-blue-50"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-950">
                      {item.title}
                    </h2>
                    {!item.isRead && (
                      <Badge variant="primary" size="sm">
                        Mới
                      </Badge>
                    )}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.message}
                  </p>
                  {item.link && (
                    <a
                      href={item.link}
                      className="mt-3 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
                    >
                      Mở nội dung
                    </a>
                  )}
                  <p className="mt-3 text-xs text-slate-500">
                    {formatDateTime(item.createdAt)} · {item.type}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => markRead(item.id)}
                  disabled={item.isRead}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {item.isRead ? "Đã đọc" : "Đánh dấu đã đọc"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

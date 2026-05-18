import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { markAsRead, clearNotification } from "../../redux/dashboardSlice";
import { Badge } from "../common/CommonUI";

export const NotificationWidget = () => {
  const dispatch = useDispatch();
  const { notifications } = useSelector((state) => state.dashboard);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const TypeIcons = {
    info: "ℹ️",
    success: "✓",
    warning: "⚠️",
    error: "✕",
  };

  const handleRead = (id) => {
    dispatch(markAsRead(id));
  };

  const handleClear = (id) => {
    dispatch(clearNotification(id));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Vừa xong";
    if (hours < 24) return `${hours}h trước`;
    if (days < 7) return `${days}d trước`;
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">📬 Thông Báo</h2>
        {unreadCount > 0 && (
          <Badge variant="danger" size="sm">
            {unreadCount} mới
          </Badge>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Không có thông báo</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-3 rounded-lg border-l-4 flex items-start justify-between gap-3 cursor-pointer transition hover:bg-gray-50 ${
                notif.type === "info"
                  ? "border-blue-500 bg-blue-50"
                  : notif.type === "success"
                    ? "border-green-500 bg-green-50"
                    : notif.type === "warning"
                      ? "border-yellow-500 bg-yellow-50"
                      : "border-red-500 bg-red-50"
              }`}
              onClick={() => handleRead(notif.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{TypeIcons[notif.type]}</span>
                  <p className="font-semibold text-gray-900">{notif.title}</p>
                  {!notif.read && <div className="w-2 h-2 bg-primary rounded-full ml-1"></div>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                <p className="text-xs text-gray-500 mt-1">{formatTime(notif.timestamp)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear(notif.id);
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <a href="/notifications" className="text-primary hover:text-primary-dark text-sm mt-4 block">
        Xem tất cả thông báo →
      </a>
    </div>
  );
};

export const NewsWidget = () => {
  const { featuredNews } = useSelector((state) => state.dashboard);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">📰 Tin Tức Nổi Bật</h2>
        <a href="/news" className="text-primary hover:text-primary-dark text-sm">
          Xem tất cả
        </a>
      </div>

      <div className="space-y-3">
        {featuredNews.map((news) => (
          <a
            key={news.id}
            href={`/detail/news/${news.id}`}
            className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition group"
          >
            <img
              src={news.image}
              alt={news.title}
              className="w-16 h-16 rounded object-cover group-hover:opacity-80 transition"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900 group-hover:text-primary transition">
                {news.title}
              </p>
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{news.excerpt}</p>
              <div className="flex justify-between items-center mt-2">
                <Badge variant="secondary" size="sm">
                  {news.category}
                </Badge>
                <span className="text-xs text-gray-500">👁️ {news.views}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export const ScheduleWidget = () => {
  const { schedules } = useSelector((state) => state.dashboard);

  const statusColors = {
    confirmed: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-800",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">📅 Lịch Tư Vấn Sắp Tới</h2>
        <a href="/schedules" className="text-primary hover:text-primary-dark text-sm">
          Quản lý
        </a>
      </div>

      {schedules.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Không có lịch hẹn</p>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{schedule.title}</p>
                  <p className="text-sm text-gray-600">👤 {schedule.counselor}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[schedule.status]}`}>
                  {schedule.status === "confirmed" ? "✓ Đã xác nhận" : "⏳ Chờ xác nhận"}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>
                  📍 {schedule.format} • 🕒 {schedule.time} • 📅 {formatDate(schedule.date)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <a
        href="/book-counselor"
        className="mt-4 w-full bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-semibold transition inline-block text-center"
      >
        + Đặt Lịch Tư Vấn
      </a>
    </div>
  );
};

export const ArticleWidget = () => {
  const { populerArticles } = useSelector((state) => state.dashboard);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">⭐ Bài Viết Nổi Bật</h2>
        <a href="/articles" className="text-primary hover:text-primary-dark text-sm">
          Xem tất cả
        </a>
      </div>

      <div className="space-y-3">
        {populerArticles.map((article) => (
          <a
            key={article.id}
            href={`/detail/article/${article.id}`}
            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition group block"
          >
            <div className="flex gap-3">
              <img
                src={article.image}
                alt={article.title}
                className="w-12 h-12 rounded object-cover group-hover:opacity-80 transition"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-primary transition line-clamp-1">
                  {article.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">Bởi {article.author}</p>
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{article.readTime}</span>
                  <span>💬 {article.views} lượt xem</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export const DocumentWidget = () => {
  const { documents } = useSelector((state) => state.dashboard);

  const getFileIcon = (type) => {
    const icons = {
      PDF: "📄",
      DOCX: "📝",
      XLS: "📊",
      PPT: "🎨",
      ZIP: "📦",
    };
    return icons[type] || "📎";
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">📚 Tài Liệu Hữu Ích</h2>
        <a href="/documents" className="text-primary hover:text-primary-dark text-sm">
          Thư viện
        </a>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <a
            key={doc.id}
            href={`/download/${doc.id}`}
            className="p-3 flex items-start gap-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition group"
          >
            <span className="text-2xl flex-shrink-0">{getFileIcon(doc.type)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 group-hover:text-primary transition line-clamp-1">
                {doc.name}
              </p>
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>{doc.size}</span>
                <span>⬇️ {doc.downloads}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export const EventWidget = () => {
  const { events } = useSelector((state) => state.dashboard);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">🎉 Sự Kiện Khoa / Trường</h2>
        <a href="/events" className="text-primary hover:text-primary-dark text-sm">
          Tất cả
        </a>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <a
            key={event.id}
            href={`/detail/event/${event.id}`}
            className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition block group"
          >
            <div className="flex gap-3">
              <img
                src={event.image}
                alt={event.title}
                className="w-20 h-20 rounded object-cover group-hover:opacity-80 transition"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-primary transition line-clamp-1">
                  {event.title}
                </p>
                <p className="text-xs text-gray-600 mt-1">{event.faculty}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>
                    📅 {formatDate(event.date)} • 🕒 {event.time}
                  </span>
                  <span>👥 {event.attendees}</span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default {
  NotificationWidget,
  NewsWidget,
  ScheduleWidget,
  ArticleWidget,
  DocumentWidget,
  EventWidget,
};


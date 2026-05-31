import React from "react";
import { Badge } from "../common/CommonUI";
import { contentAPI, consultationOrderAPI } from "../../services/api";

const fallbackImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&h=520&fit=crop";

const formatDate = (value) => {
  if (!value) return "Chưa có ngày";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const formatMoney = (value = 0) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const detailType = (item) =>
  item.contentType === "Event" ? "event" : item.contentType === "News" ? "news" : "article";

const getListData = (response) => response?.data?.data || [];

const handleImageError = (event) => {
  event.currentTarget.onerror = null;
  event.currentTarget.src = fallbackImage;
};

const paymentNeedsAction = (order) =>
  order.paymentMethod === "MOMO_SANDBOX" &&
  ["PENDING", "FAILED", "EXPIRED"].includes(order.paymentStatus);

const orderIsActive = (order) =>
  !["COMPLETED", "CANCELLED"].includes(order.status);

const orderStatusTone = (status) => {
  const tones = {
    NEW: "bg-blue-100 text-blue-800",
    CONFIRMED: "bg-indigo-100 text-indigo-800",
    PREPARING: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-purple-100 text-purple-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
    CANCEL_REQUESTED: "bg-orange-100 text-orange-800",
  };
  return tones[status] || "bg-gray-100 text-gray-700";
};

const EmptyState = ({ message }) => (
  <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5 text-center text-sm text-gray-600">
    {message}
  </div>
);

const LoadingState = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((item) => (
      <div key={item} className="h-20 animate-pulse rounded-lg bg-gray-100" />
    ))}
  </div>
);

export const NotificationWidget = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await consultationOrderAPI.list();
        setOrders(getListData(response));
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const notifications = React.useMemo(() => {
    if (orders.length === 0) {
      return [
        {
          id: "empty",
          tone: "info",
          title: "Chưa có yêu cầu tư vấn",
          message: "Sinh viên có thể chọn tư vấn viên, thêm vào giỏ và đặt yêu cầu mới.",
          time: null,
          href: "/book-counselor",
        },
      ];
    }

    return orders.slice(0, 5).map((order) => {
      if (paymentNeedsAction(order)) {
        return {
          id: order.id,
          tone: order.paymentStatus === "PENDING" ? "warning" : "error",
          title: `MoMo cần xử lý - ${order.orderCode}`,
          message:
            order.paymentStatus === "PENDING"
              ? "Phiên MoMo đang chờ thanh toán. Nếu đã thoát khỏi MoMo, vào chi tiết để thanh toán lại hoặc hủy yêu cầu."
              : `${order.paymentStatusLabel}. Có thể tạo lại phiên MoMo từ màn hình chi tiết.`,
          time: order.updatedAt || order.createdAt,
          href: `/consultation-orders/${order.id}`,
        };
      }

      if (order.status === "CANCEL_REQUESTED") {
        return {
          id: order.id,
          tone: "warning",
          title: `Yêu cầu hủy đang chờ duyệt - ${order.orderCode}`,
          message:
            "Yêu cầu đã sang bước chuẩn bị, nên sinh viên gửi yêu cầu hủy và chờ admin xác nhận.",
          time: order.cancelRequestedAt || order.updatedAt,
          href: `/consultation-orders/${order.id}`,
        };
      }

      return {
        id: order.id,
        tone: order.status === "COMPLETED" ? "success" : "info",
        title: `${order.statusLabel} - ${order.orderCode}`,
        message: `${order.items?.length || 0} dịch vụ, ${formatMoney(order.total)}. Thanh toán: ${order.paymentStatusLabel}.`,
        time: order.updatedAt || order.createdAt,
        href: `/consultation-orders/${order.id}`,
      };
    });
  }, [orders]);

  const actionCount = orders.filter(
    (order) => paymentNeedsAction(order) || order.status === "CANCEL_REQUESTED",
  ).length;

  const toneClass = {
    info: "border-blue-500 bg-blue-50",
    success: "border-green-500 bg-green-50",
    warning: "border-yellow-500 bg-yellow-50",
    error: "border-red-500 bg-red-50",
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Thông báo xử lý</h2>
        {actionCount > 0 && (
          <Badge variant="danger" size="sm">
            {actionCount} cần xử lý
          </Badge>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className={`block rounded-lg border-l-4 p-4 transition hover:shadow-sm ${toneClass[item.tone]}`}
            >
              <p className="font-semibold text-gray-900">{item.title}</p>
              <p className="mt-1 text-sm text-gray-700">{item.message}</p>
              {item.time && (
                <p className="mt-2 text-xs text-gray-500">
                  Cập nhật: {formatDateTime(item.time)}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const NewsWidget = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await contentAPI.list({
          contentType: "News",
          sortBy: "latest",
        });
        setItems(getListData(response).slice(0, 4));
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Tin tức nổi bật</h2>
        <a href="/news" className="text-sm text-primary hover:text-primary-dark">
          Xem tất cả
        </a>
      </div>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Chưa có tin tức được xuất bản." />
      ) : (
        <div className="space-y-3">
          {items.map((news) => (
            <a
              key={news.id}
              href={`/detail/${detailType(news)}/${news.id}`}
              className="group flex gap-3 rounded-lg p-3 transition hover:bg-gray-50"
            >
              <img
                src={news.image || fallbackImage}
                alt={news.title}
                onError={handleImageError}
                className="h-20 w-24 rounded object-cover transition group-hover:opacity-85"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-semibold text-gray-900 transition group-hover:text-primary">
                  {news.title}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-gray-600">{news.excerpt}</p>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>{news.topic}</span>
                  <span>{news.views} lượt xem</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const ScheduleWidget = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await consultationOrderAPI.list();
        setOrders(getListData(response).filter(orderIsActive).slice(0, 4));
      } catch (error) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Yêu cầu đang xử lý</h2>
        <a href="/consultation-orders" className="text-sm text-primary hover:text-primary-dark">
          Theo dõi
        </a>
      </div>

      {loading ? (
        <LoadingState />
      ) : orders.length === 0 ? (
        <EmptyState message="Chưa có yêu cầu tư vấn đang xử lý." />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const firstItem = order.items?.[0];
            return (
              <a
                key={order.id}
                href={`/consultation-orders/${order.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition hover:shadow-md"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{order.orderCode}</p>
                    <p className="mt-1 text-sm text-gray-600">
                      {firstItem?.topic || "Tư vấn sinh viên"}
                    </p>
                  </div>
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${orderStatusTone(order.status)}`}
                  >
                    {order.statusLabel}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Thanh toán: {order.paymentMethodLabel}</p>
                  <p>Số tiền: {formatMoney(order.total)}</p>
                  {firstItem?.preferredDate && (
                    <p>Lịch mong muốn: {formatDate(firstItem.preferredDate)}</p>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}

      <a
        href="/book-counselor"
        className="mt-4 inline-block w-full rounded-lg bg-primary px-4 py-2 text-center font-semibold text-white transition hover:bg-primary-dark"
      >
        Đặt tư vấn mới
      </a>
    </div>
  );
};

export const ArticleWidget = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadArticles = async () => {
      try {
        const response = await contentAPI.list({
          contentType: "Article",
          sortBy: "popular",
        });
        setItems(getListData(response).slice(0, 4));
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Bài viết nổi bật</h2>
        <a href="/articles" className="text-sm text-primary hover:text-primary-dark">
          Xem tất cả
        </a>
      </div>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Chưa có bài viết được xuất bản." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {items.map((article) => (
            <a
              key={article.id}
              href={`/detail/article/${article.id}`}
              className="group rounded-lg border border-gray-200 p-3 transition hover:shadow-md"
            >
              <div className="flex gap-3">
                <img
                  src={article.image || fallbackImage}
                  alt={article.title}
                  onError={handleImageError}
                  className="h-16 w-16 rounded object-cover transition group-hover:opacity-85"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-gray-900 transition group-hover:text-primary">
                    {article.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{article.topic}</p>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{article.readTime}</span>
                    <span>{article.views} lượt xem</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export const DocumentWidget = () => {
  const resources = [
    {
      id: "faq",
      title: "FAQ đặt tư vấn",
      description: "Câu hỏi về giỏ tư vấn, COD, MoMo và hủy yêu cầu.",
      href: "/faq",
    },
    {
      id: "search",
      title: "Tìm kiếm học vụ",
      description: "Tra cứu tin tức, bài viết, FAQ và nội dung tư vấn.",
      href: "/search",
    },
    {
      id: "forum",
      title: "Forum hỏi đáp",
      description: "Đặt câu hỏi và đánh dấu câu hỏi đã giải quyết khi có câu trả lời phù hợp.",
      href: "/forum",
    },
    {
      id: "orders",
      title: "Theo dõi yêu cầu",
      description: "Xem lịch sử đặt tư vấn, trạng thái xử lý và trạng thái thanh toán.",
      href: "/consultation-orders",
    },
  ];

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Lối tắt học vụ</h2>
        <a href="/search" className="text-sm text-primary hover:text-primary-dark">
          Tìm kiếm
        </a>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {resources.map((item) => (
          <a
            key={item.id}
            href={item.href}
            className="rounded-lg border border-gray-200 p-4 transition hover:border-primary hover:bg-blue-50"
          >
            <p className="font-semibold text-gray-900">{item.title}</p>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
};

export const EventWidget = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadEvents = async () => {
      try {
        const response = await contentAPI.list({
          contentType: "Event",
          sortBy: "latest",
        });
        setItems(getListData(response).slice(0, 3));
      } catch (error) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="rounded-lg bg-white p-6 shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Sự kiện khoa trường</h2>
        <a href="/news" className="text-sm text-primary hover:text-primary-dark">
          Tất cả
        </a>
      </div>

      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState message="Chưa có sự kiện được xuất bản." />
      ) : (
        <div className="space-y-3">
          {items.map((event) => (
            <a
              key={event.id}
              href={`/detail/event/${event.id}`}
              className="group block rounded-lg border border-gray-200 p-3 transition hover:shadow-md"
            >
              <div className="flex gap-3">
                <img
                  src={event.image || fallbackImage}
                  alt={event.title}
                  onError={handleImageError}
                  className="h-20 w-24 rounded object-cover transition group-hover:opacity-85"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 font-semibold text-gray-900 transition group-hover:text-primary">
                    {event.title}
                  </p>
                  <p className="mt-1 text-xs text-gray-600">{event.faculty}</p>
                  <div className="mt-2 text-xs text-gray-500">
                    {event.topic} · {formatDate(event.date)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

const dashboardWidgets = {
  NotificationWidget,
  NewsWidget,
  ScheduleWidget,
  ArticleWidget,
  DocumentWidget,
  EventWidget,
};

export default dashboardWidgets;

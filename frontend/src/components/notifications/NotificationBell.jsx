import React from "react";
import { Link } from "react-router-dom";
import { Badge } from "../common/CommonUI";
import { useRealtimeNotifications } from "../../context/RealtimeNotificationContext";

const NotificationBell = () => {
  const { unreadCount, connected } = useRealtimeNotifications();

  return (
    <Link
      to="/notifications"
      className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
      title={connected ? "Đã kết nối realtime" : "Đang chờ kết nối realtime"}
    >
      <span aria-hidden="true">🔔</span>
      <span className="hidden sm:inline">Thông báo</span>
      {unreadCount > 0 && (
        <span className="absolute -right-2 -top-2">
          <Badge variant="danger" size="sm">
            {unreadCount}
          </Badge>
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;

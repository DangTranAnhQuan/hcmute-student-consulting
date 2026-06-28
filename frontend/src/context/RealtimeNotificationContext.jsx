import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { notificationAPI } from "../services/api";
import { createNotificationSocket } from "../services/socket";

const RealtimeNotificationContext = createContext(null);

const normalizeNotification = (item) => ({
  ...item,
  id: item.id || item._id,
});

export const RealtimeNotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connected, setConnected] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const [listResponse, summaryResponse] = await Promise.all([
        notificationAPI.list({ page, limit: pagination.limit }),
        notificationAPI.summary(),
      ]);
      setNotifications(
        (listResponse.data.data || []).map(normalizeNotification),
      );
      setPagination(listResponse.data.pagination);
      setUnreadCount(summaryResponse.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, pagination.limit]);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const goToPage = useCallback((page) => {
    fetchNotifications(page);
  }, [fetchNotifications]);

  const refresh = useCallback(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const socket = createNotificationSocket({
      userId: user?.id || user?._id,
      role: user?.role,
    });

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("notification:new", (notification) => {
      const normalized = normalizeNotification(notification);
      setNotifications((current) => [normalized, ...current]);
      setUnreadCount((current) => current + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user]);

  const markRead = useCallback(async (notificationId) => {
    if (!notificationId) return;
    await notificationAPI.markRead(notificationId);
    setNotifications((current) =>
      current.map((item) =>
        item.id === notificationId ? { ...item, isRead: true } : item,
      ),
    );
    setUnreadCount((current) => Math.max(0, current - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationAPI.markAllRead();
    setNotifications((current) =>
      current.map((item) => ({ ...item, isRead: true })),
    );
    setUnreadCount(0);
  }, []);

  const unreadNotifications = useMemo(
    () => notifications.filter((item) => !item.isRead),
    [notifications],
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadNotifications,
      unreadCount,
      loading,
      pagination,
      connected,
      refresh,
      goToPage,
      markRead,
      markAllRead,
    }),
    [
      notifications,
      unreadNotifications,
      unreadCount,
      loading,
      pagination,
      connected,
      refresh,
      goToPage,
      markRead,
      markAllRead,
    ],
  );

  return (
    <RealtimeNotificationContext.Provider value={value}>
      {children}
    </RealtimeNotificationContext.Provider>
  );
};

export const useRealtimeNotifications = () => {
  const context = useContext(RealtimeNotificationContext);
  if (!context) {
    throw new Error("useRealtimeNotifications must be used within RealtimeNotificationProvider");
  }
  return context;
};

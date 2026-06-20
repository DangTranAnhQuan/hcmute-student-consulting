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
  const [connected, setConnected] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setLoading(true);
    try {
      const [listResponse, summaryResponse] = await Promise.all([
        notificationAPI.list(),
        notificationAPI.summary(),
      ]);
      setNotifications((listResponse.data.data || []).map(normalizeNotification));
      setUnreadCount(summaryResponse.data.unreadCount || 0);
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
      setNotifications((current) => [normalized, ...current].slice(0, 50));
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
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
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
      connected,
      refresh,
      markRead,
      markAllRead,
    }),
    [notifications, unreadNotifications, unreadCount, loading, connected, refresh, markRead, markAllRead],
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

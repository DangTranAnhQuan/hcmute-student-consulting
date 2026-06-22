import { io } from "socket.io-client";

const normalizeSocketUrl = (value) => {
  const input = String(value || "").trim();
  if (!input) return "http://localhost:3001";
  return input.replace(/\/api\/?$/, "").replace(/\/$/, "");
};

const SOCKET_URL = normalizeSocketUrl(
  process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_API_URL,
);

export const createNotificationSocket = ({ userId, role }) => {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: {
      userId,
      role,
    },
  });

  return socket;
};

export const createChatSocket = ({ token }) => {
  const socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    auth: {
      token,
    },
  });

  return socket;
};

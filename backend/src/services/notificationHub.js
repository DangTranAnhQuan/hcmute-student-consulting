const Notification = require("../models/Notification");

let io = null;

const setNotificationIO = (server) => {
  io = server;
};

const toPlain = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id?.toString?.() || value._id,
  };
};

const getRooms = (notification) => {
  const rooms = [];
  if (notification.recipientUserId) {
    rooms.push(`user:${notification.recipientUserId.toString()}`);
  }
  for (const role of notification.targetRoles || []) {
    rooms.push(`role:${role}`);
  }
  return rooms;
};

const emitNotification = (notification) => {
  if (!io || !notification) return;
  const payload = toPlain(notification);
  const rooms = getRooms(notification);

  if (rooms.length === 0) {
    io.emit("notification:new", payload);
    return;
  }

  rooms.forEach((room) => {
    io.to(room).emit("notification:new", payload);
  });
};

const createNotification = async (payload) => {
  const notification = await Notification.create(payload);
  emitNotification(notification);
  return notification;
};

const attachSocketHandlers = (socket) => {
  const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;
  const role = socket.handshake.auth?.role || socket.handshake.query?.role;

  if (userId) {
    socket.join(`user:${userId}`);
  }

  if (role) {
    socket.join(`role:${role}`);
  }

  socket.on("notification:join", (payload = {}) => {
    if (payload.userId) {
      socket.join(`user:${payload.userId}`);
    }
    if (payload.role) {
      socket.join(`role:${payload.role}`);
    }
  });
};

module.exports = {
  setNotificationIO,
  attachSocketHandlers,
  emitNotification,
  createNotification,
};
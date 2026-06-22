const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ChatMessage = require("../models/ChatMessage");

let io = null;

const setChatIO = (server) => {
  io = server;
};

const toPlain = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    ...value,
    id: value._id?.toString?.() || value._id,
    senderId: value.senderId?.toString?.() || value.senderId,
    receiverUserId: value.receiverUserId?.toString?.() || value.receiverUserId,
  };
};

const parseSocketUser = async (socket) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select("_id role");
    if (!user) return null;
    return {
      id: user._id.toString(),
      role: user.role,
    };
  } catch (err) {
    return null;
  }
};

const joinChatRooms = (socket, user) => {
  if (!user) return;
  socket.join(`user:${user.id}`);
  if (user.role === "admin") {
    socket.join("role:admin");
  }
};

const emitChatMessage = (message) => {
  if (!io || !message) return;
  const payload = toPlain(message);
  const receiverRoom = `user:${payload.receiverUserId}`;

  // Send message to the user conversation
  io.to(receiverRoom).emit("chat:message", payload);

  // Also notify admins about user messages
  if (payload.senderRole === "user") {
    io.to("role:admin").emit("chat:message", payload);
  }

  // Echo admin messages to admins so they can see their own chat stream too
  if (payload.senderRole === "admin") {
    io.to("role:admin").emit("chat:message", payload);
  }
};

const attachChatHandlers = async (socket) => {
  const user = await parseSocketUser(socket);
  if (!user) return;

  socket.user = user;
  joinChatRooms(socket, user);

  socket.on("chat:send", async (payload) => {
    if (!socket.user || !payload?.content?.trim()) {
      return;
    }

    const content = String(payload.content).trim();
    let receiverUserId = socket.user.id;
    let senderRole = socket.user.role;

    if (senderRole === "admin") {
      if (!payload.receiverUserId) {
        return;
      }
      receiverUserId = String(payload.receiverUserId);
    }

    try {
      const message = await ChatMessage.create({
        senderId: socket.user.id,
        senderRole,
        receiverUserId,
        content,
      });
      emitChatMessage(message);
    } catch (error) {
      console.error("[chatHub] chat:send error", error);
    }
  });
};

module.exports = {
  setChatIO,
  attachChatHandlers,
};

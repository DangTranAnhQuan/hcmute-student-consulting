const ChatMessage = require("../models/ChatMessage");

const serializeMessage = (doc) => {
  const value = doc.toObject ? doc.toObject() : doc;
  return {
    id: value._id?.toString?.() || value._id,
    senderId: value.senderId?.toString?.() || value.senderId,
    receiverUserId: value.receiverUserId?.toString?.() || value.receiverUserId,
    senderRole: value.senderRole,
    content: value.content,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    isRead: value.isRead,
    senderUser: value.senderId?.username
      ? {
          id: value.senderId._id?.toString?.(),
          username: value.senderId.username,
          fullName: value.senderId.fullName,
          email: value.senderId.email,
          role: value.senderId.role,
        }
      : null,
  };
};

exports.history = async (req, res) => {
  try {
    const user = req.user;
    const targetUserId = user.role === "admin" ? req.query.userId : user.id;

    if (user.role === "admin" && !targetUserId) {
      return res.status(400).json({
        message: "Admin cần cung cấp userId để lấy lịch sử chat",
      });
    }

    const messages = await ChatMessage.find({ receiverUserId: targetUserId })
      .sort({ createdAt: 1 })
      .populate("senderId", "username fullName email role avatar");

    res.json({ data: messages.map(serializeMessage) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.chatUsers = async (req, res) => {
  try {
    const messages = await ChatMessage.find()
      .sort({ createdAt: -1 })
      .populate("senderId", "username fullName email role avatar")
      .populate("receiverUserId", "username fullName email role avatar");

    const latestByUser = new Map();
    messages.forEach((message) => {
      const userId = message.receiverUserId?._id?.toString?.();
      if (!userId) return;
      if (!latestByUser.has(userId)) {
        latestByUser.set(userId, message);
      }
    });

    const data = [];
    for (const [userId, message] of latestByUser.entries()) {
      data.push({
        user: {
          id: userId,
          username: message.receiverUserId?.username || "",
          fullName: message.receiverUserId?.fullName || "",
          email: message.receiverUserId?.email || "",
          role: message.receiverUserId?.role || "user",
          avatar: message.receiverUserId?.avatar || null,
        },
        lastMessage: serializeMessage(message),
      });
    }

    res.json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

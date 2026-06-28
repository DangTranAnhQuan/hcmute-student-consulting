const Notification = require("../models/Notification");

const serializeNotification = (doc, userId) => {
  const value = doc.toObject ? doc.toObject() : doc;
  const readBy = Array.isArray(value.readBy) ? value.readBy : [];

  return {
    ...value,
    id: value._id?.toString?.() || value._id,
    isRead: readBy.some((item) => item?.toString?.() === String(userId)),
  };
};

const buildScopeFilter = (user) => ({
  $or: [
    { recipientUserId: user.id },
    { targetRoles: user.role },
    { targetRoles: "all" },
  ],
});

exports.list = async (req, res) => {
  try {
    const user = req.user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(buildScopeFilter(user))
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(buildScopeFilter(user)),
    ]);

    res.json({
      data: notifications.map((item) => serializeNotification(item, user.id)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.summary = async (req, res) => {
  try {
    const user = req.user;
    const unreadCount = await Notification.countDocuments({
      ...buildScopeFilter(user),
      readBy: { $ne: user.id },
    });

    res.json({ unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markRead = async (req, res) => {
  try {
    const user = req.user;
    const notification = await Notification.findOne({
      _id: req.params.id,
      ...buildScopeFilter(user),
    });

    if (!notification) {
      return res.status(404).json({ message: "Không tìm thấy thông báo" });
    }

    await Notification.updateOne(
      { _id: notification._id },
      { $addToSet: { readBy: user.id } },
    );

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    const user = req.user;
    await Notification.updateMany(buildScopeFilter(user), {
      $addToSet: { readBy: user.id },
    });
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
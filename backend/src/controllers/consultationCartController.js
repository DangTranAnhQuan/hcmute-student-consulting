const ConsultationCart = require("../models/ConsultationCart");
const Counselor = require("../models/Counselor");
const {
  buildValidatedSlot,
  assertSlotAvailable,
} = require("../services/scheduleService");

const ONLINE_SURCHARGE_RATE = 0;
const IN_PERSON_SURCHARGE_RATE = 0;

const getUserId = (req) => req.user?.id;

const calculateConsultationPrice = (
  hourlyRate = 0,
  durationMinutes = 60,
  meetingType = "online",
) => {
  const surchargeRate =
    meetingType === "in-person" ? IN_PERSON_SURCHARGE_RATE : ONLINE_SURCHARGE_RATE;
  const basePrice = (Math.max(0, Number(hourlyRate || 0)) * durationMinutes) / 60;
  return Math.round(basePrice * (1 + surchargeRate));
};

const decorateCart = (cart) => {
  const items = cart.items || [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  return {
    _id: cart._id,
    userId: cart.userId,
    items,
    subtotal,
    totalItems: items.length,
    updatedAt: cart.updatedAt,
  };
};

const getOrCreateCart = async (userId) =>
  ConsultationCart.findOneAndUpdate(
    { userId },
    { $setOnInsert: { userId, items: [] } },
  { upsert: true, returnDocument: "after" },
  ).populate("items.counselorId", "fullName expertise hourlyRate rating isActive image");

exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(getUserId(req));
    res.json(decorateCart(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      counselorId,
      topic,
      preferredDate,
      meetingType = "online",
      note = "",
    } = req.body;

    if (!counselorId || !topic || !preferredDate) {
      return res.status(400).json({
        message: "Vui lòng chọn tư vấn viên, chủ đề và thời gian mong muốn",
      });
    }

    const counselor = await Counselor.findOne({ _id: counselorId, isActive: true });
    if (!counselor) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên đang hoạt động" });
    }

    const date = new Date(preferredDate);
    if (Number.isNaN(date.getTime()) || date <= new Date()) {
      return res.status(400).json({ message: "Thời gian tư vấn phải nằm trong tương lai" });
    }

    const slot = await buildValidatedSlot({
      counselorId,
      counselorName: counselor.fullName,
      preferredDate: date,
    });
    await assertSlotAvailable({
      counselorId,
      counselorName: counselor.fullName,
      userId,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    const cart = await getOrCreateCart(userId);
    cart.items.push({
      counselorId,
      topic: topic.trim(),
      preferredDate: date,
      durationMinutes: slot.duration,
      meetingType,
      note: note.trim(),
      price: calculateConsultationPrice(
        counselor.hourlyRate,
        slot.duration,
        meetingType,
      ),
    });
    await cart.save();
    await cart.populate("items.counselorId", "fullName expertise hourlyRate rating isActive image");

    res.status(201).json(decorateCart(cart));
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(getUserId(req));
    const item = cart.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Không tìm thấy mục trong giỏ" });

    const { topic, preferredDate, meetingType, note } = req.body;
    if (topic !== undefined) item.topic = topic.trim();
    if (meetingType !== undefined) item.meetingType = meetingType;
    if (note !== undefined) item.note = note.trim();
    if (preferredDate !== undefined) {
      const date = new Date(preferredDate);
      if (Number.isNaN(date.getTime()) || date <= new Date()) {
        return res.status(400).json({ message: "Thời gian tư vấn phải nằm trong tương lai" });
      }
      const counselor = item.counselorId;
      const counselorId = counselor?._id || counselor;
      const slot = await buildValidatedSlot({
        counselorId,
        counselorName: counselor?.fullName || "Tư vấn viên",
        preferredDate: date,
      });
      await assertSlotAvailable({
        counselorId,
        counselorName: counselor?.fullName || "Tư vấn viên",
        userId: getUserId(req),
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
      item.preferredDate = date;
      item.durationMinutes = slot.duration;
    }

    const currentCounselorId = item.counselorId?._id || item.counselorId;
    const counselor = await Counselor.findById(currentCounselorId);
    if (counselor) {
      item.price = calculateConsultationPrice(
        counselor.hourlyRate,
        item.durationMinutes || 60,
        item.meetingType,
      );
    }

    await cart.save();
    await cart.populate("items.counselorId", "fullName expertise hourlyRate rating isActive image");
    res.json(decorateCart(cart));
  } catch (error) {
    res.status(error.statusCode || 400).json({ message: error.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const cart = await getOrCreateCart(getUserId(req));
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    await cart.populate("items.counselorId", "fullName expertise hourlyRate rating isActive image");
    res.json(decorateCart(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(getUserId(req));
    cart.items = [];
    await cart.save();
    res.json(decorateCart(cart));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

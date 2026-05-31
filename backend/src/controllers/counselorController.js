const Counselor = require("../models/Counselor");
const Availability = require("../models/Availability");
const Schedule = require("../models/Schedule");
const { ACTIVE_SCHEDULE_STATUSES } = require("../services/scheduleService");
const { attachCounselorStats } = require("../services/counselorStatsService");

const COUNSELOR_PROFILE_FIELDS = [
  "fullName",
  "expertise",
  "bio",
  "image",
  "hourlyRate",
  "isActive",
];

const pickCounselorFields = (body = {}) =>
  COUNSELOR_PROFILE_FIELDS.reduce((payload, field) => {
    if (body[field] !== undefined) payload[field] = body[field];
    return payload;
  }, {});

// Get all counselors
exports.getAllCounselors = async (req, res) => {
  try {
    const counselors = await Counselor.find({ isActive: true })
      .populate("availability")
      .sort("-createdAt");
    res.json(await attachCounselorStats(counselors));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get counselor by ID
exports.getCounselorById = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id).populate(
      "availability",
    );
    if (!counselor) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }
    const [withStats] = await attachCounselorStats([counselor]);
    res.json(withStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildSimilarCounselorQuery = (counselor) => {
  const expertise = counselor.expertise || [];
  const baseQuery = { isActive: true, _id: { $ne: counselor._id } };
  if (expertise.length > 0) {
    baseQuery.expertise = { $in: expertise };
  }
  return baseQuery;
};

exports.getSimilarCounselors = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }
    const query = buildSimilarCounselorQuery(counselor);
    const candidates = await Counselor.find(query)
      .sort({ rating: -1, totalBookings: -1, hourlyRate: 1 })
      .limit(6)
      .populate("availability");
    res.json(await attachCounselorStats(candidates));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCounselorStats = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }
    const [withStats] = await attachCounselorStats([counselor]);
    res.json({ stats: withStats });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create counselor
exports.createCounselor = async (req, res) => {
  const { userId, fullName, expertise, bio, image, hourlyRate } = req.body;

  const counselor = new Counselor({
    userId,
    fullName,
    expertise,
    bio,
    image,
    hourlyRate,
  });

  try {
    const newCounselor = await counselor.save();
    res.status(201).json(newCounselor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update counselor
exports.updateCounselor = async (req, res) => {
  try {
    const counselor = await Counselor.findById(req.params.id);
    if (!counselor) {
      return res.status(404).json({ message: "Không tìm thấy tư vấn viên" });
    }

    Object.assign(counselor, pickCounselorFields(req.body));
    const updatedCounselor = await counselor.save();
    const [withStats] = await attachCounselorStats([updatedCounselor]);
    res.json(withStats);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAvailableSlots = async (req, res) => {
  try {
    const counselorId = req.params.id; // ✅ Lấy counselorId từ URL path
    const { date } = req.query; // ✅ Lấy date từ query string

    if (!counselorId || !date) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn tư vấn viên và ngày cần xem lịch" });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const availability = await Availability.findOne({
      counselorId,
      dayOfWeek,
      isActive: true,
    });

    if (!availability) {
      return res.json({ slots: [], bookedSlots: [] });
    }

    // Check for blackout dates
    const isBlackout = availability.blackoutDates.some((bd) => {
      const blackoutDate = new Date(bd.date);
      return blackoutDate.toDateString() === selectedDate.toDateString();
    });

    if (isBlackout) {
      return res.json({ slots: [], bookedSlots: [] });
    }

    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookedSlots = await Schedule.find({
      counselorId,
      status: { $in: ACTIVE_SCHEDULE_STATUSES },
      startTime: { $lt: dayEnd },
      endTime: { $gt: dayStart },
    });

    const slots = [];
    const bookedSlotValues = [];
    const [startHour, startMin] = availability.startTime.split(":");
    const [endHour, endMin] = availability.endTime.split(":");

    let currentTime = new Date(selectedDate);
    currentTime.setHours(parseInt(startHour), parseInt(startMin), 0);

    const endTime = new Date(selectedDate);
    endTime.setHours(parseInt(endHour), parseInt(endMin), 0);

    while (currentTime < endTime) {
      const slotStart = new Date(currentTime);
      const slotEnd = new Date(
        slotStart.getTime() + availability.slotDuration * 60000,
      );
      const isBooked = bookedSlots.some(
        (booking) => booking.startTime < slotEnd && booking.endTime > slotStart,
      );

      if (slotStart > new Date() && !isBooked && slotEnd <= endTime) {
        slots.push(slotStart);
      } else if (isBooked && slotEnd <= endTime) {
        bookedSlotValues.push(slotStart);
      }
      currentTime = new Date(
        currentTime.getTime() + availability.slotDuration * 60000,
      );
    }

    res.json({
      slots,
      bookedSlots: bookedSlotValues,
      slotDuration: availability.slotDuration,
      workStart: availability.startTime,
      workEnd: availability.endTime,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

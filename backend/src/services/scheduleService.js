const Availability = require("../models/Availability");
const Schedule = require("../models/Schedule");

const ACTIVE_SCHEDULE_STATUSES = ["pending", "confirmed", "completed"];
const DEFAULT_SLOT_DURATION = 60;

const createHttpError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const toDate = (value, fieldName = "Thời gian") => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw createHttpError(`${fieldName} không hợp lệ`);
  }
  return date;
};

const getMinutesOfDay = (date) => date.getHours() * 60 + date.getMinutes();

const parseTimeToMinutes = (value) => {
  const [hour, minute] = String(value || "")
    .split(":")
    .map((part) => Number(part));

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    throw createHttpError("Khung giờ làm việc của tư vấn viên không hợp lệ");
  }

  return hour * 60 + minute;
};

const isSameLocalDate = (first, second) =>
  first.getFullYear() === second.getFullYear() &&
  first.getMonth() === second.getMonth() &&
  first.getDate() === second.getDate();

const overlaps = (first, second) =>
  first.startTime < second.endTime && first.endTime > second.startTime;

const getAvailabilityForSlot = async (counselorId, startTime) => {
  const dayOfWeek = startTime.getDay();
  return Availability.findOne({
    counselorId,
    dayOfWeek,
    isActive: true,
  });
};

const buildValidatedSlot = async ({
  counselorId,
  counselorName = "Tư vấn viên",
  preferredDate,
  endTime,
}) => {
  const start = toDate(preferredDate, "Thời gian tư vấn");
  if (start <= new Date()) {
    throw createHttpError("Thời gian tư vấn phải nằm trong tương lai");
  }

  const availability = await getAvailabilityForSlot(counselorId, start);
  if (!availability) {
    throw createHttpError(
      `${counselorName} không có lịch làm việc vào ngày đã chọn`,
    );
  }

  const blackout = (availability.blackoutDates || []).some((item) =>
    isSameLocalDate(new Date(item.date), start),
  );
  if (blackout) {
    throw createHttpError(`${counselorName} không nhận tư vấn vào ngày đã chọn`);
  }

  const duration = Number(availability.slotDuration || DEFAULT_SLOT_DURATION);
  if (!Number.isFinite(duration) || duration <= 0) {
    throw createHttpError("Thời lượng slot của tư vấn viên không hợp lệ");
  }

  const end = endTime
    ? toDate(endTime, "Thời gian kết thúc")
    : new Date(start.getTime() + duration * 60 * 1000);

  if (end <= start) {
    throw createHttpError("Thời gian kết thúc phải sau thời gian bắt đầu");
  }

  const startMinutes = getMinutesOfDay(start);
  const endMinutes = getMinutesOfDay(end);
  const availabilityStart = parseTimeToMinutes(availability.startTime);
  const availabilityEnd = parseTimeToMinutes(availability.endTime);

  if (
    !isSameLocalDate(start, end) ||
    startMinutes < availabilityStart ||
    endMinutes > availabilityEnd
  ) {
    throw createHttpError(
      `${counselorName} chỉ nhận tư vấn trong khung ${availability.startTime} - ${availability.endTime}`,
    );
  }

  if ((startMinutes - availabilityStart) % duration !== 0) {
    throw createHttpError(
      `${counselorName} chỉ nhận lịch theo từng slot ${duration} phút`,
    );
  }

  return {
    counselorId,
    counselorName,
    startTime: start,
    endTime: end,
    duration,
  };
};

const assertNoInternalConflicts = (slots) => {
  for (let i = 0; i < slots.length; i += 1) {
    for (let j = i + 1; j < slots.length; j += 1) {
      if (!overlaps(slots[i], slots[j])) continue;

      const sameCounselor =
        String(slots[i].counselorId) === String(slots[j].counselorId);
      throw createHttpError(
        sameCounselor
          ? `${slots[i].counselorName} đã được chọn trùng khung giờ trong yêu cầu này`
          : "Bạn không thể đặt nhiều tư vấn viên trong cùng một khung giờ",
        409,
      );
    }
  }
};

const findConflictingSchedule = async ({ counselorId, userId, startTime, endTime }) => {
  const timeQuery = {
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $in: ACTIVE_SCHEDULE_STATUSES },
  };

  const counselorConflict = await Schedule.findOne({
    counselorId,
    ...timeQuery,
  }).populate("userId", "fullName email username");
  if (counselorConflict) {
    return {
      type: "counselor",
      booking: counselorConflict,
    };
  }

  const userConflict = await Schedule.findOne({
    userId,
    ...timeQuery,
  }).populate("counselorId", "fullName");
  if (userConflict) {
    return {
      type: "user",
      booking: userConflict,
    };
  }

  return null;
};

const assertSlotAvailable = async ({ counselorId, counselorName, userId, startTime, endTime }) => {
  const conflict = await findConflictingSchedule({
    counselorId,
    userId,
    startTime,
    endTime,
  });

  if (!conflict) return;

  if (conflict.type === "counselor") {
    throw createHttpError(
      `${counselorName} đã có lịch tư vấn trong khung giờ này`,
      409,
    );
  }

  throw createHttpError(
    "Bạn đã có một lịch tư vấn khác trùng khung giờ này",
    409,
  );
};

const assertSlotsAvailable = async (slots, userId) => {
  assertNoInternalConflicts(slots);

  for (const slot of slots) {
    await assertSlotAvailable({
      counselorId: slot.counselorId,
      counselorName: slot.counselorName,
      userId,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  }
};

const createSchedulesForOrder = async (order, slots) => {
  const docs = order.items.map((item, index) => {
    const slot = slots[index];
    return {
      counselorId: item.counselorId,
      userId: order.userId,
      consultationOrderId: order._id,
      consultationOrderCode: order.orderCode,
      consultationOrderItemIndex: index,
      title: item.topic,
      description: item.note || `Yêu cầu tư vấn #${order.orderCode}`,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "pending",
      meetingType: item.meetingType,
      meetingLink: "",
      location: item.meetingType === "in-person" ? "Phòng tư vấn sinh viên" : "",
      notes: item.note || "",
    };
  });

  try {
    return await Schedule.insertMany(docs, { ordered: true });
  } catch (error) {
    if (error.code === 11000) {
      throw createHttpError(
        "Khung giờ vừa được đặt bởi người khác, vui lòng chọn thời gian khác",
        409,
      );
    }
    throw error;
  }
};

const cancelSchedulesForOrder = async (
  order,
  cancellationReason = "",
  cancelledBy = "system",
) => {
  if (!order?._id) return;

  await Schedule.updateMany(
    {
      consultationOrderId: order._id,
      status: { $in: ACTIVE_SCHEDULE_STATUSES },
    },
    {
      $set: {
        status: "cancelled",
        cancelledBy,
        cancellationReason,
        updatedAt: new Date(),
      },
    },
  );
};

const deleteSchedulesForOrder = async (order) => {
  if (!order?._id) return;
  await Schedule.deleteMany({ consultationOrderId: order._id });
};

const updateSchedulesForOrderStatus = async (order, status) => {
  if (!order?._id) return;

  await Schedule.updateMany(
    {
      consultationOrderId: order._id,
      status: { $in: ACTIVE_SCHEDULE_STATUSES },
    },
    {
      $set: {
        status,
        updatedAt: new Date(),
      },
    },
  );
};

module.exports = {
  ACTIVE_SCHEDULE_STATUSES,
  buildValidatedSlot,
  assertNoInternalConflicts,
  assertSlotAvailable,
  assertSlotsAvailable,
  createSchedulesForOrder,
  cancelSchedulesForOrder,
  deleteSchedulesForOrder,
  updateSchedulesForOrderStatus,
};

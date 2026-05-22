const mongoose = require("mongoose");
const CounselorReview = require("../models/CounselorReview");
const Schedule = require("../models/Schedule");
const { ACTIVE_SCHEDULE_STATUSES } = require("./scheduleService");

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(id);

const emptyStats = () => ({
  totalBookings: 0,
  activeBookings: 0,
  completedBookings: 0,
  upcomingBookings: 0,
  reviewCount: 0,
  rating: 0,
  currentStatus: "available",
  currentStatusLabel: "Đang rảnh",
  currentBooking: null,
  nextBooking: null,
  nextBookingAt: null,
});

const getCounselorStats = async (counselorIds = []) => {
  const ids = [...new Set(counselorIds.map(String).filter(Boolean))];
  const result = ids.reduce((map, id) => {
    map[id] = emptyStats();
    return map;
  }, {});

  if (ids.length === 0) return result;

  const objectIds = ids.map(toObjectId);
  const now = new Date();

  const [bookingGroups, reviewGroups, currentBookings, upcomingBookings] =
    await Promise.all([
      Schedule.aggregate([
        {
          $match: {
            counselorId: { $in: objectIds },
            status: { $ne: "cancelled" },
          },
        },
        {
          $group: {
            _id: "$counselorId",
            totalBookings: { $sum: 1 },
            activeBookings: {
              $sum: {
                $cond: [{ $in: ["$status", ACTIVE_SCHEDULE_STATUSES] }, 1, 0],
              },
            },
            completedBookings: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
              },
            },
            upcomingBookings: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $in: ["$status", ACTIVE_SCHEDULE_STATUSES] },
                      { $gte: ["$startTime", now] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      CounselorReview.aggregate([
        {
          $match: {
            counselorId: { $in: objectIds },
          },
        },
        {
          $group: {
            _id: "$counselorId",
            reviewCount: { $sum: 1 },
            rating: { $avg: "$rating" },
          },
        },
      ]),
      Schedule.find({
        counselorId: { $in: objectIds },
        status: { $in: ACTIVE_SCHEDULE_STATUSES },
        startTime: { $lte: now },
        endTime: { $gt: now },
      })
        .select("counselorId userId title startTime endTime status meetingType")
        .populate("userId", "fullName email username")
        .sort({ startTime: 1 }),
      Schedule.find({
        counselorId: { $in: objectIds },
        status: { $in: ACTIVE_SCHEDULE_STATUSES },
        startTime: { $gte: now },
      })
        .select("counselorId userId title startTime endTime status meetingType")
        .populate("userId", "fullName email username")
        .sort({ startTime: 1 }),
    ]);

  bookingGroups.forEach((group) => {
    const key = group._id.toString();
    if (!result[key]) result[key] = emptyStats();
    result[key].totalBookings = group.totalBookings || 0;
    result[key].activeBookings = group.activeBookings || 0;
    result[key].completedBookings = group.completedBookings || 0;
    result[key].upcomingBookings = group.upcomingBookings || 0;
  });

  reviewGroups.forEach((group) => {
    const key = group._id.toString();
    if (!result[key]) result[key] = emptyStats();
    result[key].reviewCount = group.reviewCount || 0;
    result[key].rating = Number((group.rating || 0).toFixed(1));
  });

  currentBookings.forEach((booking) => {
    const key = booking.counselorId.toString();
    if (!result[key] || result[key].currentBooking) return;
    result[key].currentStatus = "busy";
    result[key].currentStatusLabel = "Đang bận";
    result[key].currentBooking = booking;
  });

  upcomingBookings.forEach((booking) => {
    const key = booking.counselorId.toString();
    if (!result[key] || result[key].nextBooking) return;
    result[key].nextBooking = booking;
    result[key].nextBookingAt = booking.startTime;
  });

  return result;
};

const attachCounselorStats = async (counselors = []) => {
  const plainCounselors = counselors.map((counselor) =>
    counselor.toObject ? counselor.toObject() : counselor,
  );
  const stats = await getCounselorStats(
    plainCounselors.map((counselor) => counselor._id),
  );

  return plainCounselors.map((counselor) => {
    const counselorStats = stats[counselor._id.toString()] || emptyStats();
    const currentStatus = counselor.isActive
      ? counselorStats.currentStatus
      : "inactive";
    return {
      ...counselor,
      ...counselorStats,
      currentStatus,
      currentStatusLabel:
        currentStatus === "inactive"
          ? "Tạm ẩn"
          : counselorStats.currentStatusLabel,
    };
  });
};

module.exports = {
  attachCounselorStats,
  getCounselorStats,
};

const crypto = require("crypto");
const ConsultationCart = require("../models/ConsultationCart");
const CounselorReview = require("../models/CounselorReview");
const User = require("../models/User");
const {
  ConsultationOrder,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} = require("../models/ConsultationOrder");
const {
  buildValidatedSlot,
  assertSlotsAvailable,
  createSchedulesForOrder,
  cancelSchedulesForOrder,
  updateSchedulesForOrderStatus,
} = require("./scheduleService");
const { createNotification } = require("./notificationHub");
const { paginate } = require("../utils/paginationHelper");

const AUTO_CONFIRM_MINUTES = 30;
const AUTO_CONFIRM_MS = AUTO_CONFIRM_MINUTES * 60 * 1000;
const MOMO_PAYMENT_MINUTES = 15;
const DIRECT_CANCEL_STATUSES = [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED];
const ONLINE_SURCHARGE_RATE = 0;
const IN_PERSON_SURCHARGE_RATE = 0;

const createOrderCode = () =>
  `TV${Date.now()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

const createTimelineEntry = (status, note = "", at = new Date()) => ({
  status,
  label: ORDER_STATUS_LABELS[status] || status,
  note,
  at,
});

const getCancelDeadline = (order) =>
  new Date(new Date(order.createdAt).getTime() + AUTO_CONFIRM_MS);

const isPaidOnlineOrder = (order) =>
  order.paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX &&
  order.paymentStatus === PAYMENT_STATUS.PAID;

const isPaymentPendingLike = (order) =>
  order.paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX &&
  [
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.EXPIRED,
    PAYMENT_STATUS.CANCELLED,
  ].includes(order.paymentStatus);

const canAdminProcessPayment = (order) =>
  order.paymentMethod === PAYMENT_METHOD.COD ||
  order.paymentStatus === PAYMENT_STATUS.PAID;

const expireMomoPaymentIfNeeded = (order) => {
  if (
    order.paymentMethod !== PAYMENT_METHOD.MOMO_SANDBOX ||
    order.paymentStatus !== PAYMENT_STATUS.PENDING ||
    !order.paymentExpiresAt ||
    order.paymentExpiresAt > new Date()
  ) {
    return false;
  }

  order.paymentStatus = PAYMENT_STATUS.EXPIRED;
  order.momoMessage = "Phiên thanh toán MoMo đã hết hạn";
  order.timeline.push(
    createTimelineEntry(
      order.status,
      "Phiên thanh toán MoMo hết hạn, yêu cầu chưa được chuyển sang xử lý",
    ),
  );
  return true;
};

const autoConfirmOrder = (order) => {
  expireMomoPaymentIfNeeded(order);

  if (
    order.status !== ORDER_STATUS.NEW ||
    !canAdminProcessPayment(order) ||
    new Date(order.createdAt).getTime() + AUTO_CONFIRM_MS > Date.now()
  ) {
    return false;
  }

  order.status = ORDER_STATUS.CONFIRMED;
  order.confirmedAt = new Date();
  order.timeline.push(
    createTimelineEntry(
      ORDER_STATUS.CONFIRMED,
      `Hệ thống tự động xác nhận sau ${AUTO_CONFIRM_MINUTES} phút`,
    ),
  );
  return true;
};

const getCancelPolicy = (order) => {
  const deadline = getCancelDeadline(order);
  const now = new Date();

  if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETED].includes(order.status)) {
    return {
      canCancel: false,
      mode: "NONE",
      cancelDeadlineAt: deadline,
      message: "Yêu cầu đã kết thúc nên không thể hủy",
    };
  }

  if (order.status === ORDER_STATUS.CANCEL_REQUESTED) {
    return {
      canCancel: false,
      mode: "WAITING_ADMIN",
      cancelDeadlineAt: deadline,
      message: "Yêu cầu hủy đang chờ admin xác nhận",
    };
  }

  if (isPaymentPendingLike(order)) {
    return {
      canCancel: true,
      mode: "DIRECT",
      cancelDeadlineAt: deadline,
      message: "Có thể hủy trực tiếp vì đơn MoMo chưa thanh toán thành công",
    };
  }

  if (DIRECT_CANCEL_STATUSES.includes(order.status) && now <= deadline) {
    return {
      canCancel: true,
      mode: "DIRECT",
      cancelDeadlineAt: deadline,
      message: `Được hủy trực tiếp trước ${AUTO_CONFIRM_MINUTES} phút sau khi tạo`,
    };
  }

  if (order.status === ORDER_STATUS.PREPARING) {
    return {
      canCancel: true,
      mode: "REQUEST",
      cancelDeadlineAt: deadline,
      message:
        "Ban tư vấn đã chuẩn bị hồ sơ, cần gửi yêu cầu hủy để admin duyệt",
    };
  }

  return {
    canCancel: false,
    mode: "NONE",
    cancelDeadlineAt: deadline,
    message: "Đơn đang xử lý hoặc đã giao/tư vấn nên không thể hủy trực tiếp",
  };
};

const decorateOrder = (order, reviews = []) => {
  const value = order.toObject ? order.toObject() : order;
  const policy = getCancelPolicy(value);

  return {
    ...value,
    id: value._id?.toString?.() || value._id,
    statusLabel: ORDER_STATUS_LABELS[value.status] || value.status,
    paymentMethodLabel:
      PAYMENT_METHOD_LABELS[value.paymentMethod] || value.paymentMethod,
    paymentStatusLabel:
      PAYMENT_STATUS_LABELS[value.paymentStatus] || value.paymentStatus,
    cancelDeadlineAt: policy.cancelDeadlineAt,
    cancelPolicy: policy,
    autoConfirmMinutes: AUTO_CONFIRM_MINUTES,
    reviews,
    loyaltyPointsApplied: value.pointsUsed || 0,
  };
};

const getMomoConfig = () => ({
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: (() => {
    const endpoint =
      process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn";
    return endpoint.includes("/v2/gateway/api/create")
      ? endpoint
      : `${endpoint.replace(/\/$/, "")}/v2/gateway/api/create`;
  })(),
  requestType: process.env.MOMO_REQUEST_TYPE || "captureWallet",
  apiPublicUrl: process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3001",
});

const signMomoRaw = (rawSignature, secretKey) =>
  crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

const buildMomoCreateSignature = (payload, accessKey) =>
  [
    `accessKey=${accessKey}`,
    `amount=${payload.amount}`,
    `extraData=${payload.extraData}`,
    `ipnUrl=${payload.ipnUrl}`,
    `orderId=${payload.orderId}`,
    `orderInfo=${payload.orderInfo}`,
    `partnerCode=${payload.partnerCode}`,
    `redirectUrl=${payload.redirectUrl}`,
    `requestId=${payload.requestId}`,
    `requestType=${payload.requestType}`,
  ].join("&");

const requestMomoPayment = async (order) => {
  const config = getMomoConfig();
  const requestId = `${order.orderCode}_${Date.now()}`;
  const momoOrderId = `${order.orderCode}_${Date.now()}`;
  const amount = Math.round(order.total);
  const orderInfo = `Thanh toán yêu cầu tư vấn ${order.orderCode}`;
  const extraData = Buffer.from(
    JSON.stringify({
      orderId: order._id?.toString(),
      orderCode: order.orderCode,
    }),
  ).toString("base64");
  const apiPublicUrl = config.apiPublicUrl.replace(/\/$/, "");

  const payload = {
    partnerCode: config.partnerCode,
    partnerName: "HCMUTE Student Consulting",
    storeId: "HCMUTE-CONSULTING",
    requestId,
    amount,
    orderId: momoOrderId,
    orderInfo,
    redirectUrl: `${apiPublicUrl}/api/consultation-orders/momo/return`,
    ipnUrl: `${apiPublicUrl}/api/consultation-orders/momo/ipn`,
    lang: "vi",
    requestType: config.requestType,
    autoCapture: true,
    extraData,
  };

  payload.signature = signMomoRaw(
    buildMomoCreateSignature(payload, config.accessKey),
    config.secretKey,
  );

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json();

  if (!response.ok || data.resultCode !== 0 || !data.payUrl) {
    const error = new Error(
      data.message || "MoMo Sandbox không trả về link thanh toán hợp lệ",
    );
    error.statusCode = 502;
    error.details = data;
    throw error;
  }

  order.momoRequestId = requestId;
  order.momoOrderId = momoOrderId;
  order.momoPayUrl = data.payUrl;
  order.momoResultCode = data.resultCode;
  order.momoMessage = data.message || "Đã tạo phiên thanh toán MoMo";
  order.paymentExpiresAt = new Date(
    Date.now() + MOMO_PAYMENT_MINUTES * 60 * 1000,
  );
  order.paymentStatus = PAYMENT_STATUS.PENDING;

  return {
    payUrl: data.payUrl,
    deeplink: data.deeplink,
    qrCodeUrl: data.qrCodeUrl,
    expiresAt: order.paymentExpiresAt,
  };
};

const calculateConsultationPrice = (
  hourlyRate = 0,
  durationMinutes = 60,
  meetingType = "online",
) => {
  const surchargeRate =
    meetingType === "in-person"
      ? IN_PERSON_SURCHARGE_RATE
      : ONLINE_SURCHARGE_RATE;
  const basePrice =
    (Math.max(0, Number(hourlyRate || 0)) * durationMinutes) / 60;
  return Math.round(basePrice * (1 + surchargeRate));
};

const applyCoupon = (couponCode, subtotal, user) => {
  if (!couponCode) return { discountAmount: 0, coupon: null };
  const code = String(couponCode || "")
    .trim()
    .toUpperCase();
  if (!code) return { discountAmount: 0, coupon: null };
  const coupon = (user.coupons || []).find(
    (item) => item.code.toUpperCase() === code,
  );
  if (!coupon) {
    const error = new Error("Mã khuyến mãi không tồn tại hoặc chưa được cấp");
    error.statusCode = 400;
    throw error;
  }
  if (coupon.isUsed) {
    const error = new Error("Mã khuyến mãi này đã được sử dụng");
    error.statusCode = 400;
    throw error;
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    const error = new Error("Mã khuyến mãi đã hết hạn");
    error.statusCode = 400;
    throw error;
  }
  if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
    const error = new Error(
      `Đơn tối thiểu ${coupon.minOrderValue} để áp mã này`,
    );
    error.statusCode = 400;
    throw error;
  }
  const discountAmount =
    coupon.type === "percent"
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(subtotal, coupon.value || 0);
  return { discountAmount, coupon };
};

const grantPaymentLoyaltyPoints = async (order) => {
  const points = Math.max(1, Math.floor((order.total || 0) / 1000));
  await User.findByIdAndUpdate(order.userId, {
    $inc: { loyaltyPoints: points },
  });
  return points;
};

const syncSchedulesAfterOrderStatusChange = async (order, note = "") => {
  if (order.status === ORDER_STATUS.CANCELLED) {
    await cancelSchedulesForOrder(
      order,
      note || "Yêu cầu tư vấn đã hủy",
      "admin",
    );
    return;
  }

  if (order.status === ORDER_STATUS.COMPLETED) {
    await updateSchedulesForOrderStatus(order, "completed");
    return;
  }

  if (
    [
      ORDER_STATUS.CONFIRMED,
      ORDER_STATUS.PREPARING,
      ORDER_STATUS.PROCESSING,
    ].includes(order.status)
  ) {
    await updateSchedulesForOrderStatus(order, "confirmed");
  }
};

exports.checkout = async (userId, body) => {
  const {
    selectedItemIds,
    paymentMethod = PAYMENT_METHOD.COD,
    couponCode = "",
    pointsToUse = 0,
    contactInfo = {},
  } = body;

  if (!Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
    const error = new Error("Phương thức thanh toán không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const cart = await ConsultationCart.findOne({ userId }).populate(
    "items.counselorId",
    "fullName expertise hourlyRate rating isActive",
  );
  if (!cart || cart.items.length === 0) {
    const error = new Error("Giỏ tư vấn đang trống");
    error.statusCode = 400;
    throw error;
  }

  const selectedSet =
    Array.isArray(selectedItemIds) && selectedItemIds.length > 0
      ? new Set(selectedItemIds.map(String))
      : new Set(cart.items.map((item) => item._id.toString()));
  const selectedItems = cart.items.filter((item) =>
    selectedSet.has(item._id.toString()),
  );

  if (selectedItems.length === 0) {
    const error = new Error("Vui lòng chọn ít nhất một dịch vụ tư vấn");
    error.statusCode = 400;
    throw error;
  }

  const inactiveCounselor = selectedItems.find(
    (item) => !item.counselorId || item.counselorId.isActive === false,
  );
  if (inactiveCounselor) {
    const error = new Error("Có tư vấn viên không còn hoạt động, vui lòng cập nhật giỏ");
    error.statusCode = 400;
    throw error;
  }

  const slots = [];
  for (const item of selectedItems) {
    slots.push(
      await buildValidatedSlot({
        counselorId: item.counselorId._id,
        counselorName: item.counselorId.fullName,
        preferredDate: item.preferredDate,
      }),
    );
  }
  await assertSlotsAvailable(slots, userId);

  const items = selectedItems.map((item, index) => ({
    counselorId: item.counselorId._id,
    counselorName: item.counselorId.fullName,
    expertise: item.counselorId.expertise || [],
    topic: item.topic,
    preferredDate: item.preferredDate,
    durationMinutes: slots[index].duration,
    meetingType: item.meetingType,
    note: item.note,
    price: calculateConsultationPrice(
      item.counselorId.hourlyRate,
      slots[index].duration,
      item.meetingType,
    ),
  }));

  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
  const user = await User.findById(userId);
  const { discountAmount, coupon } = applyCoupon(couponCode, subtotal, user);
  const points = Math.min(
    Math.max(0, Number(pointsToUse || 0)),
    user.loyaltyPoints,
  );
  const pointsApplied = Math.min(points, Math.max(0, subtotal - discountAmount));
  const total = Math.max(0, subtotal - discountAmount - pointsApplied);

  const order = new ConsultationOrder({
    userId,
    orderCode: createOrderCode(),
    items,
    contactInfo,
    paymentMethod,
    paymentStatus:
      paymentMethod === PAYMENT_METHOD.COD
        ? PAYMENT_STATUS.UNPAID
        : PAYMENT_STATUS.PENDING,
    couponCode: coupon ? coupon.code : "",
    discountAmount,
    pointsUsed: pointsApplied,
    subtotal,
    total,
    status: ORDER_STATUS.NEW,
    timeline: [
      createTimelineEntry(
        ORDER_STATUS.NEW,
        paymentMethod === PAYMENT_METHOD.COD
          ? "Người dùng đặt yêu cầu tư vấn, thanh toán COD khi hoàn tất"
          : "Người dùng tạo yêu cầu tư vấn và chờ thanh toán MoMo Sandbox",
      ),
    ],
  });

  let payment = null;
  await createSchedulesForOrder(order, slots);

  if (paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX) {
    payment = await requestMomoPayment(order);
  }

  await order.save();

  // Cleanup cart
  cart.items = cart.items.filter(
    (item) => !selectedSet.has(item._id.toString()),
  );
  await cart.save();

  if (pointsApplied > 0) {
    await User.findByIdAndUpdate(userId, { $inc: { loyaltyPoints: -pointsApplied } });
  }
  if (coupon) {
    await User.updateOne(
      { _id: userId, "coupons.code": coupon.code },
      { $set: { "coupons.$.isUsed": true, updatedAt: Date.now() } },
    );
  }

  await createNotification({
    recipientUserId: userId,
    targetRoles: ["admin"],
    type: "consultation-order-created",
    title: `Yêu cầu tư vấn mới: ${order.orderCode}`,
    message: `Sinh viên vừa tạo một yêu cầu mới với tổng tiền ${total.toLocaleString("vi-VN")}đ.`,
    link: `/consultation-orders/${order._id}`,
    entityType: "ConsultationOrder",
    entityId: String(order._id),
  });

  return { order: decorateOrder(order), payment };
};

exports.getOrders = async (userId, query) => {
  const { page = 1, limit = 10 } = query;
  const filter = { userId };

  const result = await paginate(ConsultationOrder, filter, { page, limit });

  for (const order of result.data) {
    const changed = autoConfirmOrder(order);
    if (changed || order.isModified("paymentStatus")) {
      await order.save();
      if (changed) await syncSchedulesAfterOrderStatusChange(order);
    }
  }

  return {
    data: result.data.map((o) => decorateOrder(o)),
    pagination: result.pagination
  };
};

exports.getAdminOrders = async (query) => {
  const {
    page = 1,
    limit = 10,
    status,
    paymentStatus,
    paymentMethod,
    search,
    sortBy = "latest",
    dateFrom,
    dateTo,
    minTotal,
    maxTotal,
  } = query;

  const filter = {};
  if (status) filter.status = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  if (paymentMethod) filter.paymentMethod = paymentMethod;

  if (search) {
    const regex = new RegExp(
      search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i",
    );
    filter.$or = [
      { orderCode: regex },
      { "contactInfo.fullName": regex },
      { "contactInfo.phone": regex },
      { "contactInfo.email": regex },
      { "contactInfo.studentCode": regex },
    ];
  }

  // Lọc theo ngày
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  // Lọc theo khoảng tiền
  if (minTotal || maxTotal) {
    filter.total = {};
    if (minTotal) filter.total.$gte = Number(minTotal);
    if (maxTotal) filter.total.$lte = Number(maxTotal);
  }

  const sortOptions = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    totalDesc: { total: -1, createdAt: -1 },
    totalAsc: { total: 1, createdAt: -1 },
    status: { status: 1, createdAt: -1 },
    payment: { paymentStatus: 1, createdAt: -1 },
  };

  const result = await paginate(ConsultationOrder, filter, {
    page,
    limit,
    sort: sortOptions[sortBy] || sortOptions.latest,
    populate: "userId",
  });

  for (const order of result.data) {
    const changed = autoConfirmOrder(order);
    if (changed || order.isModified("paymentStatus")) {
      await order.save();
      if (changed) await syncSchedulesAfterOrderStatusChange(order);
    }
  }

  return {
    data: result.data.map((o) => decorateOrder(o)),
    pagination: result.pagination,
  };
};

exports.updateOrderStatus = async (orderId, status, note = "") => {
  const order = await ConsultationOrder.findById(orderId);
  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu");
    error.statusCode = 404;
    throw error;
  }

  autoConfirmOrder(order);

  order.status = status;
  order.timeline.push(createTimelineEntry(status, note));

  if (status === ORDER_STATUS.COMPLETED && order.paymentMethod === PAYMENT_METHOD.COD) {
    if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
      order.paymentStatus = PAYMENT_STATUS.PAID;
      order.paidAt = new Date();
      await grantPaymentLoyaltyPoints(order);
    }
  }

  await order.save();
  await syncSchedulesAfterOrderStatusChange(order, note);

  await createNotification({
    recipientUserId: order.userId,
    targetRoles: ["admin"],
    type: "consultation-order-status-updated",
    title: `Trạng thái yêu cầu ${order.orderCode} đã đổi`,
    message: `${ORDER_STATUS_LABELS[status]}${note ? ` - ${note}` : ""}`,
    link: `/consultation-orders/${order._id}`,
    entityType: "ConsultationOrder",
    entityId: String(order._id),
  });

  return decorateOrder(order);
};

exports.getOrderDetail = async (user, orderId) => {
  const userId = user._id || user.id;
  const isAdmin = user.role === "admin";

  const filter = isAdmin ? { _id: orderId } : { _id: orderId, userId };
  const order = await ConsultationOrder.findOne(filter).populate("userId");

  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu hoặc bạn không có quyền xem");
    error.statusCode = 404;
    throw error;
  }

  const changed = autoConfirmOrder(order);
  if (changed || order.isModified("paymentStatus")) {
    await order.save();
    if (changed) await syncSchedulesAfterOrderStatusChange(order);
  }

  const reviews = await CounselorReview.find({
    consultationOrderId: order._id,
  }).sort({ itemIndex: 1 });
  return decorateOrder(order, reviews);
};

exports.cancelOrder = async (userId, orderId, reason) => {
  const order = await ConsultationOrder.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu");
    error.statusCode = 404;
    throw error;
  }

  const policy = getCancelPolicy(order);
  if (!policy.canCancel) {
    const error = new Error(policy.message);
    error.statusCode = 400;
    throw error;
  }

  if (policy.mode === "DIRECT") {
    order.status = ORDER_STATUS.CANCELLED;
    order.cancelledAt = new Date();
    order.cancelReason = reason;
    if (isPaidOnlineOrder(order)) {
      order.paymentStatus = PAYMENT_STATUS.REFUND_REQUIRED;
    }
    order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCELLED, `Người dùng hủy: ${reason}`));
    await cancelSchedulesForOrder(order, reason, "user");
  } else {
    order.status = ORDER_STATUS.CANCEL_REQUESTED;
    order.cancelReason = reason;
    order.timeline.push(createTimelineEntry(ORDER_STATUS.CANCEL_REQUESTED, `Yêu cầu hủy: ${reason}`));
  }

  await order.save();
  return decorateOrder(order);
};

exports.getRewardHistory = async (userId) => {
  const orders = await ConsultationOrder.find({ userId })
    .select("orderCode reviewRewards createdAt")
    .sort({ createdAt: -1 });

  const history = [];
  for (const order of orders) {
    for (const reward of order.reviewRewards || []) {
      history.push({
        orderCode: order.orderCode,
        orderId: order._id,
        itemIndex: reward.itemIndex,
        type: reward.type,
        value: reward.value,
        code: reward.code,
        message: reward.message,
        createdAt: reward.createdAt,
      });
    }
  }

  history.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return history;
};

exports.reviewOrderItem = async (userId, orderId, itemIndex, rating, comment) => {
  const order = await ConsultationOrder.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== ORDER_STATUS.COMPLETED) {
    const error = new Error("Chỉ được đánh giá sau khi yêu cầu tư vấn đã hoàn tất");
    error.statusCode = 400;
    throw error;
  }

  const item = order.items[itemIndex];
  if (!item) {
    const error = new Error("Không tìm thấy mục tư vấn cần đánh giá");
    error.statusCode = 404;
    throw error;
  }

  const review = await CounselorReview.findOneAndUpdate(
    { consultationOrderId: order._id, itemIndex },
    {
      counselorId: item.counselorId,
      userId: order.userId,
      consultationOrderId: order._id,
      consultationOrderCode: order.orderCode,
      itemIndex,
      rating,
      comment,
      updatedAt: new Date(),
    },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  );

  let rewardInfo = null;
  const existingReward = (order.reviewRewards || []).find((r) => r.itemIndex === itemIndex);
  if (!existingReward) {
    const code = `TV${Date.now()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const coupon = {
      code,
      type: "percent",
      value: 15,
      description: "Giảm 15% cho lần đặt dịch vụ tiếp theo",
      minOrderValue: 0,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isUsed: false,
    };
    await User.findByIdAndUpdate(userId, { $push: { coupons: coupon } });

    rewardInfo = {
      type: "coupon",
      value: 15,
      code,
      message: `Cảm ơn bạn đã đánh giá! Tặng mã giảm 15%: ${code}`,
    };

    order.reviewRewards = order.reviewRewards || [];
    order.reviewRewards.push({
      itemIndex,
      ...rewardInfo,
      createdAt: new Date(),
    });
    await order.save();
  }

  const reviews = await CounselorReview.find({ consultationOrderId: order._id }).sort({ itemIndex: 1 });
  return { review, rewardInfo, order: decorateOrder(order, reviews) };
};

exports.handleMomoResult = async (payload, source = "return") => {
  const order = await ConsultationOrder.findOne({ momoOrderId: payload.orderId });
  if (!order) {
    const error = new Error("Không tìm thấy đơn theo mã MoMo");
    error.statusCode = 404;
    throw error;
  }

  const resultCode = Number(payload.resultCode);
  order.momoResultCode = resultCode;
  order.momoMessage = payload.message || "";
  order.momoTransactionId = payload.transId ? String(payload.transId) : "";

  if (resultCode === 0) {
    const wasPaid = order.paymentStatus === PAYMENT_STATUS.PAID;
    order.paymentStatus = order.status === ORDER_STATUS.CANCELLED ? PAYMENT_STATUS.REFUND_REQUIRED : PAYMENT_STATUS.PAID;
    order.paidAt = order.paidAt || new Date();
    if (!wasPaid && order.status !== ORDER_STATUS.CANCELLED) {
      await grantPaymentLoyaltyPoints(order);
    }
    order.timeline.push(createTimelineEntry(order.status, `Thanh toán MoMo thành công qua ${source}`));
  } else if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    order.paymentStatus = PAYMENT_STATUS.FAILED;
    order.timeline.push(createTimelineEntry(order.status, `Thanh toán MoMo thất bại: ${payload.message}`));
  }

  await order.save();
  return order;
};

exports.createMomoPayment = async (userId, orderId) => {
  const order = await ConsultationOrder.findOne({ _id: orderId, userId });
  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu");
    error.statusCode = 404;
    throw error;
  }

  if (order.status !== ORDER_STATUS.NEW || order.paymentStatus === PAYMENT_STATUS.PAID) {
    const error = new Error("Không thể tạo lại thanh toán cho yêu cầu này");
    error.statusCode = 400;
    throw error;
  }

  const payment = await requestMomoPayment(order);
  order.timeline.push(createTimelineEntry(ORDER_STATUS.NEW, "Người dùng tạo lại phiên thanh toán MoMo"));
  await order.save();
  return { order: decorateOrder(order), payment };
};

exports.getAdminDashboard = async () => {
  const orders = await ConsultationOrder.find({});

  // Cập nhật trạng thái tự động cho các đơn mới nếu cần mà không nhất thiết phải save từng cái một ở đây
  // Việc save lẻ tẻ nên để ở getAdminOrders khi admin thực sự xem trang đó.
  // Tuy nhiên để Dashboard chính xác, ta nên tính toán dựa trên trạng thái sau khi autoConfirm giả định.

  const statusCounts = {};
  let collectedRevenue = 0;
  let pendingCOD = 0;
  let refundRequired = 0;
  let cancelRequests = 0;

  for (const order of orders) {
    // Giả lập autoConfirm để số liệu dashboard chính xác hơn
    const tempOrder = order.toObject();
    autoConfirmOrder(tempOrder);

    const status = tempOrder.status;
    const pStatus = tempOrder.paymentStatus;
    const pMethod = tempOrder.paymentMethod;

    statusCounts[status] = (statusCounts[status] || 0) + 1;

    if (pStatus === PAYMENT_STATUS.PAID) {
      collectedRevenue += tempOrder.total || 0;
    }

    if (pMethod === PAYMENT_METHOD.COD && pStatus === PAYMENT_STATUS.UNPAID) {
      pendingCOD += tempOrder.total || 0;
    }

    if (pStatus === PAYMENT_STATUS.REFUND_REQUIRED) {
      refundRequired += tempOrder.total || 0;
    }

    if (status === ORDER_STATUS.CANCEL_REQUESTED) {
      cancelRequests += 1;
    }
  }

  return {
    totalOrders: orders.length,
    statusCounts,
    collectedRevenue,
    pendingCOD,
    refundRequired,
    cancelRequests,
  };
};

exports.updatePaymentStatus = async (orderId, paymentStatus, note = "") => {
  const order = await ConsultationOrder.findById(orderId);
  if (!order) {
    const error = new Error("Không tìm thấy yêu cầu");
    error.statusCode = 404;
    throw error;
  }

  order.paymentStatus = paymentStatus;
  order.timeline.push(createTimelineEntry(order.status, note || `Admin cập nhật thanh toán: ${PAYMENT_STATUS_LABELS[paymentStatus]}`));
  await order.save();
  return decorateOrder(order);
};

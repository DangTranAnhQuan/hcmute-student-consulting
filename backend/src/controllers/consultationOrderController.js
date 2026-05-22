const crypto = require("crypto");
const ConsultationCart = require("../models/ConsultationCart");
const Counselor = require("../models/Counselor");
const CounselorReview = require("../models/CounselorReview");
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
  deleteSchedulesForOrder,
  updateSchedulesForOrderStatus,
} = require("../services/scheduleService");

const AUTO_CONFIRM_MINUTES = 30;
const AUTO_CONFIRM_MS = AUTO_CONFIRM_MINUTES * 60 * 1000;
const MOMO_PAYMENT_MINUTES = 15;
const DIRECT_CANCEL_STATUSES = [ORDER_STATUS.NEW, ORDER_STATUS.CONFIRMED];
const MONEY_READY_STATUSES = [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.PAID];
const ONLINE_SURCHARGE_RATE = 0;
const IN_PERSON_SURCHARGE_RATE = 0;

const getUserId = (req) => req.user?.id;

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
      message: "Ban tư vấn đã chuẩn bị hồ sơ, cần gửi yêu cầu hủy để admin duyệt",
    };
  }

  return {
    canCancel: false,
    mode: "NONE",
    cancelDeadlineAt: deadline,
    message: "Đơn đang xử lý hoặc đã giao/tư vấn nên không thể hủy trực tiếp",
  };
};

const toPlainOrder = (order) => (order.toObject ? order.toObject() : order);

const decorateOrder = (order, reviews = []) => {
  const value = toPlainOrder(order);
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
  };
};

const saveIfChanged = async (order, changed) => {
  if (changed) {
    await order.save();
  }
  return order;
};

const getMomoConfig = () => ({
  partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
  accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
  secretKey:
    process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
  endpoint: (() => {
    const endpoint = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn";
    return endpoint.includes("/v2/gateway/api/create")
      ? endpoint
      : `${endpoint.replace(/\/$/, "")}/v2/gateway/api/create`;
  })(),
  requestType: process.env.MOMO_REQUEST_TYPE || "captureWallet",
  apiPublicUrl: process.env.API_PUBLIC_URL || process.env.BACKEND_PUBLIC_URL,
  clientUrl: process.env.CLIENT_URL || "http://localhost:3001",
});

const assertMomoConfig = () => {
  const config = getMomoConfig();
  const missing = ["partnerCode", "accessKey", "secretKey", "apiPublicUrl"].filter(
    (key) => !config[key],
  );

  if (missing.length > 0) {
    const error = new Error(
      `Thiếu cấu hình MoMo Sandbox: ${missing.join(", ")}. API không tạo link thanh toán giả.`,
    );
    error.statusCode = 400;
    throw error;
  }

  if (typeof fetch !== "function") {
    const error = new Error("Môi trường Node.js cần hỗ trợ fetch để gọi MoMo Sandbox");
    error.statusCode = 500;
    throw error;
  }

  return config;
};

const getMomoConfigStatus = () => {
  const config = getMomoConfig();
  const missing = ["partnerCode", "accessKey", "secretKey", "apiPublicUrl"].filter(
    (key) => !config[key],
  );

  return {
    configured: missing.length === 0,
    missing,
  };
};

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

const buildMomoResultSignature = (payload, accessKey) =>
  [
    `accessKey=${accessKey}`,
    `amount=${payload.amount ?? ""}`,
    `extraData=${payload.extraData ?? ""}`,
    `message=${payload.message ?? ""}`,
    `orderId=${payload.orderId ?? ""}`,
    `orderInfo=${payload.orderInfo ?? ""}`,
    `orderType=${payload.orderType ?? ""}`,
    `partnerCode=${payload.partnerCode ?? ""}`,
    `payType=${payload.payType ?? ""}`,
    `requestId=${payload.requestId ?? ""}`,
    `responseTime=${payload.responseTime ?? ""}`,
    `resultCode=${payload.resultCode ?? ""}`,
    `transId=${payload.transId ?? ""}`,
  ].join("&");

const verifyMomoResultSignature = (payload) => {
  const config = getMomoConfig();
  if (!payload.signature || !config.accessKey || !config.secretKey) return false;
  const rawSignature = buildMomoResultSignature(payload, config.accessKey);
  const expected = signMomoRaw(rawSignature, config.secretKey);
  return expected === payload.signature;
};

const requestMomoPayment = async (order) => {
  const config = assertMomoConfig();
  const requestId = `${order.orderCode}_${Date.now()}`;
  const momoOrderId = `${order.orderCode}_${Date.now()}`;
  const amount = Math.round(order.total);
  const orderInfo = `Thanh toán yêu cầu tư vấn ${order.orderCode}`;
  const extraData = Buffer.from(
    JSON.stringify({ orderId: order._id?.toString(), orderCode: order.orderCode }),
  ).toString("base64");
  const apiPublicUrl = config.apiPublicUrl.replace(/\/$/, "");
  const clientUrl = config.clientUrl.replace(/\/$/, "");

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
  order.paymentExpiresAt = new Date(Date.now() + MOMO_PAYMENT_MINUTES * 60 * 1000);
  order.paymentStatus = PAYMENT_STATUS.PENDING;

  return {
    payUrl: data.payUrl,
    deeplink: data.deeplink,
    qrCodeUrl: data.qrCodeUrl,
    expiresAt: order.paymentExpiresAt,
    clientReturnUrl: `${clientUrl}/consultation-orders/${order._id}`,
  };
};

const handleMomoResult = async (payload, source = "return") => {
  if (!verifyMomoResultSignature(payload)) {
    const error = new Error("Chữ ký MoMo không hợp lệ");
    error.statusCode = 400;
    throw error;
  }

  const order = await ConsultationOrder.findOne({ momoOrderId: payload.orderId });
  if (!order) {
    const error = new Error("Không tìm thấy đơn theo mã MoMo");
    error.statusCode = 404;
    throw error;
  }

  const resultCode = Number(payload.resultCode);
  order.momoResultCode = Number.isNaN(resultCode) ? null : resultCode;
  order.momoMessage = payload.message || "";
  order.momoTransactionId = payload.transId ? String(payload.transId) : "";

  if (resultCode === 0) {
    const wasPaid = order.paymentStatus === PAYMENT_STATUS.PAID;
    order.paymentStatus =
      order.status === ORDER_STATUS.CANCELLED
        ? PAYMENT_STATUS.REFUND_REQUIRED
        : PAYMENT_STATUS.PAID;
    order.paidAt = order.paidAt || new Date();
    if (!wasPaid) {
      order.timeline.push(
        createTimelineEntry(
          order.status,
          order.status === ORDER_STATUS.CANCELLED
            ? `MoMo ghi nhận thanh toán sau khi yêu cầu đã hủy qua ${source}, cần hoàn tiền`
            : `Thanh toán MoMo thành công qua ${source}`,
        ),
      );
    }
  } else if (order.paymentStatus !== PAYMENT_STATUS.PAID) {
    order.paymentStatus = PAYMENT_STATUS.FAILED;
    order.timeline.push(
      createTimelineEntry(
        order.status,
        `Thanh toán MoMo thất bại/hủy: ${payload.message || resultCode}`,
      ),
    );
  }

  await order.save();
  return order;
};

const removeSelectedCartItems = async (cart, selectedIds) => {
  const selectedSet = new Set(selectedIds.map(String));
  cart.items = cart.items.filter((item) => !selectedSet.has(item._id.toString()));
  await cart.save();
};

const buildOrderItems = (items) =>
  items.map((item) => {
    const counselor = item.counselorId;
    const durationMinutes = Number(item.durationMinutes || 60);
    const basePrice = calculateConsultationPrice(
      counselor.hourlyRate,
      durationMinutes,
      item.meetingType,
    );
    return {
      counselorId: counselor._id,
      counselorName: counselor.fullName,
      expertise: counselor.expertise || [],
      topic: item.topic,
      preferredDate: item.preferredDate,
      durationMinutes,
      meetingType: item.meetingType,
      note: item.note,
      price: Math.max(0, Number(item.price || basePrice || 0)),
    };
  });

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

const normalizeContactInfo = (body = {}) => ({
  fullName: String(body.fullName || "").trim(),
  phone: String(body.phone || "").trim(),
  email: String(body.email || "").trim(),
  studentCode: String(body.studentCode || "").trim(),
  note: String(body.note || "").trim(),
});

exports.checkout = async (req, res) => {
  try {
    const userId = getUserId(req);
    const {
      selectedItemIds,
      paymentMethod = PAYMENT_METHOD.COD,
      contactInfo = {},
    } = req.body;

    if (!Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
      return res.status(400).json({ message: "Phương thức thanh toán không hợp lệ" });
    }

    const contact = normalizeContactInfo(contactInfo);
    if (!contact.fullName || !contact.phone) {
      return res.status(400).json({ message: "Vui lòng nhập họ tên và số điện thoại" });
    }

    const cart = await ConsultationCart.findOne({ userId }).populate(
      "items.counselorId",
      "fullName expertise hourlyRate rating isActive",
    );
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Giỏ tư vấn đang trống" });
    }

    const selectedSet =
      Array.isArray(selectedItemIds) && selectedItemIds.length > 0
        ? new Set(selectedItemIds.map(String))
        : new Set(cart.items.map((item) => item._id.toString()));
    const selectedItems = cart.items.filter((item) =>
      selectedSet.has(item._id.toString()),
    );

    if (selectedItems.length === 0) {
      return res.status(400).json({ message: "Vui lòng chọn ít nhất một dịch vụ tư vấn" });
    }

    const inactiveCounselor = selectedItems.find(
      (item) => !item.counselorId || item.counselorId.isActive === false,
    );
    if (inactiveCounselor) {
      return res.status(400).json({
        message: "Có tư vấn viên không còn hoạt động, vui lòng cập nhật giỏ",
      });
    }

    const items = buildOrderItems(selectedItems);
    const slots = [];
    for (const item of items) {
      slots.push(
        await buildValidatedSlot({
          counselorId: item.counselorId,
          counselorName: item.counselorName,
          preferredDate: item.preferredDate,
        }),
      );
    }
    await assertSlotsAvailable(slots, userId);
    items.forEach((item, index) => {
      item.durationMinutes = slots[index].duration;
      item.price = calculateConsultationPrice(
        selectedItems[index].counselorId.hourlyRate,
        slots[index].duration,
        item.meetingType,
      );
    });
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const total = subtotal;

    if (paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX && total <= 0) {
      return res.status(400).json({
        message: "MoMo Sandbox yêu cầu số tiền lớn hơn 0. Dịch vụ miễn phí có thể dùng COD.",
      });
    }

    const order = new ConsultationOrder({
      userId,
      orderCode: createOrderCode(),
      items,
      contactInfo: contact,
      paymentMethod,
      paymentStatus:
        paymentMethod === PAYMENT_METHOD.COD
          ? PAYMENT_STATUS.UNPAID
          : PAYMENT_STATUS.PENDING,
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
    let attemptedScheduleCreate = false;
    try {
      attemptedScheduleCreate = true;
      await createSchedulesForOrder(order, slots);

      if (paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX) {
        payment = await requestMomoPayment(order);
      }

      await order.save();
    } catch (error) {
      if (attemptedScheduleCreate) {
        await deleteSchedulesForOrder(order);
      }
      throw error;
    }

    await removeSelectedCartItems(cart, selectedItems.map((item) => item._id));

    res.status(201).json({
      order: decorateOrder(order),
      payment,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      details: error.details,
    });
  }
};

exports.getPaymentMethods = async (req, res) => {
  const momoStatus = getMomoConfigStatus();

  res.json({
    methods: [
      {
        code: PAYMENT_METHOD.COD,
        label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.COD],
        enabled: true,
        description: "Thanh toán sau khi yêu cầu tư vấn hoàn tất.",
      },
      {
        code: PAYMENT_METHOD.MOMO_SANDBOX,
        label: PAYMENT_METHOD_LABELS[PAYMENT_METHOD.MOMO_SANDBOX],
        enabled: momoStatus.configured,
        description: momoStatus.configured
          ? "Thanh toán qua cổng MoMo Sandbox."
          : `Chưa cấu hình MoMo Sandbox: ${momoStatus.missing.join(", ")}.`,
      },
    ],
  });
};

exports.createMomoPayment = async (req, res) => {
  try {
    const order = await ConsultationOrder.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    expireMomoPaymentIfNeeded(order);

    if (order.paymentMethod !== PAYMENT_METHOD.MOMO_SANDBOX) {
      return res.status(400).json({ message: "Yêu cầu này không dùng MoMo Sandbox" });
    }
    if (order.status !== ORDER_STATUS.NEW) {
      return res.status(400).json({ message: "Chỉ tạo lại thanh toán khi yêu cầu còn ở trạng thái mới" });
    }
    if (order.paymentStatus === PAYMENT_STATUS.PAID) {
      return res.status(400).json({ message: "Yêu cầu đã thanh toán" });
    }
    if (order.total <= 0) {
      return res.status(400).json({ message: "Số tiền thanh toán phải lớn hơn 0" });
    }

    const payment = await requestMomoPayment(order);
    order.timeline.push(
      createTimelineEntry(ORDER_STATUS.NEW, "Người dùng tạo lại phiên thanh toán MoMo"),
    );
    await order.save();

    res.json({ order: decorateOrder(order), payment });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      details: error.details,
    });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await ConsultationOrder.find({ userId: getUserId(req) }).sort({
      createdAt: -1,
    });

    for (const order of orders) {
      const changed = autoConfirmOrder(order);
      await saveIfChanged(order, changed || order.isModified("paymentStatus"));
      if (changed) await syncSchedulesAfterOrderStatusChange(order);
    }

    res.json({ data: orders.map(decorateOrder) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const order = await ConsultationOrder.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    const changed = autoConfirmOrder(order);
    await saveIfChanged(order, changed || order.isModified("paymentStatus"));
    if (changed) await syncSchedulesAfterOrderStatusChange(order);

    const reviews = await CounselorReview.find({
      consultationOrderId: order._id,
    }).sort({ itemIndex: 1 });

    res.json(decorateOrder(order, reviews));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.reviewOrderItem = async (req, res) => {
  try {
    const itemIndex = Number(req.params.itemIndex);
    if (!Number.isInteger(itemIndex) || itemIndex < 0) {
      return res.status(400).json({ message: "Mục đánh giá không hợp lệ" });
    }

    const order = await ConsultationOrder.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    if (order.status !== ORDER_STATUS.COMPLETED) {
      return res.status(400).json({
        message: "Chỉ được đánh giá sau khi yêu cầu tư vấn đã hoàn tất",
      });
    }

    const item = order.items[itemIndex];
    if (!item) {
      return res.status(404).json({ message: "Không tìm thấy mục tư vấn cần đánh giá" });
    }

    const rating = Number(req.body.rating);
    const comment = String(req.body.comment || "").trim();
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Đánh giá phải nằm trong khoảng 1 đến 5" });
    }

    const review = await CounselorReview.findOneAndUpdate(
      {
        consultationOrderId: order._id,
        itemIndex,
      },
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

    const reviews = await CounselorReview.find({
      consultationOrderId: order._id,
    }).sort({ itemIndex: 1 });

    res.json({
      review,
      order: decorateOrder(order, reviews),
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await ConsultationOrder.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });
    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    const changed = autoConfirmOrder(order);
    const reason = String(req.body.reason || "").trim();
    if (reason.length < 6) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy rõ ràng" });
    }

    const policy = getCancelPolicy(order);
    if (!policy.canCancel) {
      if (changed || order.isModified("paymentStatus")) await order.save();
      return res.status(400).json({ message: policy.message });
    }

    if (policy.mode === "DIRECT") {
      order.status = ORDER_STATUS.CANCELLED;
      order.cancelledAt = new Date();
      order.cancelReason = reason;
      if (isPaidOnlineOrder(order)) {
        order.paymentStatus = PAYMENT_STATUS.REFUND_REQUIRED;
      } else if (order.paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX) {
        order.paymentStatus = PAYMENT_STATUS.CANCELLED;
      }
      order.timeline.push(
        createTimelineEntry(
          ORDER_STATUS.CANCELLED,
          `Người dùng hủy yêu cầu: ${reason}`,
        ),
      );
    } else if (policy.mode === "REQUEST") {
      order.cancelRequestFromStatus = order.status;
      order.status = ORDER_STATUS.CANCEL_REQUESTED;
      order.cancelRequestedAt = new Date();
      order.cancelReason = reason;
      order.timeline.push(
        createTimelineEntry(
          ORDER_STATUS.CANCEL_REQUESTED,
          `Người dùng gửi yêu cầu hủy, chờ admin xác nhận: ${reason}`,
        ),
      );
    }

    await order.save();
    if (policy.mode === "DIRECT") {
      await cancelSchedulesForOrder(order, reason, "user");
    }
    res.json(decorateOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const {
      status,
      paymentStatus,
      paymentMethod,
      search,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      sortBy = "latest",
    } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    if (search) {
      const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { orderCode: regex },
        { "contactInfo.fullName": regex },
        { "contactInfo.phone": regex },
        { "contactInfo.email": regex },
        { "contactInfo.studentCode": regex },
      ];
    }
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = from;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = to;
      }
    }
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

    const orders = await ConsultationOrder.find(filter)
      .populate("userId", "username fullName email phone")
      .sort(sortOptions[sortBy] || sortOptions.latest);

    for (const order of orders) {
      const changed = autoConfirmOrder(order);
      await saveIfChanged(order, changed || order.isModified("paymentStatus"));
      if (changed) await syncSchedulesAfterOrderStatusChange(order);
    }

    res.json({ data: orders.map(decorateOrder) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const orders = await ConsultationOrder.find({});
    for (const order of orders) {
      const changed = autoConfirmOrder(order);
      await saveIfChanged(order, changed || order.isModified("paymentStatus"));
      if (changed) await syncSchedulesAfterOrderStatusChange(order);
    }

    const statusCounts = Object.values(ORDER_STATUS).reduce((result, status) => {
      result[status] = orders.filter((order) => order.status === status).length;
      return result;
    }, {});
    const paymentCounts = Object.values(PAYMENT_STATUS).reduce((result, status) => {
      result[status] = orders.filter((order) => order.paymentStatus === status).length;
      return result;
    }, {});
    const collectedRevenue = orders
      .filter((order) => order.paymentStatus === PAYMENT_STATUS.PAID)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingCOD = orders
      .filter(
        (order) =>
          order.paymentMethod === PAYMENT_METHOD.COD &&
          order.status !== ORDER_STATUS.CANCELLED &&
          order.paymentStatus === PAYMENT_STATUS.UNPAID,
      )
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
    const refundRequired = orders
      .filter((order) => order.paymentStatus === PAYMENT_STATUS.REFUND_REQUIRED)
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    res.json({
      totalOrders: orders.length,
      statusCounts,
      paymentCounts,
      collectedRevenue,
      pendingCOD,
      refundRequired,
      cancelRequests: statusCounts[ORDER_STATUS.CANCEL_REQUESTED] || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const allowedTransitions = {
  [ORDER_STATUS.NEW]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.CANCEL_REQUESTED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.CANCEL_REQUESTED]: [ORDER_STATUS.CANCELLED, ORDER_STATUS.PREPARING],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
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
    [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.PROCESSING].includes(
      order.status,
    )
  ) {
    await updateSchedulesForOrderStatus(order, "confirmed");
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note = "" } = req.body;
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const order = await ConsultationOrder.findById(req.params.id).populate(
      "userId",
      "username fullName email phone",
    );
    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    const changed = autoConfirmOrder(order);
    if (changed) await order.save();

    const transitions = allowedTransitions[order.status] || [];
    if (!transitions.includes(status)) {
      return res.status(400).json({
        message: `Không thể chuyển từ ${ORDER_STATUS_LABELS[order.status]} sang ${ORDER_STATUS_LABELS[status]}`,
      });
    }

    if (
      [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PREPARING, ORDER_STATUS.PROCESSING].includes(
        status,
      ) &&
      !canAdminProcessPayment(order)
    ) {
      return res.status(400).json({
        message: "Đơn MoMo chưa thanh toán thành công nên không được xác nhận/xử lý",
      });
    }

    if (order.status === ORDER_STATUS.CANCEL_REQUESTED && status === ORDER_STATUS.PREPARING) {
      const restoredStatus = order.cancelRequestFromStatus || ORDER_STATUS.PREPARING;
      order.status = restoredStatus;
      order.cancelRequestFromStatus = "";
      order.timeline.push(
        createTimelineEntry(
          restoredStatus,
          note || "Admin từ chối yêu cầu hủy và tiếp tục xử lý",
        ),
      );
    } else {
      order.status = status;
      if (status === ORDER_STATUS.CONFIRMED) order.confirmedAt = new Date();
      if (status === ORDER_STATUS.PREPARING) order.preparingAt = new Date();
      if (status === ORDER_STATUS.PROCESSING) order.processingAt = new Date();
      if (status === ORDER_STATUS.COMPLETED) {
        order.completedAt = new Date();
        if (order.paymentMethod === PAYMENT_METHOD.COD) {
          order.paymentStatus = PAYMENT_STATUS.PAID;
          order.paidAt = order.paidAt || new Date();
        }
      }
      if (status === ORDER_STATUS.CANCELLED) {
        order.cancelledAt = new Date();
        if (isPaidOnlineOrder(order)) {
          order.paymentStatus = PAYMENT_STATUS.REFUND_REQUIRED;
        } else if (order.paymentMethod === PAYMENT_METHOD.MOMO_SANDBOX) {
          order.paymentStatus = PAYMENT_STATUS.CANCELLED;
        }
      }
      if (status === ORDER_STATUS.CANCEL_REQUESTED) {
        order.cancelRequestFromStatus = ORDER_STATUS.PREPARING;
        order.cancelRequestedAt = new Date();
      }
      order.timeline.push(
        createTimelineEntry(status, note || `Admin cập nhật: ${ORDER_STATUS_LABELS[status]}`),
      );
    }

    await order.save();
    await syncSchedulesAfterOrderStatusChange(order, note);
    res.json(decorateOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, note = "" } = req.body;
    if (!Object.values(PAYMENT_STATUS).includes(paymentStatus)) {
      return res.status(400).json({ message: "Trạng thái thanh toán không hợp lệ" });
    }

    const order = await ConsultationOrder.findById(req.params.id).populate(
      "userId",
      "username fullName email phone",
    );
    if (!order) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });

    const changed = autoConfirmOrder(order);
    if (changed) await order.save();

    const allowedPaymentTransitions = {
      [PAYMENT_STATUS.REFUND_REQUIRED]: [PAYMENT_STATUS.REFUNDED],
    };
    const allowed = allowedPaymentTransitions[order.paymentStatus] || [];
    if (!allowed.includes(paymentStatus)) {
      return res.status(400).json({
        message: `Không thể chuyển thanh toán từ ${PAYMENT_STATUS_LABELS[order.paymentStatus]} sang ${PAYMENT_STATUS_LABELS[paymentStatus]}`,
      });
    }

    order.paymentStatus = paymentStatus;
    order.timeline.push(
      createTimelineEntry(
        order.status,
        note || `Admin cập nhật thanh toán: ${PAYMENT_STATUS_LABELS[paymentStatus]}`,
      ),
    );
    await order.save();

    res.json(decorateOrder(order));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.momoReturn = async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:3001").replace(
    /\/$/,
    "",
  );

  try {
    const order = await handleMomoResult(req.query, "return");
    return res.redirect(
      `${clientUrl}/consultation-orders/${order._id}?momoResult=${req.query.resultCode}`,
    );
  } catch (error) {
    return res.redirect(
      `${clientUrl}/consultation-orders?momoResult=error&message=${encodeURIComponent(
        error.message,
      )}`,
    );
  }
};

exports.momoIpn = async (req, res) => {
  try {
    await handleMomoResult(req.body, "ipn");
    res.json({ resultCode: 0, message: "Received" });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      resultCode: 1,
      message: error.message,
    });
  }
};

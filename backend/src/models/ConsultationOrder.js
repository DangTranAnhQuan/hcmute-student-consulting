const mongoose = require("mongoose");

const ORDER_STATUS = {
  NEW: "NEW",
  CONFIRMED: "CONFIRMED",
  PREPARING: "PREPARING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  CANCEL_REQUESTED: "CANCEL_REQUESTED",
};

const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.NEW]: "Yêu cầu mới",
  [ORDER_STATUS.CONFIRMED]: "Đã xác nhận",
  [ORDER_STATUS.PREPARING]: "Đang chuẩn bị hồ sơ",
  [ORDER_STATUS.PROCESSING]: "Đang tư vấn/đang xử lý",
  [ORDER_STATUS.COMPLETED]: "Đã hoàn tất",
  [ORDER_STATUS.CANCELLED]: "Đã hủy",
  [ORDER_STATUS.CANCEL_REQUESTED]: "Gửi yêu cầu hủy",
};

const PAYMENT_METHOD = {
  COD: "COD",
  MOMO_SANDBOX: "MOMO_SANDBOX",
};

const PAYMENT_STATUS = {
  UNPAID: "UNPAID",
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  EXPIRED: "EXPIRED",
  CANCELLED: "CANCELLED",
  REFUND_REQUIRED: "REFUND_REQUIRED",
  REFUNDED: "REFUNDED",
};

const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHOD.COD]: "COD - thanh toán khi hoàn tất tư vấn",
  [PAYMENT_METHOD.MOMO_SANDBOX]: "MoMo Sandbox",
};

const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUS.UNPAID]: "Chưa thanh toán",
  [PAYMENT_STATUS.PENDING]: "Chờ thanh toán",
  [PAYMENT_STATUS.PAID]: "Đã thanh toán",
  [PAYMENT_STATUS.FAILED]: "Thanh toán thất bại",
  [PAYMENT_STATUS.EXPIRED]: "Hết hạn thanh toán",
  [PAYMENT_STATUS.CANCELLED]: "Đã hủy thanh toán",
  [PAYMENT_STATUS.REFUND_REQUIRED]: "Cần xử lý hoàn tiền",
  [PAYMENT_STATUS.REFUNDED]: "Đã hoàn tiền",
};

const consultationItemSchema = new mongoose.Schema(
  {
    counselorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Counselor",
      required: true,
    },
    counselorName: {
      type: String,
      required: true,
    },
    expertise: {
      type: [String],
      default: [],
    },
    topic: {
      type: String,
      required: true,
    },
    preferredDate: {
      type: Date,
      required: true,
    },
    durationMinutes: {
      type: Number,
      default: 60,
      min: 1,
    },
    meetingType: {
      type: String,
      enum: ["online", "in-person"],
      default: "online",
    },
    note: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false },
);

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const contactSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, default: "", trim: true },
    studentCode: { type: String, default: "", trim: true },
    note: { type: String, default: "", trim: true },
  },
  { _id: false },
);

const consultationOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [consultationItemSchema],
      required: true,
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Consultation order must have at least one item",
      },
    },
    contactInfo: contactSchema,
    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      default: PAYMENT_METHOD.COD,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.UNPAID,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.NEW,
      index: true,
    },
    timeline: {
      type: [timelineSchema],
      default: [],
    },
    confirmedAt: { type: Date, default: null },
    preparingAt: { type: Date, default: null },
    processingAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelRequestedAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },
    cancelRequestFromStatus: { type: String, default: "" },
    paymentExpiresAt: { type: Date, default: null },
    paidAt: { type: Date, default: null },
    momoRequestId: { type: String, default: "" },
    momoOrderId: { type: String, default: "" },
    momoPayUrl: { type: String, default: "" },
    momoResultCode: { type: Number, default: null },
    momoMessage: { type: String, default: "" },
    momoTransactionId: { type: String, default: "" },
  },
  { timestamps: true },
);

consultationOrderSchema.index({ userId: 1, createdAt: -1 });
consultationOrderSchema.index({ momoOrderId: 1 });

module.exports = {
  ConsultationOrder: mongoose.model(
    "ConsultationOrder",
    consultationOrderSchema,
  ),
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
};

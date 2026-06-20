const consultationOrderService = require("../services/consultationOrderService");
const { PAYMENT_METHOD, PAYMENT_METHOD_LABELS } = require("../models/ConsultationOrder");

const getUserId = (req) => req.user?.id;

exports.checkout = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await consultationOrderService.checkout(userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
      details: error.details,
    });
  }
};

exports.getPaymentMethods = async (req, res) => {
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
        enabled: !!process.env.MOMO_PARTNER_CODE,
        description: "Thanh toán qua cổng MoMo Sandbox.",
      },
    ],
  });
};

exports.getOrders = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await consultationOrderService.getOrders(userId, req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrderDetail = async (req, res) => {
  try {
    const userId = getUserId(req);
    const order = await consultationOrderService.getOrderDetail(userId, req.params.id);
    res.json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = getUserId(req);
    const reason = String(req.body.reason || "").trim();
    if (reason.length < 6) {
      return res.status(400).json({ message: "Vui lòng nhập lý do hủy rõ ràng" });
    }

    const order = await consultationOrderService.cancelOrder(userId, req.params.id, reason);
    res.json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAdminOrders = async (req, res) => {
  try {
    const result = await consultationOrderService.getAdminOrders(req.query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await consultationOrderService.updateOrderStatus(req.params.id, status, note);
    res.json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, note } = req.body;
    const order = await consultationOrderService.updatePaymentStatus(req.params.id, paymentStatus, note);
    res.json(order);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getRewardHistory = async (req, res) => {
  try {
    const userId = getUserId(req);
    const history = await consultationOrderService.getRewardHistory(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMomoPayment = async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await consultationOrderService.createMomoPayment(userId, req.params.id);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.reviewOrderItem = async (req, res) => {
  try {
    const userId = getUserId(req);
    const itemIndex = Number(req.params.itemIndex);
    const { rating, comment } = req.body;
    const result = await consultationOrderService.reviewOrderItem(userId, req.params.id, itemIndex, rating, comment);
    res.json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({ message: error.message });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const stats = await consultationOrderService.getAdminDashboard();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.momoReturn = async (req, res) => {
  const clientUrl = (process.env.CLIENT_URL || "http://localhost:3001").replace(/\/$/, "");
  try {
    const order = await consultationOrderService.handleMomoResult(req.query, "return");
    return res.redirect(`${clientUrl}/consultation-orders/${order._id}?momoResult=${req.query.resultCode}`);
  } catch (error) {
    return res.redirect(`${clientUrl}/consultation-orders?momoResult=error&message=${encodeURIComponent(error.message)}`);
  }
};

exports.momoIpn = async (req, res) => {
  try {
    await consultationOrderService.handleMomoResult(req.body, "ipn");
    res.json({ resultCode: 0, message: "Received" });
  } catch (error) {
    res.status(error.statusCode || 500).json({ resultCode: 1, message: error.message });
  }
};

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/consultationOrderController");
const { verifyToken, verifyAdmin } = require("../middleware/auth");

router.get("/momo/return", orderController.momoReturn);
router.post("/momo/ipn", orderController.momoIpn);

router.get(
  "/admin/dashboard",
  verifyToken,
  verifyAdmin,
  orderController.getAdminDashboard,
);
router.get("/admin/all", verifyToken, verifyAdmin, orderController.getAdminOrders);
router.put(
  "/admin/:id/status",
  verifyToken,
  verifyAdmin,
  orderController.updateOrderStatus,
);
router.put(
  "/admin/:id/payment",
  verifyToken,
  verifyAdmin,
  orderController.updatePaymentStatus,
);

router.post("/checkout", verifyToken, orderController.checkout);
router.get("/payment-methods", verifyToken, orderController.getPaymentMethods);
router.get("/rewards/history", verifyToken, orderController.getRewardHistory);
router.get("/", verifyToken, orderController.getOrders);
router.get("/:id", verifyToken, orderController.getOrderDetail);
router.post("/:id/pay/momo", verifyToken, orderController.createMomoPayment);
router.post("/:id/cancel", verifyToken, orderController.cancelOrder);
router.post(
  "/:id/items/:itemIndex/review",
  verifyToken,
  orderController.reviewOrderItem,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/consultationCartController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, cartController.getCart);
router.post("/items", verifyToken, cartController.addItem);
router.put("/items/:itemId", verifyToken, cartController.updateItem);
router.delete("/items/:itemId", verifyToken, cartController.removeItem);
router.delete("/", verifyToken, cartController.clearCart);

module.exports = router;

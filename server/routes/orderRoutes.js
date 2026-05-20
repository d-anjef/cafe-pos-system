const express = require("express");
const router = express.Router();
const {
  createOrUpdateOrder,
  completeOrder,
  getActiveOrders,
  getActiveOrderByTable,
  updateItemStatus,
  requestBill,
  getCompletedOrders
} = require("../controllers/orderController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createOrUpdateOrder);
router.put("/request-bill", protect, requestBill);
router.put("/item-status", protect, updateItemStatus);
router.put("/:id/complete", protect, completeOrder);
router.get("/active", protect, getActiveOrders);
router.get("/completed", protect, getCompletedOrders);
router.get("/active-by-table/:tableId", protect, getActiveOrderByTable);

module.exports = router;

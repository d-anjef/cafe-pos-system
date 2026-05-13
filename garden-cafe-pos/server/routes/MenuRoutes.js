const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability
} = require("../controllers/menuController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/item", protect, getMenuItems);
router.post("/item", protect, authorize("admin"), createMenuItem);
router.put("/item/:id", protect, authorize("admin"), updateMenuItem);
router.delete("/item/:id", protect, authorize("admin"), deleteMenuItem);
router.put("/item/:id/toggle", protect, authorize("admin"), toggleAvailability);

module.exports = router;
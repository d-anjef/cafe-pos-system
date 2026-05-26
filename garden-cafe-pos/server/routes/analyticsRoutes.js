const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ Allow owner, admin, branch_manager
router.get(
  "/dashboard",
  protect,
  authorize("super_admin", "owner", "admin", "branch_manager"),
  getDashboardAnalytics
);

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  releaseTable
} = require("../controllers/tableController");
const { protect, authorize } = require("../middleware/authMiddleware");

const MANAGEMENT = ["super_admin", "owner", "admin", "branch_manager"];

router.get("/", protect, getTables);
router.post("/", protect, authorize(...MANAGEMENT), createTable);
router.put("/:id", protect, authorize(...MANAGEMENT), updateTable);
router.delete("/:id", protect, authorize(...MANAGEMENT), deleteTable);
router.put("/:id/release", protect, authorize(...MANAGEMENT), releaseTable);

module.exports = router;
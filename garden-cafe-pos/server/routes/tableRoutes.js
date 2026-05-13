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

router.get("/", protect, getTables);
router.post("/", protect, authorize("admin"), createTable);
router.put("/:id", protect, authorize("admin"), updateTable);
router.delete("/:id", protect, authorize("admin"), deleteTable);
router.put("/:id/release", protect, authorize("admin"), releaseTable);

module.exports = router;
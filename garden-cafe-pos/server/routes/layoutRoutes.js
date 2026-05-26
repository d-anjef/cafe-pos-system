const express = require("express");
const router = express.Router();
const { getLayout, saveLayout } = require("../controllers/layoutController");
const { protect, authorize } = require("../middleware/authMiddleware");

const MANAGEMENT = ["super_admin", "owner", "admin", "branch_manager"];

router.get("/", protect, getLayout);
router.post("/", protect, authorize(...MANAGEMENT), saveLayout);

module.exports = router;
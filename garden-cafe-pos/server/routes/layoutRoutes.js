const express = require("express");
const router = express.Router();
const { getLayout, saveLayout } = require("../controllers/layoutController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, getLayout);
router.post("/", protect, authorize("admin"), saveLayout);

module.exports = router;
const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");

const MANAGEMENT = ["super_admin", "owner", "admin", "branch_manager"];

// ============================================================
// MENU ITEMS
// ============================================================

// GET all menu items for current org
router.get("/item", protect, async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const items = await MenuItem.find({ organization: orgId, isActive: true })
      .sort({ category: 1, name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET today's specials
router.get("/specials", protect, async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const items = await MenuItem.find({
      organization: orgId,
      isActive: true,
      isTodaysSpecial: true,
      isAvailable: true
    }).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE menu item
router.post("/item", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    const item = await MenuItem.create({
      ...req.body,
      organization: orgId,
      branches: req.user.branches?.map(b => b._id || b) || []
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE menu item
router.put("/item/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE menu item
router.delete("/item/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const item = await MenuItem.findOneAndDelete({
      _id: req.params.id,
      organization: orgId
    });
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE availability
router.put("/item/:id/toggle", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const item = await MenuItem.findOne({ _id: req.params.id, organization: orgId });
    if (!item) return res.status(404).json({ message: "Not found" });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TOGGLE today's special
router.put("/item/:id/special", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const item = await MenuItem.findOne({ _id: req.params.id, organization: orgId });
    if (!item) return res.status(404).json({ message: "Not found" });
    item.isTodaysSpecial = !item.isTodaysSpecial;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ============================================================
// CATEGORIES
// ============================================================

// GET all categories
router.get("/categories", protect, async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const cats = await Category.find({ organization: orgId, isActive: true })
      .sort({ displayOrder: 1, name: 1 });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE category
router.post("/categories", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const cat = await Category.create({
      ...req.body,
      organization: orgId
    });
    res.status(201).json(cat);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(400).json({ message: err.message });
  }
});

// UPDATE category
router.put("/categories/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const cat = await Category.findOneAndUpdate(
      { _id: req.params.id, organization: orgId },
      req.body,
      { new: true }
    );
    if (!cat) return res.status(404).json({ message: "Category not found" });
    res.json(cat);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE category
router.delete("/categories/:id", protect, authorize(...MANAGEMENT), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    // Check if any menu items use this category
    const cat = await Category.findOne({ _id: req.params.id, organization: orgId });
    if (!cat) return res.status(404).json({ message: "Not found" });

    const itemCount = await MenuItem.countDocuments({
      organization: orgId,
      category: cat.name
    });

    if (itemCount > 0) {
      return res.status(400).json({
        message: `Cannot delete. ${itemCount} menu items use this category. Move them first.`
      });
    }

    await cat.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
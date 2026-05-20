const MenuItem = require("../models/MenuItem");

// ✅ GET ALL ITEMS
exports.getMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.find().sort({ category: 1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ CREATE ITEM
exports.createMenuItem = async (req, res) => {
  try {
    const { name, price, category } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price required" });
    }

    const item = await MenuItem.create({ name, price, category });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ UPDATE ITEM
exports.updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ DELETE ITEM
exports.deleteMenuItem = async (req, res) => {
  try {
    await MenuItem.findByIdAndDelete(req.params.id);
    res.json({ message: "Item deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ TOGGLE AVAILABILITY
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
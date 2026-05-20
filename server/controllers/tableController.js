const Table = require("../models/Table");

// ✅ GET ALL TABLES
exports.getTables = async (req, res) => {
  try {
    const tables = await Table.find().sort({ tableNumber: 1 });
    res.json(tables);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ CREATE TABLE
exports.createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    if (!tableNumber || !capacity) {
      return res.status(400).json({ message: "Table number and capacity required" });
    }

    const exists = await Table.findOne({ tableNumber });
    if (exists) {
      return res.status(400).json({ message: "Table number already exists" });
    }

    const table = await Table.create({ tableNumber, capacity });

    const io = req.app.get("io");
    io.emit("table:update", table);

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ UPDATE TABLE
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const io = req.app.get("io");
    io.emit("table:update", table);

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ DELETE TABLE
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (table.status !== "available") {
      return res.status(400).json({ message: "Cannot delete occupied table" });
    }

    await Table.findByIdAndDelete(req.params.id);
    res.json({ message: "Table deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ RELEASE TABLE (Admin)
exports.releaseTable = async (req, res) => {
  try {
    const table = await Table.findByIdAndUpdate(
      req.params.id,
      { status: "available", activeOrder: null },
      { new: true }
    );

    const io = req.app.get("io");
    io.emit("table:update", table);

    res.json(table);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
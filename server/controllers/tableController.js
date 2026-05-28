const Table = require("../models/Table");
const Branch = require("../models/Branch");

// ============================================================
// Helper: get user's org ID (handles populated object OR raw ID)
// ============================================================
const getUserOrgId = (user) => {
  if (!user.organization) return null;
  // If populated, it's an object with _id
  // If not populated, it's just an ObjectId
  return user.organization._id
    ? user.organization._id.toString()
    : user.organization.toString();
};

// ============================================================
// ✅ GET TABLES
// ============================================================
exports.getTables = async (req, res) => {
  try {
    const { branchId } = req.query;

    if (!branchId) {
      return res.status(400).json({ message: "branchId is required" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const userOrgId = getUserOrgId(req.user);

    if (
      req.user.role !== "super_admin" &&
      branch.organization.toString() !== userOrgId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const tables = await Table.find({
      branch: branchId,
      organization: branch.organization
    }).sort({ tableNumber: 1 });

    res.json(tables);
  } catch (error) {
    console.error("getTables error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ============================================================
// ✅ CREATE TABLE
// ============================================================
exports.createTable = async (req, res) => {
  try {
    const { branchId, tableNumber, capacity, floor, section } = req.body;

    if (!branchId || !tableNumber || !capacity) {
      return res
        .status(400)
        .json({ message: "branchId, tableNumber, and capacity are required" });
    }

    const branch = await Branch.findById(branchId);
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    const userOrgId = getUserOrgId(req.user);

    if (
      req.user.role !== "super_admin" &&
      branch.organization.toString() !== userOrgId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const exists = await Table.findOne({
      branch: branchId,
      tableNumber: String(tableNumber)
    });
    if (exists) {
      return res
        .status(400)
        .json({ message: `Table ${tableNumber} already exists in this branch` });
    }

    const table = await Table.create({
      organization: branch.organization,
      branch: branchId,
      tableNumber: String(tableNumber),
      capacity: Number(capacity),
      floor: floor || undefined,
      section: section || undefined,
      status: "available"
    });

    const io = req.app.get("io");
    if (io) {
      io.to(`branch_${branchId}`).emit("table:update", table);
    }

    res.status(201).json(table);
  } catch (error) {
    console.error("createTable error:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "Table number already exists in this branch" });
    }

    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ============================================================
// ✅ UPDATE TABLE
// ============================================================
exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const userOrgId = getUserOrgId(req.user);

    if (
      req.user.role !== "super_admin" &&
      table.organization.toString() !== userOrgId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { organization, branch, ...allowedUpdates } = req.body;

    const updated = await Table.findByIdAndUpdate(
      req.params.id,
      allowedUpdates,
      { new: true, runValidators: true }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`branch_${updated.branch}`).emit("table:update", updated);
    }

    res.json(updated);
  } catch (error) {
    console.error("updateTable error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ============================================================
// ✅ DELETE TABLE
// ============================================================
exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const userOrgId = getUserOrgId(req.user);

    if (
      req.user.role !== "super_admin" &&
      table.organization.toString() !== userOrgId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    if (table.status !== "available") {
      return res
        .status(400)
        .json({ message: "Cannot delete occupied table. Release it first." });
    }

    const branchId = table.branch;
    await Table.findByIdAndDelete(req.params.id);

    const io = req.app.get("io");
    if (io) {
      io.to(`branch_${branchId}`).emit("table:deleted", { _id: req.params.id });
    }

    res.json({ message: "Table deleted" });
  } catch (error) {
    console.error("deleteTable error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// ============================================================
// ✅ RELEASE TABLE
// ============================================================
exports.releaseTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const userOrgId = getUserOrgId(req.user);

    if (
      req.user.role !== "super_admin" &&
      table.organization.toString() !== userOrgId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updated = await Table.findByIdAndUpdate(
      req.params.id,
      {
        status: "available",
        currentOrder: null,
        occupiedAt: null,
        currentBillAmount: 0
      },
      { new: true }
    );

    const io = req.app.get("io");
    if (io) {
      io.to(`branch_${updated.branch}`).emit("table:update", updated);
    }

    res.json(updated);
  } catch (error) {
    console.error("releaseTable error:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
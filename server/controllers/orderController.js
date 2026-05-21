const Order    = require("../models/Order");
const Table    = require("../models/Table");
const MenuItem = require("../models/MenuItem");

// ============================================================
// CREATE OR APPEND ORDER
// ============================================================
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;
    const orgId    = req.user.organization?._id || req.user.organization;
    const branchId = req.user.branches?.[0]?._id || req.user.branches?.[0];

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    if (!branchId) {
      return res.status(400).json({ message: "No branch assigned to user" });
    }

    const table = await Table.findOne({ _id: tableId, organization: orgId });
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (table.status === "bill_requested") {
      return res.status(400).json({ message: "Cannot add items after bill is requested" });
    }

    // Format items with variant support
    const formattedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        _id: item.itemId,
        organization: orgId
      });

      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found: ${item.itemId}` });
      }

      formattedItems.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        displayName: item.displayName || menuItem.name,
        variants: item.variants || [],
        price: item.price || menuItem.price,
        quantity: item.quantity,
        status: "pending"
      });
    }

    // Find or create active order
    let order = await Order.findOne({
      table: tableId,
      organization: orgId,
      status: "active"
    });

    if (!order) {
      order = await Order.create({
        organization: orgId,
        branch: branchId,
        table: tableId,
        items: formattedItems,
        createdBy: req.user._id,
        waiters: [req.user._id]
      });

      await Table.findByIdAndUpdate(tableId, {
        status: "occupied",
        activeOrder: order._id
      });
    } else {
      order.items.push(...formattedItems);
      if (!order.waiters.includes(req.user._id)) {
        order.waiters.push(req.user._id);
      }
      await order.save();
    }

    // Populate before sending
    const populatedOrder = await Order.findById(order._id).populate("table");
    const updatedTable  = await Table.findById(tableId);

    // ✅ Emit to branch room only
    const io = req.app.get("io");
    const branchRoom = `branch_${branchId}`;

    io.to(branchRoom).emit("order:new", populatedOrder);
    io.to(branchRoom).emit("table:update", updatedTable);

    res.json(populatedOrder);

  } catch (error) {
    console.error("ORDER ERROR:", error);
    res.status(500).json({ message: error.message || "Order creation failed" });
  }
};

// ============================================================
// REQUEST BILL
// ============================================================
exports.requestBill = async (req, res) => {
  try {
    const { tableId } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    const table = await Table.findOne({ _id: tableId, organization: orgId });
    if (!table) return res.status(404).json({ message: "Table not found" });

    if (table.status !== "occupied") {
      return res.status(400).json({ message: "Table must be occupied" });
    }

    table.status = "bill_requested";
    await table.save();

    // ✅ Emit to branch room
    const io = req.app.get("io");
    io.to(`branch_${table.branch}`).emit("table:update", table);

    res.json({ message: "Bill requested", table });
  } catch (error) {
    console.error("BILL REQUEST ERROR:", error);
    res.status(500).json({ message: "Failed to request bill" });
  }
};

// ============================================================
// COMPLETE ORDER (SETTLEMENT)
// ============================================================
exports.completeOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    const order = await Order.findOne({
      _id: req.params.id,
      organization: orgId
    }).populate("table");

    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status === "completed") {
      return res.status(400).json({ message: "Order already completed" });
    }

    order.status = "completed";
    order.completedAt = new Date();
    order.paymentMethod = paymentMethod || "cash";
    await order.save();

    await Table.findByIdAndUpdate(order.table._id, {
      status: "available",
      activeOrder: null
    });

    const updatedTable = await Table.findById(order.table._id);

    // ✅ Emit to branch room
    const io = req.app.get("io");
    const branchRoom = `branch_${order.branch}`;

    io.to(branchRoom).emit("order:completed", order);
    io.to(branchRoom).emit("table:update", updatedTable);

    res.json(order);
  } catch (error) {
    console.error("COMPLETE ORDER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ============================================================
// GET ACTIVE ORDERS (KDS)
// ============================================================
exports.getActiveOrders = async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const { branchId } = req.query;

    const query = { organization: orgId, status: "active" };
    if (branchId) query.branch = branchId;

    const orders = await Order.find(query)
      .populate("table")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ============================================================
// GET ACTIVE ORDER BY TABLE
// ============================================================
exports.getActiveOrderByTable = async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    const order = await Order.findOne({
      table: req.params.tableId,
      organization: orgId,
      status: "active"
    }).populate("table");

    if (!order) return res.status(404).json({ message: "No active order" });

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ============================================================
// UPDATE ITEM STATUS (Kitchen)
// ============================================================
exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemIndex, status } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    const order = await Order.findOne({ _id: orderId, organization: orgId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.items[itemIndex]) {
      return res.status(400).json({ message: "Invalid item index" });
    }

    order.items[itemIndex].status = status;
    if (status === "in-progress" && !order.items[itemIndex].prepStartedAt) {
      order.items[itemIndex].prepStartedAt = new Date();
    }
    if (status === "ready") {
      order.items[itemIndex].prepCompletedAt = new Date();
    }

    await order.save();

    const populated = await Order.findById(order._id).populate("table");

    // ✅ Emit to branch room
    const io = req.app.get("io");
    io.to(`branch_${order.branch}`).emit("order:update", populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ============================================================
// GET ALL COMPLETED ORDERS (Admin)
// ============================================================
exports.getCompletedOrders = async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const { branchId } = req.query;

    const query = { organization: orgId, status: "completed" };
    if (branchId) query.branch = branchId;

    const orders = await Order.find(query)
      .populate("table")
      .sort({ completedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
const Order = require("../models/Order");
const Table = require("../models/Table");
const MenuItem = require("../models/MenuItem");

const calculateTotal = (items) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

// ✅ CREATE OR APPEND ORDER
exports.createOrUpdateOrder = async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid order data" });
    }

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (table.status === "bill_requested") {
      return res.status(400).json({ message: "Cannot add items after bill is requested" });
    }

    const formattedItems = [];
    for (const item of items) {
      const menuItem = await MenuItem.findById(item.itemId);
      if (!menuItem) {
        return res.status(400).json({ message: `Menu item not found` });
      }
      formattedItems.push({
        itemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity
      });
    }

    const totalAmount = calculateTotal(formattedItems);

    let order = await Order.findOne({
      table: tableId,
      status: "active"
    });

    if (!order) {
      order = await Order.create({
        table: tableId,
        items: formattedItems,
        totalAmount,
        createdBy: req.user._id
      });

      await Table.findByIdAndUpdate(tableId, {
        status: "occupied",
        activeOrder: order._id
      });
    } else {
      order.items.push(...formattedItems);
      order.totalAmount = calculateTotal(order.items);
      await order.save();
    }

    const io = req.app.get("io");
    io.emit("order:new", order);
    io.emit("table:update", await Table.findById(tableId));

    res.json(order);

  } catch (error) {
    console.error("🔥 ORDER ERROR:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ✅ REQUEST BILL
exports.requestBill = async (req, res) => {
  try {
    const { tableId } = req.body;

    const table = await Table.findById(tableId);
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    if (table.status !== "occupied") {
      return res.status(400).json({ message: "Table must be occupied" });
    }

    table.status = "bill_requested";
    await table.save();

    const io = req.app.get("io");
    io.emit("table:update", table);

    res.json({ message: "Bill requested", table });

  } catch (error) {
    console.error("🔥 BILL REQUEST ERROR:", error);
    res.status(500).json({ message: "Failed to request bill" });
  }
};

// ✅ COMPLETE ORDER (SETTLEMENT)
exports.completeOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const order = await Order.findById(req.params.id)
      .populate("table");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

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

    const io = req.app.get("io");
    io.emit("order:completed", order);
    io.emit("table:update", updatedTable);

    res.json(order);

  } catch (error) {
    console.error("🔥 COMPLETE ORDER ERROR:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET ACTIVE ORDERS (KDS)
exports.getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "active" })
      .populate("table")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET ACTIVE ORDER BY TABLE
exports.getActiveOrderByTable = async (req, res) => {
  try {
    const order = await Order.findOne({
      table: req.params.tableId,
      status: "active"
    }).populate("table");

    if (!order) {
      return res.status(404).json({ message: "No active order" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ UPDATE ITEM STATUS (Kitchen)
exports.updateItemStatus = async (req, res) => {
  try {
    const { orderId, itemIndex, status } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.items[itemIndex].status = status;
    await order.save();

    const io = req.app.get("io");
    io.emit("order:update", order);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ GET ALL COMPLETED ORDERS (Admin)
exports.getCompletedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ status: "completed" })
      .populate("table")
      .sort({ completedAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};


const express = require("express");
const router = express.Router();
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Branch = require("../models/Branch");
const Organization = require("../models/Organization");
const Order = require("../models/Order");
const Table = require("../models/Table");

// ============================================================
// GET /api/public/menu/:branchId
// Public — customer-facing menu
// Returns: org + branch + categories + items + tables
// ============================================================
router.get("/menu/:branchId", async (req, res) => {
  try {
    const { branchId } = req.params;

    // 1. Find branch
    const branch = await Branch.findById(branchId).lean();
    if (!branch) {
      return res.status(404).json({ message: "Branch not found" });
    }

    // 2. Find organization
    const org = await Organization.findById(branch.organization).lean();
    if (!org) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // 3. Check org is active
    if (!org.isActive) {
      return res.status(403).json({
        message: "This café is currently unavailable"
      });
    }

    // 4. Check QR ordering feature is enabled
    if (!org.features.qrOrdering) {
      return res.status(403).json({
        message: "QR ordering is not enabled for this café",
        code: "QR_DISABLED"
      });
    }

    // 5. Get categories
    const categories = await Category.find({
      organization: org._id,
      isActive: true
    }).sort({ displayOrder: 1, name: 1 }).lean();

    // 6. Get available menu items
    const items = await MenuItem.find({
      organization: org._id,
      isActive: true,
      isAvailable: true
    }).sort({ category: 1, name: 1 }).lean();

    // 7. Get tables (for customer to pick from on walk-in)
    const tables = await Table.find({
      branch: branch._id
    })
      .select("_id tableNumber capacity status")
      .sort({ tableNumber: 1 })
      .lean();

    // 8. Return public-safe data
    res.json({
      org: {
        name: org.name,
        slug: org.slug,
        logo: org.logo,
        brandColor: org.brandColor,
        settings: {
          currency:      org.settings.currency,
          taxRate:       org.settings.taxRate,
          serviceCharge: org.settings.serviceCharge
        }
      },
      branch: {
        _id:  branch._id,
        name: branch.name
      },
      categories,
      items,
      tables
    });

  } catch (err) {
    console.error("Public menu error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ============================================================
// POST /api/public/orders
// Public — customer places order from QR scan
// ============================================================
router.post("/orders", async (req, res) => {
  try {
    const { branchId, tableId, items, customerNote } = req.body;

    // ── Validation ────────────────────────────────────────
    if (!branchId || !items?.length) {
      return res.status(400).json({
        message: "branchId and items are required"
      });
    }

    // ── Find branch + org ─────────────────────────────────
    const branch = await Branch.findById(branchId).lean();
    if (!branch) return res.status(404).json({ message: "Branch not found" });

    const org = await Organization.findById(branch.organization).lean();
    if (!org) return res.status(404).json({ message: "Organization not found" });

    // ── Check QR ordering enabled ─────────────────────────
    if (!org.features.qrOrdering) {
      return res.status(403).json({ message: "QR ordering not enabled" });
    }

    // ── Resolve table ─────────────────────────────────────
    // Valid tableId scenarios:
    //   real ObjectId  → dine-in at specific table
    //   "walk-in"      → customer scanned branch QR (no table chosen yet)
    //   "takeaway"     → customer wants pickup
    let resolvedTable     = null;
    let resolvedOrderType = "qr";

    if (tableId && tableId !== "walk-in" && tableId !== "takeaway") {
      // Validate the table exists + belongs to this branch
      const table = await Table.findOne({
        _id:    tableId,
        branch: branchId
      });

      if (!table) {
        return res.status(400).json({
          message: "Invalid table for this branch"
        });
      }

      resolvedTable     = table._id;
      resolvedOrderType = "dine-in";

      // Auto-mark table as occupied if currently available
      if (table.status === "available") {
        table.status = "occupied";
        await table.save();
      }
    } else if (tableId === "takeaway") {
      resolvedOrderType = "takeout";
    }
    // else: walk-in → resolvedTable stays null, type stays "qr"

    // ── Validate + enrich items from DB ───────────────────
    // SECURITY: Never trust client-sent prices
    const enrichedItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findOne({
        _id: item.menuItemId,
        organization: org._id,
        isActive: true,
        isAvailable: true
      }).lean();

      if (!menuItem) {
        return res.status(400).json({
          message: "Item not found or unavailable"
        });
      }

      let finalPrice  = menuItem.price;
      let displayName = menuItem.name;

      if (menuItem.hasVariants && item.variants?.length) {
        let variantPrice = null;
        const validatedVariants = [];

        for (const selectedVariant of item.variants) {
          const group = menuItem.variantGroups.find(
            g => g.name === selectedVariant.groupName
          );
          if (!group) continue;

          const option = group.options.find(
            o => o.name === selectedVariant.optionName
          );
          if (!option) continue;

          validatedVariants.push({
            groupName:   group.name,
            optionName:  option.name,
            optionPrice: option.price
          });

          variantPrice = option.price;
        }

        if (variantPrice !== null) finalPrice = variantPrice;

        const variantNames = validatedVariants.map(v => v.optionName);
        displayName = `${variantNames.join(" ")} ${menuItem.name}`;

        enrichedItems.push({
          menuItem:        menuItem._id,
          name:            menuItem.name,
          displayName,
          variants:        validatedVariants,
          quantity:        item.quantity || 1,
          price:           finalPrice,
          specialRequests: item.notes || "",
          status:          "pending"
        });
      } else {
        enrichedItems.push({
          menuItem:        menuItem._id,
          name:            menuItem.name,
          displayName,
          variants:        [],
          quantity:        item.quantity || 1,
          price:           finalPrice,
          specialRequests: item.notes || "",
          status:          "pending"
        });
      }
    }

    // ── Create order ──────────────────────────────────────
    const order = await Order.create({
      organization:  org._id,
      branch:        branchId,
      table:         resolvedTable,        // null for walk-in/takeaway
      items:         enrichedItems,
      status:        "active",             // matches your enum
      source:        "qr",
      orderType:     resolvedOrderType,
      customerNote:  customerNote || "",
      createdBy:     null,                 // no staff user for QR orders
      paymentStatus: "unpaid"
    });

    // ── Emit to kitchen via socket ────────────────────────
    const io = req.app.get("io");
    if (io) {
      // Populate table info before emitting
      const populatedOrder = await Order.findById(order._id)
        .populate("table", "tableNumber")
        .lean();

      io.to(`branch_${branchId}`).emit("order:new", populatedOrder);
    }

    res.status(201).json({
      success:     true,
      orderNumber: order.orderNumber,
      orderType:   resolvedOrderType,
      message:     "Order placed! Your order is being prepared."
    });

  } catch (err) {
    console.error("Public order error:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
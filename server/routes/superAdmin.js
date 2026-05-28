const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const Organization = require("../models/Organization");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Branch = require("../models/Branch");
const MenuItem = require("../models/MenuItem");
const Category = require("../models/Category");
const Table = require("../models/Table");
const Order = require("../models/Order");

const { applyPlanToOrg, PLAN_FEATURES } = require("../utils/planFeatures");

// Email
const { sendEmail } = require("../services/emailService");
const orgDeletedEmail = require("../templates/emails/orgDeletedEmail");

const SUPER = ["super_admin"];

// ============================================================
// GET /api/super-admin/stats — UNCHANGED
// ============================================================
router.get("/stats", protect, authorize(...SUPER), async (req, res) => {
  try {
    const [
      totalOrganizations,
      totalUsers,
      activeSubscriptions,
      subscriptions,
      recentOrgs,
      newOrgsRaw
    ] = await Promise.all([
      Organization.countDocuments(),
      User.countDocuments({ role: { $ne: "super_admin" } }),
      Subscription.countDocuments({ status: "active" }),
      Subscription.find({ status: "active" }),
      Organization.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("owner", "name email"),
      Organization.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%m/%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const monthlyRevenue = subscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const allOrgs = await Organization.find();
    const planDistribution = {};
    allOrgs.forEach(org => {
      const plan = org.subscription?.plan || "free";
      planDistribution[plan] = (planDistribution[plan] || 0) + 1;
    });

    res.json({
      success: true,
      totalOrganizations,
      totalUsers,
      activeSubscriptions,
      monthlyRevenue,
      planDistribution,
      recentOrgs,
      newOrgsChart: newOrgsRaw
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/super-admin/organizations — UNCHANGED
// ============================================================
router.get("/organizations", protect, authorize(...SUPER), async (req, res) => {
  try {
    const orgs = await Organization.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const orgsWithCounts = await Promise.all(
      orgs.map(async (org) => {
        const [branchCount, staffCount] = await Promise.all([
          Branch.countDocuments({ organization: org._id }),
          User.countDocuments({ organization: org._id, role: { $ne: "owner" } })
        ]);
        return { ...org.toObject(), branchCount, staffCount };
      })
    );

    res.json({ success: true, organizations: orgsWithCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/super-admin/organizations/:id — UNCHANGED
// ============================================================
router.put("/organizations/:id", protect, authorize(...SUPER), async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    );
    res.json({ success: true, organization: org });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/super-admin/organizations/:id/plan — UNCHANGED
// ============================================================
router.put("/organizations/:id/plan", protect, authorize(...SUPER), async (req, res) => {
  try {
    const { plan } = req.body;

    if (!PLAN_FEATURES[plan]) {
      return res.status(400).json({
        success: false,
        message: `Invalid plan: ${plan}`
      });
    }

    const org = await Organization.findById(req.params.id);
    if (!org) {
      return res.status(404).json({
        success: false,
        message: "Organization not found"
      });
    }

    applyPlanToOrg(org, plan);
    await org.save();

    await Subscription.findOneAndUpdate(
      { organization: req.params.id },
      { plan },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: `Plan changed to ${plan} — features auto-updated`,
      organization: org
    });
  } catch (err) {
    console.error("Change plan error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/super-admin/organizations/:id/delete-preview
// ✅ NEW — Shows what will be deleted before confirmation
// ============================================================
router.get("/organizations/:id/delete-preview", protect, authorize(...SUPER), async (req, res) => {
  try {
    const orgId = req.params.id;

    const org = await Organization.findById(orgId).populate("owner", "name email");
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Count everything that will be cascaded
    const [
      branchCount,
      userCount,
      menuItemCount,
      categoryCount,
      tableCount,
      orderCount,
      subscriptionCount
    ] = await Promise.all([
      Branch.countDocuments({ organization: orgId }),
      User.countDocuments({ organization: orgId }),
      MenuItem.countDocuments({ organization: orgId }),
      Category.countDocuments({ organization: orgId }),
      Table.countDocuments({ organization: orgId }),
      Order.countDocuments({ organization: orgId }),
      Subscription.countDocuments({ organization: orgId })
    ]);

    res.json({
      success: true,
      preview: {
        orgName: org.name,
        ownerName: org.owner?.name,
        ownerEmail: org.owner?.email,
        counts: {
          branches: branchCount,
          users: userCount,
          menuItems: menuItemCount,
          categories: categoryCount,
          tables: tableCount,
          orders: orderCount,
          subscriptions: subscriptionCount
        }
      }
    });
  } catch (err) {
    console.error("Delete preview error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// DELETE /api/super-admin/organizations/:id
// ✅ NEW — Hard delete with cascade
// Requires: confirmation === org name
// ============================================================
router.delete("/organizations/:id", protect, authorize(...SUPER), async (req, res) => {
  try {
    const orgId = req.params.id;
    const { confirmation, reason } = req.body;

    // Find org
    const org = await Organization.findById(orgId).populate("owner", "name email");
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    // Validate confirmation — must match org name exactly
    if (!confirmation || confirmation.trim() !== org.name) {
      return res.status(400).json({
        success: false,
        message: `Confirmation must match organization name exactly: "${org.name}"`
      });
    }

    // Save owner info for email BEFORE deletion
    const ownerInfo = org.owner ? {
      name: org.owner.name,
      email: org.owner.email
    } : null;
    const orgName = org.name;

    console.log(`🗑️ Deleting organization: ${orgName} (${orgId})`);

    // ── CASCADE DELETE — order matters! ──────────────────
    // Delete child data first, then parent

    const deletionStats = {};

    // 1. Orders (most dependent)
    const ordersResult = await Order.deleteMany({ organization: orgId });
    deletionStats.orders = ordersResult.deletedCount;

    // 2. Tables
    const tablesResult = await Table.deleteMany({ organization: orgId });
    deletionStats.tables = tablesResult.deletedCount;

    // 3. Menu items
    const menuResult = await MenuItem.deleteMany({ organization: orgId });
    deletionStats.menuItems = menuResult.deletedCount;

    // 4. Categories
    const catResult = await Category.deleteMany({ organization: orgId });
    deletionStats.categories = catResult.deletedCount;

    // 5. Branches
    const branchesResult = await Branch.deleteMany({ organization: orgId });
    deletionStats.branches = branchesResult.deletedCount;

    // 6. Subscriptions
    const subsResult = await Subscription.deleteMany({ organization: orgId });
    deletionStats.subscriptions = subsResult.deletedCount;

    // 7. Try to delete Layout if model exists
    try {
      const Layout = require("../models/Layout");
      const layoutResult = await Layout.deleteMany({ organization: orgId });
      deletionStats.layouts = layoutResult.deletedCount;
    } catch {
      deletionStats.layouts = 0;
    }

    // 8. Users (last, includes owner)
    const usersResult = await User.deleteMany({ organization: orgId });
    deletionStats.users = usersResult.deletedCount;

    // 9. Finally, the organization itself
    await Organization.findByIdAndDelete(orgId);

    console.log(`✅ Cascade deletion complete:`, deletionStats);

    // Send goodbye email to owner (fire and forget)
    if (ownerInfo?.email) {
      sendEmail({
        to: ownerInfo.email,
        subject: `Your NUVLYX account has been deleted — ${orgName}`,
        html: orgDeletedEmail({
          name: ownerInfo.name,
          orgName,
          deletedAt: new Date(),
          reason: reason?.trim() || null
        })
      }).catch(err => {
        console.error("Org deletion email failed:", err.message);
      });
    }

    res.json({
      success: true,
      message: `Organization "${orgName}" and all related data permanently deleted`,
      deletionStats,
      emailSent: !!ownerInfo?.email
    });

  } catch (err) {
    console.error("Delete organization error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/super-admin/subscriptions — UNCHANGED
// ============================================================
router.get("/subscriptions", protect, authorize(...SUPER), async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate("organization", "name")
      .sort({ createdAt: -1 });
    res.json({ success: true, subscriptions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/super-admin/users — UNCHANGED
// ============================================================
router.get("/users", protect, authorize(...SUPER), async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "super_admin" } })
      .populate("organization", "name slug")
      .select("-password")
      .sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// PUT /api/super-admin/users/:id — UNCHANGED
// ============================================================
router.put("/users/:id", protect, authorize(...SUPER), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
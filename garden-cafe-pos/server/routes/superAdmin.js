const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");

const Organization = require("../models/Organization");
const User = require("../models/User");
const Subscription = require("../models/Subscription");
const Branch = require("../models/Branch");

// ✅ Single source of truth
const { applyPlanToOrg, PLAN_FEATURES } = require("../utils/planFeatures");

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
// PUT /api/super-admin/organizations/:id/plan
// ✅ UPDATED — now uses applyPlanToOrg (auto-handles features)
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

    // ✅ One line — sets plan + features + limits all together
    applyPlanToOrg(org, plan);
    await org.save();

    // Mirror to Subscription record
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
      .populate("organization", "name")
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
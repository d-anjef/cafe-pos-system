const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const Branch = require("../models/Branch");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");

// ✅ Single source of truth
const {
  getAllPlans,
  getPlanPrice,
  applyPlanToOrg,
  PLAN_FEATURES,
  PLAN_LIMITS
} = require("../utils/planFeatures");

const OWNER_UP = ["super_admin", "owner"];

// ============================================================
// GET /api/billing/plans
// Public — used by landing page + admin upgrade screen
// ============================================================
router.get("/plans", (req, res) => {
  res.json({ success: true, plans: getAllPlans() });
});

// ============================================================
// GET /api/billing/current
// Current subscription + usage + plan details
// ============================================================
router.get("/current", protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;

    const [organization, subscription, branchCount, staffCount, menuItemCount, tableCount] = await Promise.all([
      Organization.findById(orgId),
      Subscription.findOne({ organization: orgId }),
      Branch.countDocuments({ organization: orgId }),
      User.countDocuments({ organization: orgId, role: { $ne: "owner" } }),
      MenuItem.countDocuments({ organization: orgId }),
      Table.countDocuments({ organization: orgId })
    ]);

    const currentPlan = organization?.subscription?.plan || "free";
    const allPlans    = getAllPlans();
    const planDetails = allPlans[currentPlan];

    res.json({
      success: true,
      organization: {
        name:               organization.name,
        plan:               currentPlan,
        status:             organization.subscription?.status,
        currentPeriodEnd:   organization.subscription?.currentPeriodEnd,
        trialEndsAt:        organization.subscription?.trialEndsAt
      },
      planDetails,
      subscription,
      usage: {
        branches:  branchCount,
        tables:    tableCount,
        staff:     staffCount,
        menuItems: menuItemCount
      },
      limits:   planDetails.limits,
      features: organization.features   // current org's actual features
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/request-upgrade
// Owner requests plan change — manual approval required
// ============================================================
router.post("/request-upgrade", protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod, transactionRef, notes } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    if (!PLAN_FEATURES[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const amount = getPlanPrice(plan, billingCycle);

    const subscription = await Subscription.findOneAndUpdate(
      { organization: orgId },
      {
        $set: {
          pendingUpgrade: {
            plan,
            billingCycle:   billingCycle || "monthly",
            amount,
            paymentMethod:  paymentMethod || "manual",
            transactionRef: transactionRef || "",
            notes:          notes || "",
            requestedAt:    new Date(),
            requestedBy:    req.user._id,
            status:         "pending"
          }
        }
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Upgrade request submitted. Our team will activate within 24 hours.",
      pendingUpgrade: subscription.pendingUpgrade
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// GET /api/billing/history
// ============================================================
router.get("/history", protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const orgId = req.user.organization?._id || req.user.organization;
    const subscription = await Subscription.findOne({ organization: orgId });

    res.json({
      success: true,
      history: subscription?.paymentHistory || []
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// SUPER ADMIN ROUTES
// ============================================================

// GET pending upgrades
router.get("/pending-upgrades", protect, authorize("super_admin"), async (req, res) => {
  try {
    const subs = await Subscription.find({ "pendingUpgrade.status": "pending" })
      .populate("organization", "name")
      .populate("pendingUpgrade.requestedBy", "name email");

    res.json({ success: true, pendingUpgrades: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/approve-upgrade/:subId
// ✅ Uses applyPlanToOrg — auto-sets features + limits
// ============================================================
router.post("/approve-upgrade/:subId", protect, authorize("super_admin"), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subId);
    if (!subscription || !subscription.pendingUpgrade) {
      return res.status(404).json({ success: false, message: "No pending upgrade found" });
    }

    const { plan, billingCycle, amount, paymentMethod, transactionRef } = subscription.pendingUpgrade;

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));

    // ── Update organization — applies plan defaults ──────
    const org = await Organization.findById(subscription.organization);

    // ✅ This single call sets plan + features + limits correctly
    applyPlanToOrg(org, plan);

    // Set subscription metadata
    org.subscription.status             = "active";
    org.subscription.paymentMethod      = paymentMethod;
    org.subscription.currentPeriodStart = new Date();
    org.subscription.currentPeriodEnd   = periodEnd;
    await org.save();

    // ── Update subscription record ───────────────────────
    subscription.plan                = plan;
    subscription.status              = "active";
    subscription.provider            = paymentMethod;
    subscription.billingCycle        = billingCycle;
    subscription.amount              = amount;
    subscription.currentPeriodStart  = new Date();
    subscription.currentPeriodEnd    = periodEnd;
    subscription.paymentHistory.push({
      date:          new Date(),
      amount,
      status:        "succeeded",
      method:        paymentMethod,
      transactionId: transactionRef
    });
    subscription.pendingUpgrade = undefined;
    await subscription.save();

    res.json({
      success: true,
      message: "Upgrade approved — features auto-activated",
      organization: org,
      subscription
    });

  } catch (err) {
    console.error("Approve upgrade error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST reject upgrade
router.post("/reject-upgrade/:subId", protect, authorize("super_admin"), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subId);
    if (!subscription) return res.status(404).json({ success: false });

    subscription.pendingUpgrade = undefined;
    await subscription.save();

    res.json({ success: true, message: "Upgrade request rejected" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
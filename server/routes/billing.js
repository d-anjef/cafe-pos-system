const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const Branch = require("../models/Branch");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");

const OWNER_UP = ["super_admin", "owner"];

// Plan definitions (single source of truth)
const PLANS = {
  free: {
    name: "Free",
    monthly: 0,
    yearly: 0,
    limits: { branches: 1, tables: 5, staff: 3, menuItems: 20 },
    features: { pdfReceipts: false, customBranding: false, inventory: false, employeeMetrics: false }
  },
  starter: {
    name: "Starter",
    monthly: 999,
    yearly: 9590, // 20% discount
    limits: { branches: 1, tables: 15, staff: 5, menuItems: 50 },
    features: { pdfReceipts: true, customBranding: false, inventory: false, employeeMetrics: false }
  },
  business: {
    name: "Business",
    monthly: 2999,
    yearly: 28790,
    limits: { branches: 5, tables: 50, staff: 20, menuItems: 200 },
    features: { pdfReceipts: true, customBranding: true, inventory: true, employeeMetrics: true }
  },
  enterprise: {
    name: "Enterprise",
    monthly: 9999,
    yearly: 95990,
    limits: { branches: 20, tables: 200, staff: 100, menuItems: 1000 },
    features: { pdfReceipts: true, customBranding: true, inventory: true, employeeMetrics: true, apiAccess: true, prioritySupport: true }
  }
};

// ============================================================
// GET /api/billing/plans
// Get all plans (public)
// ============================================================
router.get("/plans", (req, res) => {
  res.json({ success: true, plans: PLANS });
});

// ============================================================
// GET /api/billing/current
// Get current subscription + usage
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
    const planDetails = PLANS[currentPlan];

    res.json({
      success: true,
      organization: {
        name: organization.name,
        plan: currentPlan,
        status: organization.subscription?.status,
        currentPeriodEnd: organization.subscription?.currentPeriodEnd,
        trialEndsAt: organization.subscription?.trialEndsAt
      },
      planDetails,
      subscription,
      usage: {
        branches: branchCount,
        tables: tableCount,
        staff: staffCount,
        menuItems: menuItemCount
      },
      limits: planDetails.limits
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/request-upgrade
// Request a plan upgrade (manual processing)
// ============================================================
router.post("/request-upgrade", protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod, transactionRef, notes } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    if (!PLANS[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    const amount = PLANS[plan][billingCycle === "yearly" ? "yearly" : "monthly"];

    // Save the request to subscription
    const subscription = await Subscription.findOneAndUpdate(
      { organization: orgId },
      {
        $set: {
          pendingUpgrade: {
            plan,
            billingCycle: billingCycle || "monthly",
            amount,
            paymentMethod: paymentMethod || "manual",
            transactionRef: transactionRef || "",
            notes: notes || "",
            requestedAt: new Date(),
            requestedBy: req.user._id,
            status: "pending"
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
// Payment history for current org
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
// SUPER ADMIN ROUTES (manual activation)
// ============================================================

// GET /api/billing/pending-upgrades
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

// POST /api/billing/approve-upgrade/:subId
router.post("/approve-upgrade/:subId", protect, authorize("super_admin"), async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.subId);
    if (!subscription || !subscription.pendingUpgrade) {
      return res.status(404).json({ success: false, message: "No pending upgrade found" });
    }

    const { plan, billingCycle, amount, paymentMethod, transactionRef } = subscription.pendingUpgrade;
    const planDetails = PLANS[plan];

    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (billingCycle === "yearly" ? 12 : 1));

    // Update organization
    const org = await Organization.findById(subscription.organization);
    org.subscription.plan = plan;
    org.subscription.status = "active";
    org.subscription.paymentMethod = paymentMethod;
    org.subscription.currentPeriodStart = new Date();
    org.subscription.currentPeriodEnd = periodEnd;
    org.limits = planDetails.limits;
    org.features = { ...org.features, ...planDetails.features };
    await org.save();

    // Update subscription
    subscription.plan = plan;
    subscription.status = "active";
    subscription.provider = paymentMethod;
    subscription.billingCycle = billingCycle;
    subscription.amount = amount;
    subscription.currentPeriodStart = new Date();
    subscription.currentPeriodEnd = periodEnd;
    subscription.paymentHistory.push({
      date: new Date(),
      amount,
      status: "succeeded",
      method: paymentMethod,
      transactionId: transactionRef
    });
    subscription.pendingUpgrade = undefined;
    await subscription.save();

    res.json({ success: true, message: "Upgrade approved and activated", subscription });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/billing/reject-upgrade/:subId
router.post("/reject-upgrade/:subId", protect, authorize("super_admin"), async (req, res) => {
  try {
    const { reason } = req.body;
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
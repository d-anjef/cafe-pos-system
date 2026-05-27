const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const Organization = require("../models/Organization");
const Subscription = require("../models/Subscription");
const Branch = require("../models/Branch");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const Table = require("../models/Table");

const {
  getAllPlans,
  getPlanPrice,
  applyPlanToOrg,
  PLAN_FEATURES,
  PLAN_LIMITS
} = require("../utils/planFeatures");

// ✅ EMAIL IMPORTS — These were MISSING in your version
const { sendEmail } = require("../services/emailService");
const upgradeRequestedEmail = require("../templates/emails/upgradeRequestedEmail");
const upgradeApprovedEmail  = require("../templates/emails/upgradeApprovedEmail");
const upgradeRejectedEmail  = require("../templates/emails/upgradeRejectedEmail");

const OWNER_UP = ["super_admin", "owner"];

// ============================================================
// GET /api/billing/plans
// ============================================================
router.get("/plans", (req, res) => {
  res.json({ success: true, plans: getAllPlans() });
});

// ============================================================
// GET /api/billing/current
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
        name:             organization.name,
        plan:             currentPlan,
        status:           organization.subscription?.status,
        currentPeriodEnd: organization.subscription?.currentPeriodEnd,
        trialEndsAt:      organization.subscription?.trialEndsAt
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
      features: organization.features
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/request-upgrade
// ✅ NOW SENDS EMAIL TO SUPER ADMIN
// ============================================================
router.post("/request-upgrade", protect, authorize(...OWNER_UP), async (req, res) => {
  try {
    const { plan, billingCycle, paymentMethod, transactionRef, notes } = req.body;
    const orgId = req.user.organization?._id || req.user.organization;

    // ── VALIDATION ────────────────────────────────────────
    if (!plan || !PLAN_FEATURES[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan" });
    }

    if (!billingCycle || !["monthly", "yearly"].includes(billingCycle)) {
      return res.status(400).json({ success: false, message: "Invalid billing cycle" });
    }

    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: "Payment method required" });
    }

    if (!transactionRef || transactionRef.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Transaction reference required" });
    }

    if (!orgId || !req.user._id) {
      return res.status(400).json({ success: false, message: "Authentication error" });
    }

    const amount = getPlanPrice(plan, billingCycle);

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Invalid plan amount" });
    }

    // ── BUILD COMPLETE PENDING UPGRADE OBJECT ─────────────
    const pendingUpgradeData = {
      plan,
      billingCycle,
      amount,
      paymentMethod,
      transactionRef: transactionRef.trim(),
      notes: notes?.trim() || "",
      requestedAt: new Date(),
      requestedBy: req.user._id,
      status: "pending"
    };

    // Update or create subscription with full data
    const subscription = await Subscription.findOneAndUpdate(
      { organization: orgId },
      { $set: { pendingUpgrade: pendingUpgradeData } },
      { new: true, upsert: true }
    );

    // Fire email to super admin
    console.log(`📨 Triggering upgrade request email for org ${orgId}`);

    sendUpgradeRequestEmailToSuperAdmin({
      subscriptionId: subscription._id,
      orgId,
      requestedPlan: plan,
      billingCycle,
      amount,
      paymentMethod,
      transactionRef: transactionRef.trim(),
      notes: notes?.trim() || "",
      requestedByUserId: req.user._id
    }).catch(err => {
      console.error("❌ Upgrade request email error:", err.message);
    });

    res.json({
      success: true,
      message: "Upgrade request submitted. Our team will activate within 24 hours.",
      pendingUpgrade: subscription.pendingUpgrade
    });

  } catch (err) {
    console.error("Request upgrade error:", err);
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

router.get("/pending-upgrades", protect, authorize("super_admin"), async (req, res) => {
  try {
    // Get all pending — strict criteria (must have plan + amount + requestedBy)
    const subs = await Subscription.find({
      "pendingUpgrade.status": "pending",
      "pendingUpgrade.plan": { $exists: true, $ne: null },
      "pendingUpgrade.amount": { $exists: true, $ne: null },
      "pendingUpgrade.requestedBy": { $exists: true, $ne: null }
    })
      .populate("organization", "name")
      .populate("pendingUpgrade.requestedBy", "name email");

    res.json({ success: true, pendingUpgrades: subs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/approve-upgrade/:subId
// ✅ NOW SENDS APPROVAL EMAIL TO OWNER
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

    // Get org BEFORE applying changes (so we know old plan)
    const org = await Organization.findById(subscription.organization).populate("owner");
    
    if (!org) {
      return res.status(404).json({ success: false, message: "Organization not found" });
    }

    const oldPlan = org.subscription?.plan || "free";

    // Apply new plan
    applyPlanToOrg(org, plan);
    org.subscription.status             = "active";
    org.subscription.paymentMethod      = paymentMethod;
    org.subscription.currentPeriodStart = new Date();
    org.subscription.currentPeriodEnd   = periodEnd;
    await org.save();

    // Update subscription
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

    // ✅ FIRE APPROVAL EMAIL TO OWNER
    console.log(`📨 Sending approval email to ${org.owner?.email}`);
    
    if (org.owner?.email) {
      sendEmail({
        to: org.owner.email,
        subject: `Subscription Upgrade Confirmed — ${org.name}`,
        html: upgradeApprovedEmail({
          name:            org.owner.name,
          orgName:         org.name,
          oldPlan,
          newPlan:         plan,
          billingCycle,
          amount,
          currency:        org.settings?.currency || "NPR",
          nextBillingDate: periodEnd
        })
      }).then(result => {
        if (result.success) {
          console.log(`✅ Approval email sent to ${org.owner.email}`);
        } else {
          console.error(`❌ Approval email failed:`, result.error);
        }
      }).catch(err => {
        console.error("❌ Approval email crash:", err.message);
      });
    } else {
      console.warn("⚠️ Owner has no email — approval email skipped");
    }

    res.json({
      success: true,
      message: "Upgrade approved — owner notified by email",
      organization: org,
      subscription
    });

  } catch (err) {
    console.error("Approve upgrade error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// POST /api/billing/reject-upgrade/:subId
// ✅ NOW REQUIRES REASON + SENDS REJECTION EMAIL
// ============================================================
router.post("/reject-upgrade/:subId", protect, authorize("super_admin"), async (req, res) => {
  try {
    const { reason } = req.body;

    if (!reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason (minimum 10 characters)"
      });
    }

    const subscription = await Subscription.findById(req.params.subId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    if (!subscription.pendingUpgrade) {
      return res.status(400).json({ success: false, message: "No pending upgrade to reject" });
    }

    // Save details before clearing
    const { plan, amount } = subscription.pendingUpgrade;

    // Get org + owner for email
    const org = await Organization.findById(subscription.organization).populate("owner");

    // Clear the pending request
    subscription.pendingUpgrade = undefined;
    await subscription.save();

    // ✅ FIRE REJECTION EMAIL
    console.log(`📨 Sending rejection email to ${org?.owner?.email}`);
    
    if (org?.owner?.email) {
      sendEmail({
        to: org.owner.email,
        subject: `Subscription Upgrade Request Update — ${org.name}`,
        html: upgradeRejectedEmail({
          name:          org.owner.name,
          orgName:       org.name,
          requestedPlan: plan,
          reason:        reason.trim(),
          amount,
          currency:      org.settings?.currency || "NPR"
        })
      }).then(result => {
        if (result.success) {
          console.log(`✅ Rejection email sent to ${org.owner.email}`);
        } else {
          console.error(`❌ Rejection email failed:`, result.error);
        }
      }).catch(err => {
        console.error("❌ Rejection email crash:", err.message);
      });
    }

    res.json({
      success: true,
      message: "Upgrade request rejected — owner notified by email"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ============================================================
// HELPER: Send upgrade request email to super admin
// ============================================================
async function sendUpgradeRequestEmailToSuperAdmin({
  subscriptionId,
  orgId,
  requestedPlan,
  billingCycle,
  amount,
  paymentMethod,
  transactionRef,
  notes,
  requestedByUserId
}) {
  try {
    // Find super admin user
    const superAdmin = await User.findOne({ role: "super_admin", isActive: true });

    if (!superAdmin) {
      console.warn("⚠️ No super_admin user found to notify");
      return;
    }

    console.log(`📧 Super admin found: ${superAdmin.email}`);

    // Get org + owner details
    const org = await Organization.findById(orgId);
    const requester = await User.findById(requestedByUserId);

    if (!org || !requester) {
      console.warn("⚠️ Could not find org or requester");
      return;
    }

    const result = await sendEmail({
      to: superAdmin.email,
      subject: `🔔 New Upgrade Request: ${org.name} → ${requestedPlan}`,
      html: upgradeRequestedEmail({
        orgName:         org.name,
        ownerName:       requester.name,
        ownerEmail:      requester.email,
        requestedPlan,
        currentPlan:     org.subscription?.plan || "free",
        billingCycle,
        amount,
        paymentMethod,
        transactionRef,
        notes,
        subscriptionId
      })
    });

    if (result.success) {
      console.log(`✅ Upgrade request notification sent to ${superAdmin.email}`);
    } else {
      console.error(`❌ Failed to notify super admin:`, result.error);
    }

  } catch (err) {
    console.error("sendUpgradeRequestEmailToSuperAdmin error:", err.message);
  }
}

module.exports = router;
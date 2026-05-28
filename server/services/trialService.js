const Organization = require('../models/Organization');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { applyPlanToOrg } = require('../utils/planFeatures');
const { sendEmail } = require('./emailService');
const { trialWarningEmail } = require('../templates/emails/trialWarningEmail');
const { trialExpiredEmail } = require('../templates/emails/trialExpiredEmail');
const { trialDowngradedEmail } = require('../templates/emails/trialDowngradedEmail');

const GRACE_PERIOD_DAYS = 7;

// ============================================================
// HELPER: Calculate days between dates
// ============================================================
function daysBetween(date1, date2) {
  const diffMs = new Date(date1).getTime() - new Date(date2).getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

// ============================================================
// HELPER: Get owner email from organization
// ============================================================
async function getOwnerInfo(organizationId) {
  const owner = await User.findOne({
    organization: organizationId,
    role: 'owner'
  }).select('name email');

  return owner;
}

// ============================================================
// 1. SEND TRIAL WARNINGS (7, 3, 1 days before expiry)
// ============================================================
async function processTrialWarnings() {
  const now = new Date();
  const stats = { sent: 0, errors: 0 };

  // Find all trialing subscriptions
  const trials = await Subscription.find({
    status: 'trialing',
    trialEnd: { $gte: now }
  }).populate('organization');

  console.log(`[TRIAL] Checking ${trials.length} active trials for warnings...`);

  for (const sub of trials) {
    try {
      const daysLeft = daysBetween(sub.trialEnd, now);

      // Only send on 7, 3, 1 days left
      if (![7, 3, 1].includes(daysLeft)) continue;

      // Check if we already sent today (avoid duplicates)
      const lastSent = sub.lastReminderSent;
      if (lastSent) {
        const hoursSinceLastSent = (now - new Date(lastSent)) / (1000 * 60 * 60);
        if (hoursSinceLastSent < 20) {
          console.log(`[TRIAL] Skipping ${sub.organization?.name} — reminder sent ${hoursSinceLastSent.toFixed(1)}h ago`);
          continue;
        }
      }

      const org = sub.organization;
      if (!org) continue;

      const owner = await getOwnerInfo(org._id);
      if (!owner) {
        console.log(`[TRIAL] No owner found for ${org.name}`);
        continue;
      }

      // Send warning email
      const html = trialWarningEmail({
        name: owner.name,
        orgName: org.name,
        daysLeft,
        trialEndDate: sub.trialEnd,
        upgradeUrl: `${process.env.APP_URL || 'https://cafe-pos-system-wheat.vercel.app'}/admin?tab=billing`
      });

      await sendEmail({
        to: owner.email,
        subject: daysLeft === 1
          ? '⏰ Your NUVLYX trial ends tomorrow!'
          : `📅 Your NUVLYX trial ends in ${daysLeft} days`,
        html
      });

      // Update last reminder timestamp
      sub.lastReminderSent = now;
      await sub.save();

      stats.sent++;
      console.log(`[TRIAL] ✅ Sent ${daysLeft}-day warning to ${owner.email} (${org.name})`);

    } catch (err) {
      stats.errors++;
      console.error(`[TRIAL] ❌ Warning error for sub ${sub._id}:`, err.message);
    }
  }

  return stats;
}

// ============================================================
// 2. PROCESS EXPIRED TRIALS (Day 0: enter grace period)
// ============================================================
async function processExpiredTrials() {
  const now = new Date();
  const stats = { expired: 0, errors: 0 };

  // Find trials that just ended (within last 24 hours)
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const expired = await Subscription.find({
    status: 'trialing',
    trialEnd: { $lt: now, $gte: yesterday }
  }).populate('organization');

  console.log(`[TRIAL] Processing ${expired.length} newly expired trials...`);

  for (const sub of expired) {
    try {
      const org = sub.organization;
      if (!org) continue;

      // Move to past_due (= grace period)
      sub.status = 'past_due';
      sub.canceledAt = now;
      await sub.save();

      console.log(`[TRIAL] ⏰ ${org.name} → entered grace period`);

      const owner = await getOwnerInfo(org._id);
      if (!owner) continue;

      // Calculate grace period end
      const gracePeriodEnd = new Date(now.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

      // Send expired email
      const html = trialExpiredEmail({
        name: owner.name,
        orgName: org.name,
        gracePeriodEnd,
        upgradeUrl: `${process.env.APP_URL || 'https://cafe-pos-system-wheat.vercel.app'}/admin?tab=billing`
      });

      await sendEmail({
        to: owner.email,
        subject: '⏰ Your NUVLYX trial has ended',
        html
      });

      stats.expired++;
      console.log(`[TRIAL] ✅ Sent expiry email to ${owner.email}`);

    } catch (err) {
      stats.errors++;
      console.error(`[TRIAL] ❌ Expiry error for sub ${sub._id}:`, err.message);
    }
  }

  return stats;
}

// ============================================================
// 3. AUTO-DOWNGRADE (Day +7: grace period over → Free plan)
// ============================================================
async function processGracePeriodDowngrades() {
  const now = new Date();
  const stats = { downgraded: 0, errors: 0 };

  // Grace period cutoff: trials that ended 7+ days ago
  const graceEnd = new Date(now.getTime() - GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);

  // Find past_due subs whose trial ended 7+ days ago
  const toDowngrade = await Subscription.find({
    status: 'past_due',
    trialEnd: { $lt: graceEnd },
    plan: { $ne: 'free' }  // Don't downgrade if already free
  }).populate('organization');

  console.log(`[TRIAL] Processing ${toDowngrade.length} grace period downgrades...`);

  for (const sub of toDowngrade) {
    try {
      const org = sub.organization;
      if (!org) continue;

      const oldPlan = sub.plan;

      // Downgrade subscription
      sub.plan = 'free';
      sub.status = 'active';
      sub.amount = 0;
      sub.billingCycle = 'monthly';
      sub.currentPeriodStart = now;
      sub.currentPeriodEnd = null;  // Free has no expiry
      await sub.save();

      // Update organization features + limits to free
      const fullOrg = await Organization.findById(org._id);
      if (fullOrg) {
        applyPlanToOrg(fullOrg, 'free');
        await fullOrg.save();
      }

      console.log(`[TRIAL] ⬇️ ${org.name} downgraded ${oldPlan} → free`);

      const owner = await getOwnerInfo(org._id);
      if (!owner) continue;

      // Send downgrade email
      const html = trialDowngradedEmail({
        name: owner.name,
        orgName: org.name,
        upgradeUrl: `${process.env.APP_URL || 'https://cafe-pos-system-wheat.vercel.app'}/admin?tab=billing`
      });

      await sendEmail({
        to: owner.email,
        subject: '📦 Your NUVLYX account moved to Free plan',
        html
      });

      stats.downgraded++;
      console.log(`[TRIAL] ✅ Sent downgrade email to ${owner.email}`);

    } catch (err) {
      stats.errors++;
      console.error(`[TRIAL] ❌ Downgrade error for sub ${sub._id}:`, err.message);
    }
  }

  return stats;
}

// ============================================================
// MAIN: Run all trial processing tasks
// ============================================================
async function runTrialProcessing() {
  console.log('\n========================================');
  console.log(`[TRIAL CRON] Started at ${new Date().toISOString()}`);
  console.log('========================================');

  try {
    const warningStats = await processTrialWarnings();
    const expiredStats = await processExpiredTrials();
    const downgradeStats = await processGracePeriodDowngrades();

    const summary = {
      warnings: warningStats,
      expired: expiredStats,
      downgraded: downgradeStats,
      timestamp: new Date().toISOString()
    };

    console.log('\n[TRIAL CRON] ✅ Completed:', JSON.stringify(summary, null, 2));
    return summary;

  } catch (err) {
    console.error('[TRIAL CRON] ❌ Fatal error:', err);
    return { error: err.message };
  }
}

// ============================================================
// HELPER: Get trial info for a specific org (for UI)
// ============================================================
async function getTrialInfo(organizationId) {
  const sub = await Subscription.findOne({ organization: organizationId });
  if (!sub) return null;

  const now = new Date();

  // Active subscription (paid)
  if (sub.status === 'active' && sub.plan !== 'free') {
    return {
      status: 'paid',
      plan: sub.plan,
      isTrialing: false,
      daysLeft: null
    };
  }

  // Free plan
  if (sub.plan === 'free' && sub.status === 'active') {
    return {
      status: 'free',
      plan: 'free',
      isTrialing: false,
      daysLeft: null
    };
  }

  // Trialing
  if (sub.status === 'trialing') {
    const daysLeft = sub.trialEnd ? daysBetween(sub.trialEnd, now) : 0;
    return {
      status: 'trialing',
      plan: sub.plan,
      isTrialing: true,
      daysLeft: Math.max(0, daysLeft),
      trialEnd: sub.trialEnd
    };
  }

  // Grace period (past_due)
  if (sub.status === 'past_due') {
    const graceEndDate = new Date(sub.trialEnd.getTime() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000);
    const daysLeftInGrace = daysBetween(graceEndDate, now);

    return {
      status: 'grace',
      plan: sub.plan,
      isTrialing: false,
      isReadOnly: true,
      daysLeft: Math.max(0, daysLeftInGrace),
      gracePeriodEnd: graceEndDate
    };
  }

  return {
    status: sub.status,
    plan: sub.plan,
    isTrialing: false
  };
}

module.exports = {
  runTrialProcessing,
  processTrialWarnings,
  processExpiredTrials,
  processGracePeriodDowngrades,
  getTrialInfo,
  GRACE_PERIOD_DAYS
};
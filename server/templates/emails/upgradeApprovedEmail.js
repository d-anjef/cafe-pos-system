const baseTemplate = require("./baseTemplate");
const { getAllPlans } = require("../../utils/planFeatures");

/**
 * Sent to owner when their upgrade is approved
 */
function upgradeApprovedEmailTemplate({
  name,
  orgName,
  oldPlan,
  newPlan,
  billingCycle,
  amount,
  currency = "NPR",
  nextBillingDate
}) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";

  // Get plan details for comparison
  const plans = getAllPlans();
  const oldPlanData = plans[oldPlan] || plans.free;
  const newPlanData = plans[newPlan];

  // Calculate what changed
  const changes = {
    branches:  { old: oldPlanData.limits.branches,  new: newPlanData.limits.branches  },
    tables:    { old: oldPlanData.limits.tables,    new: newPlanData.limits.tables    },
    staff:     { old: oldPlanData.limits.staff,     new: newPlanData.limits.staff     },
    menuItems: { old: oldPlanData.limits.menuItems, new: newPlanData.limits.menuItems }
  };

  // Build features list (what's newly unlocked)
  const newlyUnlocked = [];
  for (const [feature, enabled] of Object.entries(newPlanData.features)) {
    const wasEnabled = oldPlanData.features[feature];
    if (enabled && !wasEnabled) {
      newlyUnlocked.push(featureLabel(feature));
    }
  }

  // Format billing date
  const billingDateStr = nextBillingDate
    ? new Date(nextBillingDate).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "N/A";

  // Format amount
  const formattedAmount = amount > 0
    ? `${currency} ${amount.toLocaleString()}/${billingCycle === "yearly" ? "year" : "month"}`
    : "Free";

  const content = `
    <p>Dear ${name},</p>

    <p>We are pleased to confirm that your subscription upgrade for <strong style="color:#d4af37;">${orgName}</strong> has been approved and activated.</p>

    <!-- PLAN CHANGE SUMMARY -->
    <div style="background:rgba(76,175,80,0.08); border:1px solid rgba(76,175,80,0.3); border-radius:12px; padding:20px; margin:24px 0;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-bottom:16px;">
        <div style="text-align:center; flex:1;">
          <div style="font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">
            Previous Plan
          </div>
          <div style="font-size:16px; font-weight:700; color:rgba(255,255,255,0.7); text-transform:capitalize;">
            ${oldPlan}
          </div>
        </div>

        <div style="font-size:24px; color:#d4af37;">→</div>

        <div style="text-align:center; flex:1;">
          <div style="font-size:11px; color:rgba(212,175,55,0.8); text-transform:uppercase; letter-spacing:1px; margin-bottom:4px;">
            New Plan
          </div>
          <div style="font-size:20px; font-weight:800; color:#d4af37; text-transform:capitalize;">
            ${newPlan}
          </div>
        </div>
      </div>

      <div style="border-top:1px solid rgba(76,175,80,0.2); padding-top:14px; font-size:13px; color:rgba(255,255,255,0.7);">
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Billing cycle:</span>
          <strong style="color:#ffffff; text-transform:capitalize;">${billingCycle}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
          <span>Amount:</span>
          <strong style="color:#d4af37;">${formattedAmount}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span>Next billing date:</span>
          <strong style="color:#ffffff;">${billingDateStr}</strong>
        </div>
      </div>
    </div>

    <!-- WHAT'S NEW -->
    <h3 style="margin:32px 0 12px; font-size:16px; color:#ffffff;">
      Your new capabilities
    </h3>

    <!-- LIMITS TABLE -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(255,255,255,0.03); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08); margin-bottom:20px;">
      <thead>
        <tr style="background:rgba(212,175,55,0.08);">
          <th style="padding:10px 12px; text-align:left; font-size:11px; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">Resource</th>
          <th style="padding:10px 12px; text-align:center; font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:1px;">Before</th>
          <th style="padding:10px 12px; text-align:center; font-size:11px; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">Now</th>
        </tr>
      </thead>
      <tbody>
        ${limitRow("Branches", changes.branches)}
        ${limitRow("Tables", changes.tables)}
        ${limitRow("Staff accounts", changes.staff)}
        ${limitRow("Menu items", changes.menuItems)}
      </tbody>
    </table>

    ${newlyUnlocked.length > 0 ? `
    <!-- NEW FEATURES -->
    <h3 style="margin:24px 0 12px; font-size:16px; color:#ffffff;">
      Features unlocked
    </h3>
    <div style="background:rgba(212,175,55,0.05); border:1px solid rgba(212,175,55,0.2); border-radius:10px; padding:16px 20px;">
      ${newlyUnlocked.map(f => `
        <div style="padding:6px 0; font-size:14px; color:rgba(255,255,255,0.85);">
          <span style="color:#4caf50; font-weight:700;">✓</span> ${f}
        </div>
      `).join("")}
    </div>
    ` : ""}

    <p style="margin-top:32px; font-size:14px; color:rgba(255,255,255,0.8);">
      All new features and limits are now active on your account. You can begin using them immediately.
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7);">
      If you have any questions about your subscription, please reply to this email.
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7); margin-top:24px;">
      Sincerely,<br/>
      <strong style="color:#d4af37;">The NUVLYX Team</strong>
    </p>
  `;

  return baseTemplate({
    title: `Subscription Upgrade Confirmed`,
    preheader: `Your ${orgName} account has been upgraded to ${newPlan} plan`,
    content,
    cta: {
      text: "Access Your Dashboard →",
      url: `${appUrl}/admin`
    }
  });
}

// Helper to render limit row
function limitRow(label, change) {
  const formatVal = (v) => v >= 999 ? "Unlimited" : v.toLocaleString();
  return `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:rgba(255,255,255,0.85);">
        ${label}
      </td>
      <td style="padding:10px 12px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:rgba(255,255,255,0.5);">
        ${formatVal(change.old)}
      </td>
      <td style="padding:10px 12px; text-align:center; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:#d4af37; font-weight:700;">
        ${formatVal(change.new)}
      </td>
    </tr>
  `;
}

// Convert feature key to readable label
function featureLabel(key) {
  const labels = {
    qrOrdering:      "QR Code Customer Ordering",
    pdfReceipts:     "PDF Receipt Generation",
    customBranding:  "Custom Branding & Logo",
    multiCurrency:   "Multi-currency Support",
    inventory:       "Inventory Management",
    employeeMetrics: "Employee Performance Metrics",
    apiAccess:       "API Access",
    prioritySupport: "Priority Email Support"
  };
  return labels[key] || key;
}

module.exports = upgradeApprovedEmailTemplate;
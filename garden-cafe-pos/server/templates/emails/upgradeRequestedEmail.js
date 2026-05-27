const baseTemplate = require("./baseTemplate");

/**
 * Sent to super admin when an owner submits upgrade request
 */
function upgradeRequestedEmailTemplate({
  orgName,
  ownerName,
  ownerEmail,
  requestedPlan,
  currentPlan,
  billingCycle,
  amount,
  paymentMethod,
  transactionRef,
  notes,
  subscriptionId
}) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";

  // Direct links to approve/reject (will open admin dashboard)
  const adminUrl   = `${appUrl}/super-admin`;
  const approveUrl = `${appUrl}/super-admin?action=approve&sub=${subscriptionId}`;
  const rejectUrl  = `${appUrl}/super-admin?action=reject&sub=${subscriptionId}`;

  const content = `
    <p>A new subscription upgrade request requires your review.</p>

    <!-- REQUEST DETAILS -->
    <div style="background:rgba(255,193,7,0.08); border:1px solid rgba(255,193,7,0.3); border-radius:12px; padding:20px; margin:24px 0;">
      <div style="font-size:11px; color:#ffc107; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;">
        ⚠️ Action Required
      </div>

      <div style="display:grid; gap:10px; font-size:13px;">

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Organization:</span>
          <strong style="color:#d4af37;">${orgName}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Owner:</span>
          <strong style="color:#ffffff;">${ownerName}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Email:</span>
          <a href="mailto:${ownerEmail}" style="color:#d4af37; text-decoration:none;">${ownerEmail}</a>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Plan change:</span>
          <strong style="color:#ffffff; text-transform:capitalize;">${currentPlan} → ${requestedPlan}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Billing cycle:</span>
          <strong style="color:#ffffff; text-transform:capitalize;">${billingCycle}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Amount:</span>
          <strong style="color:#4caf50; font-size:15px;">NPR ${amount.toLocaleString()}</strong>
        </div>

        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Payment method:</span>
          <strong style="color:#ffffff; text-transform:capitalize;">${paymentMethod || "Manual"}</strong>
        </div>

        ${transactionRef ? `
        <div style="display:flex; justify-content:space-between; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.06);">
          <span style="color:rgba(255,255,255,0.6);">Reference:</span>
          <strong style="color:#ffffff; font-family:'Courier New', monospace; font-size:12px;">${transactionRef}</strong>
        </div>
        ` : ""}

        ${notes ? `
        <div style="margin-top:6px;">
          <div style="color:rgba(255,255,255,0.6); margin-bottom:4px;">Customer notes:</div>
          <div style="background:rgba(255,255,255,0.05); padding:10px 12px; border-radius:6px; font-style:italic; color:rgba(255,255,255,0.85);">
            "${notes}"
          </div>
        </div>
        ` : ""}

      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:0 8px 0 0;">
                <a href="${approveUrl}" 
                   style="display:inline-block; background:linear-gradient(135deg, #4caf50 0%, #66bb6a 100%); color:#ffffff; padding:14px 28px; border-radius:10px; font-weight:700; font-size:14px; text-decoration:none;">
                  ✓ Review & Approve
                </a>
              </td>
              <td style="padding:0 0 0 8px;">
                <a href="${rejectUrl}" 
                   style="display:inline-block; background:transparent; color:#e57373; padding:14px 28px; border-radius:10px; font-weight:700; font-size:14px; text-decoration:none; border:1px solid #e57373;">
                  ✗ Reject Request
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- VERIFICATION CHECKLIST -->
    <div style="background:rgba(255,255,255,0.03); border-radius:10px; padding:16px 20px; margin-top:16px; font-size:12px; color:rgba(255,255,255,0.7);">
      <strong style="color:#d4af37; display:block; margin-bottom:8px;">Before approving:</strong>
      ☐ Verify payment received in account<br/>
      ☐ Match transaction reference (${transactionRef || "see above"})<br/>
      ☐ Confirm amount: NPR ${amount.toLocaleString()}<br/>
      ☐ Check organization is in good standing<br/>
    </div>

    <p style="margin-top:24px; font-size:12px; color:rgba(255,255,255,0.5); text-align:center;">
      Request submitted at: ${new Date().toLocaleString("en-GB")}
    </p>
  `;

  return baseTemplate({
    title: `New Upgrade Request: ${orgName}`,
    preheader: `${ownerName} requested ${requestedPlan} plan upgrade — NPR ${amount.toLocaleString()}`,
    content
  });
}

module.exports = upgradeRequestedEmailTemplate;
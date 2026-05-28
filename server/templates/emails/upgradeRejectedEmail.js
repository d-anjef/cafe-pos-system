const baseTemplate = require("./baseTemplate");

/**
 * Sent to owner when their upgrade is rejected
 */
function upgradeRejectedEmailTemplate({
  name,
  orgName,
  requestedPlan,
  reason,
  amount,
  currency = "NPR"
}) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@nuvlyx.com";

  const content = `
    <p>Dear ${name},</p>

    <p>We were unable to approve your subscription upgrade request for <strong style="color:#d4af37;">${orgName}</strong> at this time.</p>

    <!-- REJECTION DETAILS -->
    <div style="background:rgba(229,57,53,0.05); border:1px solid rgba(229,57,53,0.25); border-radius:12px; padding:20px; margin:24px 0;">
      <div style="font-size:11px; color:#e57373; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;">
        Request Not Approved
      </div>

      <div style="font-size:13px; line-height:1.7;">
        <div style="margin-bottom:8px;">
          <span style="color:rgba(255,255,255,0.6);">Requested plan:</span>
          <strong style="color:#ffffff; text-transform:capitalize; margin-left:8px;">${requestedPlan}</strong>
        </div>
        <div style="margin-bottom:8px;">
          <span style="color:rgba(255,255,255,0.6);">Amount:</span>
          <strong style="color:#ffffff; margin-left:8px;">${currency} ${amount.toLocaleString()}</strong>
        </div>
      </div>
    </div>

    <!-- REASON -->
    <h3 style="margin:24px 0 12px; font-size:16px; color:#ffffff;">
      Reason for non-approval
    </h3>
    <div style="background:rgba(255,255,255,0.05); border-left:3px solid #e57373; border-radius:6px; padding:14px 18px; font-size:14px; color:rgba(255,255,255,0.85); line-height:1.6; font-style:italic;">
      ${reason || "No specific reason provided. Please contact support for clarification."}
    </div>

    <!-- WHAT'S NEXT -->
    <h3 style="margin:32px 0 12px; font-size:16px; color:#ffffff;">
      What to do next
    </h3>

    <ul style="padding-left:20px; color:rgba(255,255,255,0.8); font-size:14px; line-height:1.8;">
      <li>Review the reason mentioned above</li>
      <li>Address any issues with your payment or documentation</li>
      <li>Resubmit your upgrade request from the billing page</li>
      <li>Contact our support team if you need clarification</li>
    </ul>

    <!-- IMPORTANT NOTE -->
    <div style="background:rgba(33,150,243,0.08); border:1px solid rgba(33,150,243,0.25); border-radius:10px; padding:14px 18px; margin:24px 0; font-size:13px; color:rgba(255,255,255,0.8);">
      💡 <strong style="color:#64b5f6;">Your current plan remains active.</strong><br/>
      No changes have been made to your subscription. You can continue using your current features.
    </div>

    <p style="margin-top:24px; font-size:14px; color:rgba(255,255,255,0.7);">
      If you have any questions, please reply to this email or contact us at 
      <a href="mailto:${supportEmail}" style="color:#d4af37;">${supportEmail}</a>
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7); margin-top:24px;">
      Sincerely,<br/>
      <strong style="color:#d4af37;">The NUVLYX Team</strong>
    </p>
  `;

  return baseTemplate({
    title: "Subscription Upgrade Request Update",
    preheader: `Your upgrade request for ${orgName} requires attention`,
    content,
    cta: {
      text: "Resubmit Request →",
      url: `${appUrl}/admin?tab=billing`
    }
  });
}

module.exports = upgradeRejectedEmailTemplate;
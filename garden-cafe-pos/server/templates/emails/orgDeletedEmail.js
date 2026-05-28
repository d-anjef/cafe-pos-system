const baseTemplate = require("./baseTemplate");

/**
 * Sent to owner when their organization is deleted
 */
function orgDeletedEmailTemplate({ name, orgName, deletedAt, reason }) {
  const supportEmail = process.env.SUPPORT_EMAIL || "support@nuvlyx.com";

  const timeStr = new Date(deletedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const content = `
    <p>Dear ${name},</p>

    <p>This email is to confirm that your NUVLYX account for <strong style="color:#d4af37;">${orgName}</strong> has been deleted.</p>

    <!-- DELETION DETAILS -->
    <div style="background:rgba(231, 172, 8, 0.77); border:1px solid rgba(229,57,53,0.25); border-radius:12px; padding:20px; margin:24px 0;">
      <div style="font-size:11px; color:#e57373; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;">
        Account Permanently Removed
      </div>

      <div style="font-size:13px; line-height:1.8;">
        <div style="margin-bottom:6px;">
          <span style="color:rgba(255,255,255,0.6);">Organization:</span>
          <strong style="color:#ffffff; margin-left:8px;">${orgName}</strong>
        </div>
        <div style="margin-bottom:6px;">
          <span style="color:rgba(255,255,255,0.6);">Deleted on:</span>
          <strong style="color:#ffffff; margin-left:8px;">${timeStr}</strong>
        </div>
      </div>
    </div>

    <!-- WHAT WAS REMOVED -->
    <h3 style="margin:24px 0 12px; font-size:16px; color:#ffffff;">
      What was removed
    </h3>

    <div style="background:rgba(147, 177, 17, 0.62); border-radius:10px; padding:16px 20px; font-size:13px; color:rgba(255,255,255,0.75); line-height:1.8;">
      ✗ All branch information<br/>
      ✗ All staff accounts<br/>
      ✗ All menu items and categories<br/>
      ✗ All tables and layouts<br/>
      ✗ All order history<br/>
      ✗ All subscription records<br/>
    </div>

    ${reason ? `
    <!-- REASON IF PROVIDED -->
    <h3 style="margin:24px 0 12px; font-size:16px; color:#ffffff;">
      Reason
    </h3>
    <div style="background:rgba(255,255,255,0.05); border-left:3px solid #e57373; border-radius:6px; padding:14px 18px; font-size:14px; color:rgba(255,255,255,0.85); line-height:1.6;">
      ${reason}
    </div>
    ` : ""}

    <!-- DATA INFO -->
    <div style="background:rgba(33,150,243,0.08); border:1px solid rgba(33,150,243,0.25); border-radius:10px; padding:14px 18px; margin:24px 0; font-size:13px; color:rgba(255,255,255,0.8);">
      ℹ️ <strong style="color:#64b5f6;">Data Recovery</strong><br/>
      This action is permanent and cannot be undone. All data associated with your organization has been completely removed from our systems.
    </div>

    <!-- THANK YOU -->
    <p style="margin-top:32px; font-size:14px; color:rgba(255,255,255,0.8);">
      Thank you for being part of NUVLYX. We're sorry to see you go.
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7);">
      If you have any questions or believe this was done in error, please contact us immediately at <a href="mailto:${supportEmail}" style="color:#d4af37;">${supportEmail}</a>
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7); margin-top:24px;">
      Wishing you the best,<br/>
      <strong style="color:#d4af37;">The NUVLYX Team</strong>
    </p>
  `;

  return baseTemplate({
    title: "Account Deletion Confirmation",
    preheader: `Your NUVLYX account for ${orgName} has been removed`,
    content
  });
}

module.exports = orgDeletedEmailTemplate;
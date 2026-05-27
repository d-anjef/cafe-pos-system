const baseTemplate = require("./baseTemplate");

/**
 * Sent after password successfully changed
 * Security best practice: notify user when password changes
 */
function passwordChangedEmailTemplate({ name, changedAt }) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";
  const supportEmail = process.env.SUPPORT_EMAIL || "support@nuvlyx.com";

  const timeStr = new Date(changedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const content = `
    <p>Hi ${name},</p>

    <p>Your NUVLYX account password was successfully changed.</p>

    <!-- DETAILS -->
    <div style="background:rgba(76,175,80,0.08); border:1px solid rgba(76,175,80,0.25); border-radius:10px; padding:14px 18px; margin:20px 0; font-size:13px; color:rgba(255,255,255,0.8);">
      ✅ Password changed at: <strong>${timeStr}</strong>
    </div>

    <p>You can now log in using your new password.</p>

    <!-- SECURITY WARNING -->
    <div style="background:rgba(229,57,53,0.08); border:1px solid rgba(229,57,53,0.25); border-radius:10px; padding:14px 18px; margin:24px 0; font-size:13px;">
      <strong style="color:#e57373;">⚠️ Wasn't you?</strong><br/>
      <span style="color:rgba(255,255,255,0.7);">
        If you didn't make this change, your account may be compromised. 
        Contact us immediately at <a href="mailto:${supportEmail}" style="color:#d4af37;">${supportEmail}</a>
      </span>
    </div>
  `;

  return baseTemplate({
    title: "Password changed successfully",
    preheader: "Your NUVLYX account password was just changed",
    content,
    cta: {
      text: "Login to Dashboard →",
      url: `${appUrl}/login`
    }
  });
}

module.exports = passwordChangedEmailTemplate;
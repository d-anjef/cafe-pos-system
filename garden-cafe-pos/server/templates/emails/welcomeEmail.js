const baseTemplate = require("./baseTemplate");

/**
 * Welcome email — sent after email verification
 */
function welcomeEmailTemplate({ name, orgName, staff = [], trialEndsAt }) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";

  const trialDateStr = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "soon";

  // Staff credentials table — LIGHT THEME
  const staffRows = staff.map(s => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid #e8e8ea; font-size:13px; color:#1a1a1a; text-transform:capitalize; font-weight:600;">
        ${s.role.replace("_", " ")}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #e8e8ea; font-size:13px; color:#b8941f; font-family:'Courier New', monospace;">
        ${s.email}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid #e8e8ea; font-size:13px; color:#555555; font-family:'Courier New', monospace;">
        ${s.password}
      </td>
    </tr>
  `).join("");

  const content = `
    <p style="color:#1a1a1a; font-size:15px; margin:0 0 16px;">Hi ${name},</p>

    <p style="color:#1a1a1a; font-size:15px; margin:0 0 16px;">
      🎉 Welcome to NUVLYX! Your café <strong style="color:#b8941f;">${orgName}</strong> is now live.
    </p>

    <!-- TRIAL INFO -->
    <div style="background:#f0fdf4; border:1px solid #86efac; border-radius:12px; padding:16px 20px; margin:24px 0;">
      <div style="font-size:13px; font-weight:700; color:#16a34a; margin-bottom:6px;">
        🎁 14-Day Business Plan Trial Active
      </div>
      <div style="font-size:13px; color:#15803d;">
        Full access to all features until <strong>${trialDateStr}</strong>
      </div>
    </div>

    <h3 style="margin:32px 0 12px; font-size:16px; color:#1a1a1a; font-weight:700;">
      🔑 Your Staff Credentials
    </h3>
    <p style="font-size:13px; color:#555555; margin:0 0 16px;">
      These are <strong>login IDs only</strong> for your staff. Share the credentials with each team member. They can change passwords after first login.
    </p>

    <div style="background:#eff6ff; border:1px solid #93c5fd; border-radius:8px; padding:10px 14px; margin:12px 0 16px; font-size:12px; color:#1e3a8a;">
      💡 <strong>Note:</strong> Staff emails ending in <code style="color:#b8941f; background:#fef9e6; padding:2px 6px; border-radius:4px;">.nuvlyx.app</code> are login IDs only and do not receive emails. Only your owner email (this one) gets system notifications.
    </div>

    <!-- STAFF TABLE -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#fafafa; border-radius:10px; overflow:hidden; border:1px solid #e8e8ea;">
      <thead>
        <tr style="background:#fef9e6;">
          <th style="padding:12px; text-align:left; font-size:11px; color:#b8941f; text-transform:uppercase; letter-spacing:1px; font-weight:800;">Role</th>
          <th style="padding:12px; text-align:left; font-size:11px; color:#b8941f; text-transform:uppercase; letter-spacing:1px; font-weight:800;">Email</th>
          <th style="padding:12px; text-align:left; font-size:11px; color:#b8941f; text-transform:uppercase; letter-spacing:1px; font-weight:800;">Password</th>
        </tr>
      </thead>
      <tbody>
        ${staffRows}
      </tbody>
    </table>

    <h3 style="margin:32px 0 12px; font-size:16px; color:#1a1a1a; font-weight:700;">
      🚀 Quick Start Guide
    </h3>

    <ol style="padding-left:20px; color:#3a3a3a; font-size:14px; line-height:1.8; margin:0;">
      <li>Login to your dashboard</li>
      <li>Add your branch details + contact info</li>
      <li>Create your menu categories and items</li>
      <li>Set up your tables</li>
      <li>Generate QR codes for self-service ordering</li>
      <li>Start taking orders! 🎉</li>
    </ol>

    <p style="margin-top:32px; font-size:14px; color:#555555;">
      Have questions? Just reply to this email — we read every one.
    </p>

    <p style="font-size:14px; color:#555555; margin-bottom:0;">
      Welcome aboard,<br/>
      <strong style="color:#b8941f;">The NUVLYX Team</strong>
    </p>
  `;

  return baseTemplate({
    title: `Welcome to NUVLYX, ${name.split(" ")[0]}! 🎉`,
    preheader: `Your café ${orgName} is now live. Here are your credentials.`,
    content,
    cta: {
      text: "Go to Dashboard →",
      url: `${appUrl}/login`
    }
  });
}

module.exports = welcomeEmailTemplate;
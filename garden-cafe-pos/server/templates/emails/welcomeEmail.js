const baseTemplate = require("./baseTemplate");

/**
 * Welcome email — sent after email verification
 * @param {Object} opts
 * @param {string} opts.name           - Owner name
 * @param {string} opts.orgName        - Cafe name
 * @param {Array} opts.staff           - Array of {role, email, password}
 * @param {Date} opts.trialEndsAt      - Trial end date
 */
function welcomeEmailTemplate({ name, orgName, staff = [], trialEndsAt }) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";

  // Format trial end date
  const trialDateStr = trialEndsAt
    ? new Date(trialEndsAt).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric"
      })
    : "soon";

  // Staff credentials table
  const staffRows = staff.map(s => `
    <tr>
      <td style="padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:rgba(255,255,255,0.85); text-transform:capitalize;">
        ${s.role.replace("_", " ")}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:#d4af37; font-family:'Courier New', monospace;">
        ${s.email}
      </td>
      <td style="padding:10px 12px; border-bottom:1px solid rgba(255,255,255,0.06); font-size:13px; color:rgba(255,255,255,0.6); font-family:'Courier New', monospace;">
        ${s.password}
      </td>
    </tr>
  `).join("");

  const content = `
    <p>Hi ${name},</p>

    <p>🎉 Welcome to NUVLYX! Your café <strong style="color:#d4af37;">${orgName}</strong> is now live.</p>

    <!-- TRIAL INFO -->
    <div style="background:rgba(76,175,80,0.1); border:1px solid rgba(76,175,80,0.3); border-radius:12px; padding:16px 20px; margin:24px 0;">
      <div style="font-size:13px; font-weight:700; color:#4caf50; margin-bottom:4px;">
        🎁 14-Day Business Plan Trial Active
      </div>
      <div style="font-size:13px; color:rgba(255,255,255,0.7);">
        Full access to all features until <strong>${trialDateStr}</strong>
      </div>
    </div>

    <h3 style="margin:32px 0 12px; font-size:16px; color:#ffffff;">
      🔑 Your Staff Credentials
    </h3>
    <p style="font-size:13px; color:rgba(255,255,255,0.6); margin:0 0 16px;">
  These are <strong>login IDs only</strong> for your staff. Share the credentials with each team member. They can change passwords after first login.
</p>

<div style="background:rgba(33,150,243,0.08); border:1px solid rgba(33,150,243,0.2); border-radius:8px; padding:10px 14px; margin:12px 0 16px; font-size:12px; color:rgba(255,255,255,0.7);">
  💡 <strong>Note:</strong> Staff emails ending in <code style="color:#d4af37;">.nuvlyx.app</code> are login IDs only and do not receive emails. Only your owner email (this one) gets system notifications.
</div>

    <!-- STAFF TABLE -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:rgba(255,255,255,0.03); border-radius:10px; overflow:hidden; border:1px solid rgba(255,255,255,0.08);">
      <thead>
        <tr style="background:rgba(212,175,55,0.08);">
          <th style="padding:12px; text-align:left; font-size:11px; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">Role</th>
          <th style="padding:12px; text-align:left; font-size:11px; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">Email</th>
          <th style="padding:12px; text-align:left; font-size:11px; color:#d4af37; text-transform:uppercase; letter-spacing:1px;">Password</th>
        </tr>
      </thead>
      <tbody>
        ${staffRows}
      </tbody>
    </table>

    <h3 style="margin:32px 0 12px; font-size:16px; color:#ffffff;">
      🚀 Quick Start Guide
    </h3>

    <ol style="padding-left:20px; color:rgba(255,255,255,0.8); font-size:14px; line-height:1.8;">
      <li>Login to your dashboard</li>
      <li>Add your branch details + contact info</li>
      <li>Create your menu categories and items</li>
      <li>Set up your tables</li>
      <li>Generate QR codes for self-service ordering</li>
      <li>Start taking orders! 🎉</li>
    </ol>

    <p style="margin-top:32px; font-size:14px; color:rgba(255,255,255,0.7);">
      Have questions? Just reply to this email — we read every one.
    </p>

    <p style="font-size:14px; color:rgba(255,255,255,0.7);">
      Welcome aboard,<br/>
      <strong style="color:#d4af37;">The NUVLYX Team</strong>
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
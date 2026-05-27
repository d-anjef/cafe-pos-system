const baseTemplate = require("./baseTemplate");

/**
 * Verification code email
 * @param {Object} opts
 * @param {string} opts.name           - Recipient name
 * @param {string} opts.code           - 6-digit code
 * @param {number} [opts.expiresInMin] - Expiry minutes
 */
function verifyEmailTemplate({ name, code, expiresInMin = 10 }) {
  const content = `
    <p>Hi ${name},</p>

    <p>Welcome to NUVLYX! Please verify your email address using the code below:</p>

    <!-- VERIFICATION CODE BOX -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:32px 0;">
      <tr>
        <td align="center">
          <div style="background:rgba(212,175,55,0.08); border:2px solid rgba(212,175,55,0.3); border-radius:14px; padding:24px 32px; display:inline-block;">
            <div style="font-size:11px; color:rgba(255,255,255,0.5); letter-spacing:2px; text-transform:uppercase; margin-bottom:8px;">
              Your Verification Code
            </div>
            <div style="font-size:42px; font-weight:900; color:#d4af37; letter-spacing:12px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- INSTRUCTIONS -->
    <div style="background:rgba(255,255,255,0.05); border-radius:10px; padding:16px 20px; margin:24px 0; font-size:13px; color:rgba(255,255,255,0.7);">
      ⏱️ This code expires in <strong style="color:#d4af37;">${expiresInMin} minutes</strong><br/>
      🔒 Don't share this code with anyone<br/>
      ❓ Didn't request this? You can safely ignore this email
    </div>

    <p style="font-size:13px; color:rgba(255,255,255,0.5);">
      Enter this code on the signup page to activate your account.
    </p>
  `;

  return baseTemplate({
    title: "Verify your email",
    preheader: `Your NUVLYX verification code: ${code}`,
    content
  });
}

module.exports = verifyEmailTemplate;
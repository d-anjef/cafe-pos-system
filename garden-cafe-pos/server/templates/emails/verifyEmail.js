const baseTemplate = require("./baseTemplate");

/**
 * Verification code email
 */
function verifyEmailTemplate({ name, code, expiresInMin = 10 }) {
  const content = `
    <p style="color:#1a1a1a; font-size:15px; margin:0 0 16px;">Hi ${name},</p>

    <p style="color:#1a1a1a; font-size:15px; margin:0 0 16px;">
      Welcome to NUVLYX! Please verify your email address using the code below:
    </p>

    <!-- VERIFICATION CODE BOX -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:32px 0;">
      <tr>
        <td align="center">
          <div style="background:#fef9e6; border:2px solid #d4af37; border-radius:14px; padding:24px 32px; display:inline-block;">
            <div style="font-size:11px; color:#888888; letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; font-weight:700;">
              Your Verification Code
            </div>
            <div style="font-size:42px; font-weight:900; color:#b8941f; letter-spacing:12px; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
        </td>
      </tr>
    </table>

    <!-- INSTRUCTIONS -->
    <div style="background:#f5f5f7; border-radius:10px; padding:16px 20px; margin:24px 0; font-size:13px; color:#3a3a3a; line-height:1.8;">
      ⏱️ This code expires in <strong style="color:#b8941f;">${expiresInMin} minutes</strong><br/>
      🔒 Don't share this code with anyone<br/>
      ❓ Didn't request this? You can safely ignore this email
    </div>

    <p style="font-size:13px; color:#888888; margin-bottom:0;">
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
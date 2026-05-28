const baseTemplate = require("./baseTemplate");

/**
 * Password reset email
 * @param {Object} opts
 * @param {string} opts.name      - User's name
 * @param {string} opts.resetUrl  - Full reset URL with token
 * @param {number} opts.expiresInMin
 */
function passwordResetEmailTemplate({ name, resetUrl, expiresInMin = 60 }) {
  const content = `
    <p>Hi ${name},</p>

    <p>We received a request to reset your password for your NUVLYX account.</p>

    <p>Click the button below to set a new password:</p>

    <!-- SECURITY NOTICE -->
    <div style="background:rgba(212,175,55,0.08); border:1px solid rgba(212,175,55,0.25); border-radius:10px; padding:14px 18px; margin:20px 0; font-size:13px;">
      ⏱️ This link expires in <strong style="color:#d4af37;">${expiresInMin} minutes</strong><br/>
      🔒 The link can only be used once<br/>
      🚫 Didn't request this? You can safely ignore this email — your password won't change
    </div>

    <p style="font-size:13px; color:rgba(255,255,255,0.5); margin-top:24px;">
      Having trouble with the button? Copy and paste this link into your browser:
    </p>
    
    <p style="font-size:11px; color:#d4af37; word-break:break-all; background:rgba(255,255,255,0.03); padding:10px; border-radius:6px; font-family:'Courier New', monospace;">
      ${resetUrl}
    </p>
  `;

  return baseTemplate({
    title: "Reset your password",
    preheader: "Click the link to set a new password for your NUVLYX account",
    content,
    cta: {
      text: "Reset Password →",
      url: resetUrl
    }
  });
}

module.exports = passwordResetEmailTemplate;
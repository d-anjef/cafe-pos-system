// ============================================================
// Email Service — Reusable wrapper around Resend
// ============================================================

const { Resend } = require("resend");

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Default config from env
const FROM_EMAIL = process.env.EMAIL_FROM || "onboarding@resend.dev";
const FROM_NAME  = process.env.EMAIL_FROM_NAME || "NUVLYX";
const FROM       = `${FROM_NAME} <${FROM_EMAIL}>`;

/**
 * Send an email
 * @param {Object} options
 * @param {string|string[]} options.to       - Recipient email(s)
 * @param {string} options.subject           - Email subject
 * @param {string} options.html              - HTML content
 * @param {string} [options.text]            - Plain text fallback
 * @param {string} [options.replyTo]         - Reply-to address
 * @returns {Promise<{success, id?, error?}>}
 */
async function sendEmail({ to, subject, html, text, replyTo }) {
  // Validate
  if (!to || !subject || !html) {
    console.error("❌ Email missing required fields:", { to, subject });
    return { success: false, error: "Missing required fields" };
  }

  // Don't send if API key is missing
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ RESEND_API_KEY not set — email skipped");
    console.warn(`   Would have sent to: ${to}`);
    console.warn(`   Subject: ${subject}`);
    return { success: false, error: "Email service not configured" };
  }

  try {
    const result = await resend.emails.send({
      from:     FROM,
      to:       Array.isArray(to) ? to : [to],
      subject,
      html,
      text:     text || stripHtml(html),
      replyTo:  replyTo || process.env.SUPPORT_EMAIL
    });

    if (result.error) {
      console.error("❌ Email send error:", result.error);
      return { success: false, error: result.error.message };
    }

    console.log(`✅ Email sent to ${to} | ID: ${result.data?.id}`);
    return { success: true, id: result.data?.id };

  } catch (err) {
    console.error("❌ Email service crash:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Strip HTML for plain-text fallback
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 500);
}

/**
 * Generate a 6-digit numeric code
 */
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  sendEmail,
  generateVerificationCode
};
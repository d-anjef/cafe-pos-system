const { baseTemplate } = require('./baseTemplate');

/**
 * Trial expired email — sent on day 0 when trial ends
 * @param {Object} data - { name, orgName, gracePeriodEnd, upgradeUrl }
 */
function trialExpiredEmail(data) {
  const { name, orgName, gracePeriodEnd, upgradeUrl } = data;

  const formattedGraceEnd = new Date(gracePeriodEnd).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 26px; font-weight: 800;">
      Hi ${name},
    </h2>

    <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid #F59E0B; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">⏰</div>
      <div style="font-size: 20px; font-weight: 800; color: #F59E0B; margin-bottom: 8px;">
        Your trial has ended
      </div>
      <div style="font-size: 14px; color: #cbd5e1;">
        for <strong style="color: #ffffff;">${orgName}</strong>
      </div>
    </div>

    <p style="color: #cbd5e1; line-height: 1.7; font-size: 15px;">
      Your 14-day NUVLYX Business trial has ended. <strong style="color: #D4AF37;">Don't worry — your data is safe!</strong>
    </p>

    <div style="background: rgba(20, 20, 20, 0.5); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="color: #F59E0B; font-weight: 700; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
        🛡️ 7-Day Grace Period
      </div>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.7; margin: 0 0 12px 0;">
        You're now in <strong style="color: #ffffff;">read-only mode</strong> until <strong style="color: #ffffff;">${formattedGraceEnd}</strong>.
      </p>

      <div style="color: #cbd5e1; font-size: 14px; line-height: 1.8;">
        <strong style="color: #10b981;">✅ You can still:</strong>
        <ul style="margin: 6px 0 12px 0; padding-left: 20px;">
          <li>Log in and view all your data</li>
          <li>View orders, menu, and analytics</li>
          <li>Settle existing orders</li>
          <li>Export reports</li>
        </ul>

        <strong style="color: #ef4444;">❌ You cannot:</strong>
        <ul style="margin: 6px 0 0 0; padding-left: 20px;">
          <li>Create new orders</li>
          <li>Add new menu items or staff</li>
          <li>Modify settings</li>
        </ul>
      </div>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${upgradeUrl}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #D4AF37, #F0C445); color: #000000; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">
        Choose a Plan →
      </a>
    </div>

    <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 8px; margin-top: 24px;">
      <p style="color: #cbd5e1; font-size: 13px; margin: 0; line-height: 1.6;">
        ⚠️ <strong style="color: #EF4444;">After ${formattedGraceEnd}:</strong> Your account will auto-downgrade to the Free plan. Some features will be limited, but your data remains accessible.
      </p>
    </div>

    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin-top: 24px;">
      Need help choosing? Reply to this email or WhatsApp us at <a href="https://wa.me/9779803506667" style="color: #D4AF37;">+977-9803506667</a>
    </p>
  `;

  return baseTemplate({
    title: 'Your NUVLYX Trial Has Ended',
    preheader: `Your trial for ${orgName} has ended. You have 7 days to upgrade before auto-downgrade to Free.`,
    content
  });
}

module.exports = { trialExpiredEmail };
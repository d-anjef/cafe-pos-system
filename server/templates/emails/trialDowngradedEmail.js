const { baseTemplate } = require('./baseTemplate');

/**
 * Trial downgraded email — sent when grace period ends (Day +7)
 * @param {Object} data - { name, orgName, upgradeUrl }
 */
function trialDowngradedEmail(data) {
  const { name, orgName, upgradeUrl } = data;

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 26px; font-weight: 800;">
      Hi ${name},
    </h2>

    <div style="background: rgba(148, 163, 184, 0.1); border: 1px solid #94A3B8; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
      <div style="font-size: 48px; margin-bottom: 8px;">📦</div>
      <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
        Account moved to Free plan
      </div>
      <div style="font-size: 14px; color: #cbd5e1;">
        <strong>${orgName}</strong>
      </div>
    </div>

    <p style="color: #cbd5e1; line-height: 1.7; font-size: 15px;">
      Your grace period has ended, and <strong style="color: #ffffff;">${orgName}</strong> has been moved to our <strong style="color: #D4AF37;">Free plan</strong>.
    </p>

    <p style="color: #cbd5e1; line-height: 1.7; font-size: 15px;">
      <strong style="color: #10b981;">✅ Good news:</strong> All your data (menu, orders, branches, staff) is safe and accessible.
    </p>

    <div style="background: rgba(20, 20, 20, 0.5); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="color: #94A3B8; font-weight: 700; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
        📋 Free Plan Limits
      </div>
      <ul style="color: #cbd5e1; padding-left: 20px; line-height: 1.8; font-size: 14px; margin: 0;">
        <li><strong>1 branch</strong> (you may need to deactivate extras)</li>
        <li><strong>5 tables</strong> maximum</li>
        <li><strong>3 staff</strong> members</li>
        <li><strong>20 menu items</strong></li>
        <li>Basic analytics only</li>
        <li>No QR ordering, no PDF receipts, no custom branding</li>
      </ul>
    </div>

    <div style="background: rgba(212, 175, 55, 0.08); border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="color: #D4AF37; font-weight: 700; font-size: 14px; margin-bottom: 8px;">
        💎 Want it all back?
      </div>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Upgrade to any paid plan and instantly restore full access. All your settings will be remembered.
      </p>
      <div style="text-align: center;">
        <a href="${upgradeUrl}" style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #D4AF37, #F0C445); color: #000000; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px;">
          Upgrade Now →
        </a>
      </div>
    </div>

    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin-top: 24px;">
      We'd love to know why you didn't upgrade. Reply with any feedback — we're listening!
    </p>

    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6;">
      Thanks for trying NUVLYX. We hope to see you again on a paid plan! 🙏
    </p>
  `;

  return baseTemplate({
    title: 'Account Moved to Free Plan',
    preheader: `${orgName} is now on the Free plan. Upgrade anytime to restore full features.`,
    content
  });
}

module.exports = { trialDowngradedEmail };
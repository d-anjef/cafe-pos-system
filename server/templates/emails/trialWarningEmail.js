const { baseTemplate } = require('./baseTemplate');

/**
 * Trial warning email — sent 7, 3, and 1 days before expiry
 * @param {Object} data - { name, orgName, daysLeft, trialEndDate, upgradeUrl }
 */
function trialWarningEmail(data) {
  const { name, orgName, daysLeft, trialEndDate, upgradeUrl } = data;

  const urgencyColor = daysLeft <= 1 ? '#EF4444' : daysLeft <= 3 ? '#F59E0B' : '#D4AF37';
  const urgencyLabel = daysLeft === 1
    ? '⏰ Trial Ends Tomorrow!'
    : daysLeft <= 3
      ? '⚠️ Trial Ending Soon'
      : '📅 Trial Reminder';

  const formattedDate = new Date(trialEndDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    <h2 style="color: #ffffff; margin: 0 0 16px 0; font-size: 26px; font-weight: 800;">
      Hi ${name} 👋
    </h2>

    <div style="background: rgba(212, 175, 55, 0.1); border: 1px solid ${urgencyColor}; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
      <div style="font-size: 18px; font-weight: 700; color: ${urgencyColor}; margin-bottom: 8px;">
        ${urgencyLabel}
      </div>
      <div style="font-size: 48px; font-weight: 900; color: #D4AF37; margin: 8px 0;">
        ${daysLeft}
      </div>
      <div style="font-size: 14px; color: #cbd5e1;">
        ${daysLeft === 1 ? 'day left' : 'days left'} on your NUVLYX Business trial
      </div>
    </div>

    <p style="color: #cbd5e1; line-height: 1.7; font-size: 15px;">
      Your <strong style="color: #D4AF37;">14-day free trial</strong> for
      <strong style="color: #ffffff;">${orgName}</strong> ends on
      <strong style="color: #ffffff;">${formattedDate}</strong>.
    </p>

    <p style="color: #cbd5e1; line-height: 1.7; font-size: 15px;">
      Choose a plan now to keep using all your Business features without interruption:
    </p>

    <div style="background: rgba(20, 20, 20, 0.5); border: 1px solid rgba(212, 175, 55, 0.2); border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="color: #D4AF37; font-weight: 700; font-size: 14px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px;">
        ✨ What you'll keep
      </div>
      <ul style="color: #cbd5e1; padding-left: 20px; line-height: 1.8; font-size: 14px; margin: 0;">
        <li>QR Code customer ordering</li>
        <li>Up to 5 branches & 50 tables</li>
        <li>Custom branding</li>
        <li>PDF receipts</li>
        <li>Inventory tracking</li>
        <li>Priority email support</li>
      </ul>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${upgradeUrl}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #D4AF37, #F0C445); color: #000000; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px;">
        Upgrade Now →
      </a>
    </div>

    <div style="background: rgba(255, 255, 255, 0.03); padding: 16px; border-radius: 8px; margin-top: 24px;">
      <p style="color: #94A3B8; font-size: 13px; margin: 0; line-height: 1.6;">
        💡 <strong>What happens after trial ends?</strong><br>
        Your account will enter a 7-day read-only grace period, then auto-downgrade to the Free plan.
        Your data is always safe.
      </p>
    </div>

    <p style="color: #94A3B8; font-size: 13px; line-height: 1.6; margin-top: 24px;">
      Questions? Reply to this email or WhatsApp us at <a href="https://wa.me/9779803506667" style="color: #D4AF37;">+977-9803506667</a>
    </p>
  `;

  return baseTemplate({
    title: `Trial Ends in ${daysLeft} ${daysLeft === 1 ? 'Day' : 'Days'}`,
    preheader: `Your NUVLYX trial for ${orgName} ends in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}. Upgrade now to keep all features.`,
    content
  });
}

module.exports = { trialWarningEmail };
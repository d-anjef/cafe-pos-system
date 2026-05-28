// ============================================================
// Base HTML email template — LIGHT THEME (dark-mode safe)
// All emails wrap their content in this
// Works in BOTH light AND dark mode email clients
// ============================================================

/**
 * @param {Object} opts
 * @param {string} opts.title           - Email H1 title
 * @param {string} opts.preheader       - Preview text (shown in inbox)
 * @param {string} opts.content         - HTML body content
 * @param {Object} [opts.cta]           - Optional CTA button
 * @param {string} opts.cta.text        - Button label
 * @param {string} opts.cta.url         - Button URL
 */
function baseTemplate({ title, preheader = "", content, cta = null }) {
  const appUrl = process.env.APP_URL || "https://cafe-pos-system-wheat.vercel.app";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light only" />
  <title>${title}</title>
  <style>
    :root {
      color-scheme: light only;
      supported-color-schemes: light only;
    }
    body {
      margin: 0;
      padding: 0;
      background: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      color: #1a1a1a;
    }
    table { border-collapse: collapse; }
    a { color: #b8941f; text-decoration: none; }
    .preheader { display: none; max-height: 0; overflow: hidden; }

    /* Force light mode in Gmail/iOS Mail/Outlook dark mode */
    [data-ogsc] body, [data-ogsb] body { background: #f5f5f7 !important; color: #1a1a1a !important; }
    [data-ogsc] .email-card, [data-ogsb] .email-card { background: #ffffff !important; }
    [data-ogsc] .email-text, [data-ogsb] .email-text { color: #1a1a1a !important; }
    [data-ogsc] .email-text-soft, [data-ogsb] .email-text-soft { color: #555555 !important; }
    [data-ogsc] .email-text-muted, [data-ogsb] .email-text-muted { color: #888888 !important; }
    [data-ogsc] .brand-title, [data-ogsb] .brand-title { color: #b8941f !important; }
  </style>
</head>
<body class="email-body" style="margin:0; padding:0; background:#f5f5f7; color:#1a1a1a;">

  <!-- Preheader (hidden, but shows in inbox preview) -->
  <div class="preheader" style="display:none;font-size:1px;color:#f5f5f7;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f5f5f7; padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px; width:100%;">

          <!-- LOGO/BRAND -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 class="brand-title" style="margin:0; font-size:32px; font-weight:900; color:#b8941f; letter-spacing:3px;">
                NUVLYX
              </h1>
              <p class="email-text-muted" style="margin:6px 0 0; font-size:11px; color:#888888; letter-spacing:1.5px; text-transform:uppercase; font-weight:600;">
                From idea to impact
              </p>
            </td>
          </tr>

          <!-- CONTENT CARD -->
          <tr>
            <td class="email-card" style="background:#ffffff; border-radius:16px; padding:40px 32px; border:1px solid #e8e8ea; box-shadow: 0 2px 12px rgba(0,0,0,0.04);">

              <!-- Gold accent bar -->
              <div style="height:4px; background:linear-gradient(90deg, #d4af37, #f0c445, #d4af37); border-radius:2px; margin:-40px -32px 28px -32px; border-radius:16px 16px 0 0;"></div>

              <!-- Title -->
              <h2 class="email-text" style="margin:0 0 20px; font-size:24px; font-weight:800; color:#1a1a1a; line-height:1.3;">
                ${title}
              </h2>

              <!-- Body content -->
              <div class="email-text-soft" style="color:#3a3a3a; font-size:15px; line-height:1.7;">
                ${content}
              </div>

              ${cta ? `
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="${cta.url}"
                       style="display:inline-block; background:linear-gradient(135deg, #d4af37 0%, #f0c445 100%); color:#1a1a1a; padding:14px 36px; border-radius:10px; font-weight:800; font-size:15px; text-decoration:none; box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);">
                      ${cta.text}
                    </a>
                  </td>
                </tr>
              </table>
              ` : ""}

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding-top: 32px;">
              <p class="email-text-muted" style="margin:0 0 8px; font-size:13px; color:#666666; font-weight:600;">
                NUVLYX SaaS POS · Built for cafés in Nepal
              </p>
              <p class="email-text-muted" style="margin:0 0 6px; font-size:12px; color:#888888;">
                Need help? Reply to this email or visit
                <a href="${appUrl}" style="color:#b8941f; font-weight:600;">our website</a>
              </p>
              <p class="email-text-muted" style="margin:8px 0 16px; font-size:12px; color:#888888;">
                📱 WhatsApp:
                <a href="https://wa.me/9779803506667" style="color:#b8941f; font-weight:600;">+977-9803506667</a>
              </p>
              <p style="margin:16px 0 0; font-size:11px; color:#aaaaaa;">
                © ${new Date().getFullYear()} NUVLYX. All rights reserved.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
  `.trim();
}

module.exports = baseTemplate;
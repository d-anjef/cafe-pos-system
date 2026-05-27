// ============================================================
// Base HTML email template
// All emails wrap their content in this
// Dark theme with gold accent (NUVLYX brand)
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
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0f0f0f; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
    table { border-collapse: collapse; }
    a { color: #d4af37; text-decoration: none; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body style="margin:0; padding:0; background:#0f0f0f; color:#ffffff;">

  <!-- Preheader (hidden, but shows in inbox preview) -->
  <div class="preheader" style="display:none;font-size:1px;color:#0f0f0f;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${preheader}
  </div>

  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#0f0f0f; padding: 40px 20px;">
    <tr>
      <td align="center">

        <!-- Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px; width:100%;">

          <!-- LOGO/BRAND -->
          <tr>
            <td align="center" style="padding-bottom: 30px;">
              <h1 style="margin:0; font-size:28px; font-weight:900; color:#d4af37; letter-spacing:2px;">
                NUVLYX
              </h1>
              <p style="margin:4px 0 0; font-size:11px; color:rgba(255,255,255,0.4); letter-spacing:1px; text-transform:uppercase;">
                From idea to impact
              </p>
            </td>
          </tr>

          <!-- CONTENT CARD -->
          <tr>
            <td style="background:linear-gradient(135deg, #1a1a1a 0%, #1f1f1f 100%); border-radius:16px; padding:40px 32px; border:1px solid rgba(212,175,55,0.15);">
              
              <!-- Title -->
              <h2 style="margin:0 0 24px; font-size:24px; font-weight:700; color:#ffffff; line-height:1.3;">
                ${title}
              </h2>

              <!-- Body content -->
              <div style="color:rgba(255,255,255,0.85); font-size:15px; line-height:1.6;">
                ${content}
              </div>

              ${cta ? `
              <!-- CTA Button -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top:32px;">
                <tr>
                  <td align="center">
                    <a href="${cta.url}" 
                       style="display:inline-block; background:linear-gradient(135deg, #d4af37 0%, #f0cc55 100%); color:#000000; padding:14px 36px; border-radius:10px; font-weight:700; font-size:15px; text-decoration:none;">
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
              <p style="margin:0 0 8px; font-size:12px; color:rgba(255,255,255,0.4);">
                NUVLYX SaaS POS · Built for cafés in Nepal
              </p>
              <p style="margin:0; font-size:11px; color:rgba(255,255,255,0.3);">
                Need help? Reply to this email or visit 
                <a href="${appUrl}" style="color:#d4af37;">our website</a>
              </p>
              <p style="margin:16px 0 0; font-size:10px; color:rgba(255,255,255,0.25);">
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
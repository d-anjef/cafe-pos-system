import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Privacy = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />

    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">Legal</div>
        <h1 className="nv-page-title">Privacy <span className="nv-gradient-text">Policy</span></h1>
        <p className="nv-page-sub">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <section className="nv-section">
      <div className="nv-container nv-container-narrow">
        <div className="nv-prose">

          <p>
            NUVLYX ("we", "us", "our") is a SaaS Point-of-Sale platform built for cafés and restaurants,
            primarily serving Nepal. This Privacy Policy explains how we collect, use, store, and protect
            information when you use our service.
          </p>

          <h2>1. Information We Collect</h2>

          <p><strong>Account Information:</strong></p>
          <p>
            When you sign up, we collect your name, email address, business name, phone number,
            and password (encrypted). For staff accounts created by owners, we collect similar
            information about each staff member.
          </p>

          <p><strong>Business Data:</strong></p>
          <p>
            We store your menu items, prices, table configurations, branches, order history,
            sales data, and customer transactions you process through our system.
          </p>

          <p><strong>Payment Information:</strong></p>
          <p>
            When you subscribe to a paid plan, we collect payment references (eSewa/Khalti transaction
            IDs, bank transfer receipts). We do NOT store your payment card details directly —
            those are handled by payment providers.
          </p>

          <p><strong>Technical Data:</strong></p>
          <p>
            We automatically collect IP address, browser type, device information, login timestamps,
            and usage patterns for security and to improve our service.
          </p>

          <h2>2. How We Use Your Information</h2>

          <p>We use your data to:</p>
          <ul>
            <li>Provide and maintain the NUVLYX service</li>
            <li>Process orders, payments, and transactions in your café</li>
            <li>Send transactional emails (verification, password reset, billing)</li>
            <li>Notify you about plan changes, trial expirations, and updates</li>
            <li>Detect fraud and protect against unauthorized access</li>
            <li>Improve our product based on usage patterns (aggregated, anonymized)</li>
            <li>Comply with legal obligations under Nepali law</li>
          </ul>

          <h2>3. Data Sharing</h2>

          <p><strong>We do NOT sell your data.</strong></p>

          <p>We share data only with:</p>
          <ul>
            <li><strong>Service providers:</strong> Resend (email delivery), MongoDB Atlas (database), Vercel (frontend hosting), Render (backend hosting)</li>
            <li><strong>Payment processors:</strong> eSewa, Khalti, and banks when you make payments</li>
            <li><strong>Legal authorities:</strong> If required by Nepali law or valid court order</li>
          </ul>

          <h2>4. Data Storage & Security</h2>

          <p>
            Your data is stored on encrypted cloud servers (MongoDB Atlas). We use industry-standard
            security including HTTPS encryption, JWT authentication, password hashing (bcrypt),
            and access controls. However, no system is 100% secure — we cannot guarantee absolute security.
          </p>

          <h2>5. Data Retention</h2>

          <p>
            We retain your data as long as your account is active. After account deletion:
          </p>
          <ul>
            <li>Personal data: Deleted within 30 days</li>
            <li>Business/transaction records: Kept for 7 years (legal requirement for Nepali tax compliance)</li>
            <li>Anonymized analytics: May be retained indefinitely</li>
          </ul>

          <h2>6. Your Rights</h2>

          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of all your data</li>
            <li><strong>Correct:</strong> Update inaccurate information via your dashboard</li>
            <li><strong>Delete:</strong> Request account and data deletion (see Section 7)</li>
            <li><strong>Export:</strong> Download your menu, orders, and sales data (CSV)</li>
            <li><strong>Withdraw consent:</strong> Stop receiving marketing emails</li>
          </ul>

          <h2>7. Account Deletion</h2>

          <p>
            To request account deletion, email us at <strong>support@nuvlyx.anjef.com.np</strong> from
            the email associated with your account. Subject: "Delete My Account". We will:
          </p>
          <ul>
            <li>Confirm your identity within 3 business days</li>
            <li>Delete personal data within 30 days</li>
            <li>Send confirmation email when complete</li>
            <li>Retain transaction records as required by Nepali tax law (7 years)</li>
          </ul>

          <h2>8. Cookies</h2>

          <p>
            We use essential cookies for authentication (keeping you logged in) and session management.
            We do NOT use tracking cookies, advertising cookies, or third-party analytics cookies.
            See our cookie banner for details and your choices.
          </p>

          <h2>9. Children's Privacy</h2>

          <p>
            NUVLYX is not intended for users under 18. We do not knowingly collect data from minors.
            If you believe a minor has signed up, contact us and we'll delete the account.
          </p>

          <h2>10. Changes to This Policy</h2>

          <p>
            We may update this policy occasionally. Major changes will be notified via email
            at least 14 days before taking effect. Continued use after changes means acceptance.
          </p>

          <h2>11. Contact Us</h2>

          <p>
            For privacy questions, contact:<br />
            <strong>Email:</strong> support@nuvlyx.anjef.com.np<br />
            <strong>WhatsApp:</strong> +977-9803506667<br />
            <strong>Operated by:</strong> Anjef Dangol, Nepal
          </p>

          <h2>12. Governing Law</h2>

          <p>
            This policy is governed by the laws of Nepal. Any disputes will be resolved
            in courts of Kathmandu, Nepal.
          </p>

        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Privacy;
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Terms = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />

    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">Legal</div>
        <h1 className="nv-page-title">Terms of <span className="nv-gradient-text">Service</span></h1>
        <p className="nv-page-sub">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <section className="nv-section">
      <div className="nv-container nv-container-narrow">
        <div className="nv-prose">

          <p>
            Welcome to NUVLYX. By signing up or using our service, you agree to these Terms of Service.
            Please read carefully. If you do not agree, do not use NUVLYX.
          </p>

          <h2>1. About NUVLYX</h2>

          <p>
            NUVLYX is a multi-tenant Software-as-a-Service (SaaS) Point-of-Sale platform designed for
            cafés, restaurants, and food businesses in Nepal. The service is operated by Anjef Dangol,
            currently in pre-incorporation stage.
          </p>

          <h2>2. Eligibility</h2>

          <p>You must:</p>
          <ul>
            <li>Be at least 18 years old</li>
            <li>Provide accurate registration information</li>
            <li>Use NUVLYX for lawful business purposes only</li>
            <li>Comply with Nepali tax and business regulations</li>
          </ul>

          <h2>3. Account & Security</h2>

          <p>
            You are responsible for:
          </p>
          <ul>
            <li>Maintaining password confidentiality</li>
            <li>All activities under your account</li>
            <li>Notifying us immediately of unauthorized access</li>
            <li>Ensuring staff accounts you create comply with these terms</li>
          </ul>

          <h2>4. Subscription Plans & Billing</h2>

          <p>NUVLYX offers tiered plans:</p>
          <ul>
            <li><strong>Free:</strong> Basic features, no charge</li>
            <li><strong>Starter:</strong> NPR 999/month or NPR 9,590/year</li>
            <li><strong>Business:</strong> NPR 2,999/month or NPR 28,790/year</li>
            <li><strong>Enterprise:</strong> NPR 9,999/month or NPR 95,990/year</li>
          </ul>

          <p>
            Billing is upfront for the chosen period. We accept eSewa, Khalti, and bank transfers.
            All amounts are in Nepali Rupees (NPR) and exclude any applicable taxes.
          </p>

          <h2>5. Free Trial</h2>

          <p>
            New signups receive a 14-day trial of the Business plan. No credit card required.
            After trial expiry:
          </p>
          <ul>
            <li>Account enters 7-day read-only grace period</li>
            <li>After grace, account auto-downgrades to Free plan</li>
            <li>Data is preserved; you can upgrade anytime</li>
          </ul>

          <h2>6. Refund Policy</h2>

          <p>
            See our <a href="/refund-policy" style={{ color: 'var(--nv-gold)' }}>Refund Policy</a> for full details.
            Briefly: Refunds may be granted on case-by-case basis for valid reasons (service outage,
            billing errors, unused subscription period). Contact support to request.
          </p>

          <h2>7. Acceptable Use</h2>

          <p>You may NOT:</p>
          <ul>
            <li>Use NUVLYX for illegal activities, money laundering, or fraud</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Resell, sublicense, or white-label without Enterprise plan</li>
            <li>Overload our servers with automated requests or attacks</li>
            <li>Upload malware, viruses, or harmful content</li>
            <li>Impersonate other users or businesses</li>
            <li>Violate any third party's intellectual property rights</li>
          </ul>

          <h2>8. Your Data</h2>

          <p>
            <strong>You own your business data.</strong> Menu items, orders, customer information,
            sales reports — all yours. We only process this data to provide the service.
          </p>

          <p>
            You grant us a limited license to store, process, and back up your data as needed
            to run NUVLYX. We do not claim ownership of your business data.
          </p>

          <h2>9. Service Availability</h2>

          <p>
            We strive for 99% uptime but cannot guarantee uninterrupted service. Scheduled maintenance,
            third-party outages (hosting providers), or force majeure events may cause downtime.
            We are not liable for losses due to temporary unavailability.
          </p>

          <h2>10. Plan Limits</h2>

          <p>
            Each plan has limits on branches, tables, staff, and menu items. Exceeding limits
            may restrict functionality until you upgrade. We will notify you before limits affect operations.
          </p>

          <h2>11. Cancellation & Termination</h2>

          <p><strong>By you:</strong></p>
          <ul>
            <li>Cancel anytime from billing dashboard or by emailing support</li>
            <li>Service continues until end of current billing period</li>
            <li>Data is retained per Privacy Policy</li>
          </ul>

          <p><strong>By us:</strong> We may suspend or terminate your account for:</p>
          <ul>
            <li>Violation of these Terms</li>
            <li>Non-payment after 30 days past due</li>
            <li>Illegal activity</li>
            <li>Repeated security violations</li>
          </ul>

          <h2>12. Intellectual Property</h2>

          <p>
            NUVLYX software, design, logos, and documentation are owned by Anjef Dangol / NUVLYX
            and protected by copyright. You receive a limited, non-exclusive license to use the
            service per your subscription plan.
          </p>

          <h2>13. Disclaimers</h2>

          <p>
            NUVLYX is provided "AS IS" without warranties of any kind. We don't guarantee that:
          </p>
          <ul>
            <li>The service will meet all your business requirements</li>
            <li>The service will be error-free or uninterrupted</li>
            <li>Data will never be lost (always keep your own backups)</li>
            <li>Results from using NUVLYX will increase your café's revenue</li>
          </ul>

          <h2>14. Limitation of Liability</h2>

          <p>
            To the maximum extent permitted by Nepali law, our total liability for any claim related
            to NUVLYX is limited to the amount you paid us in the 12 months before the claim.
            We are NOT liable for indirect, consequential, or punitive damages.
          </p>

          <h2>15. Changes to Terms</h2>

          <p>
            We may update these Terms occasionally. Major changes will be notified via email at least
            14 days in advance. Continued use after changes constitutes acceptance.
          </p>

          <h2>16. Governing Law & Disputes</h2>

          <p>
            These Terms are governed by the laws of Nepal. Any disputes will be resolved through:
          </p>
          <ul>
            <li>Good-faith negotiation first</li>
            <li>Mediation if negotiation fails</li>
            <li>Courts of Kathmandu, Nepal as last resort</li>
          </ul>

          <h2>17. Contact</h2>

          <p>
            For questions about these Terms:<br />
            <strong>Email:</strong> support@nuvlyx.anjef.com.np<br />
            <strong>WhatsApp:</strong> +977-9803506667
          </p>

          <p style={{ marginTop: 32, padding: 16, background: 'var(--nv-surface-2)', borderRadius: 8 }}>
            <strong>By using NUVLYX, you acknowledge that you have read, understood, and agree to
            be bound by these Terms of Service.</strong>
          </p>

        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Terms;
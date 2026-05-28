import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Refund = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />

    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">Legal</div>
        <h1 className="nv-page-title">Refund <span className="nv-gradient-text">Policy</span></h1>
        <p className="nv-page-sub">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    </div>

    <section className="nv-section">
      <div className="nv-container nv-container-narrow">
        <div className="nv-prose">

          <p>
            At NUVLYX, we want you to be satisfied with our service. This policy explains when
            and how refunds may be requested for paid subscriptions.
          </p>

          <h2>Our Approach</h2>

          <p>
            We offer a <strong>14-day free trial</strong> on the Business plan for every new signup,
            so you can test all features risk-free before paying. We strongly recommend using the
            trial period to evaluate if NUVLYX fits your business.
          </p>

          <h2>When Refunds Are Available</h2>

          <p>We may grant refunds for the following valid reasons:</p>

          <ul>
            <li><strong>Service Outage:</strong> Extended downtime (over 24 hours) caused by us</li>
            <li><strong>Billing Error:</strong> You were charged incorrectly or multiple times</li>
            <li><strong>Major Bug:</strong> A critical bug that prevents you from using core features and we cannot fix within 7 days</li>
            <li><strong>Unused Period:</strong> You paid annually but want to cancel — pro-rated refund for unused months</li>
            <li><strong>Service Discontinuation:</strong> If we shut down NUVLYX, we'll refund unused subscription time</li>
          </ul>

          <h2>When Refunds Are NOT Available</h2>

          <ul>
            <li>Change of mind after using the service for more than 14 days</li>
            <li>Failure to use features your plan includes</li>
            <li>Account suspension due to Terms of Service violations</li>
            <li>Free trial periods (no payment involved)</li>
            <li>Add-on services or one-time setup fees</li>
            <li>Third-party costs (eSewa fees, payment processor charges)</li>
          </ul>

          <h2>How to Request a Refund</h2>

          <ol>
            <li>
              <strong>Email us</strong> at <strong>support@nuvlyx.anjef.com.np</strong> from your
              registered email address
            </li>
            <li>
              <strong>Subject line:</strong> "Refund Request — [Your Business Name]"
            </li>
            <li>
              <strong>Include:</strong>
              <ul>
                <li>Reason for refund</li>
                <li>Transaction reference / payment ID</li>
                <li>Date of payment</li>
                <li>Plan you were on</li>
                <li>Any evidence (screenshots, error messages)</li>
              </ul>
            </li>
            <li>
              <strong>Or contact</strong> via WhatsApp: +977-9803506667
            </li>
          </ol>

          <h2>Review Process</h2>

          <p>We will:</p>
          <ul>
            <li>Acknowledge your request within 2 business days</li>
            <li>Review your reason and account history</li>
            <li>Respond with our decision within 7 business days</li>
            <li>If approved, process refund within 10 business days to your original payment method</li>
          </ul>

          <h2>Refund Method</h2>

          <p>
            Refunds are issued to the original payment method:
          </p>
          <ul>
            <li><strong>eSewa:</strong> Refunded to your eSewa wallet</li>
            <li><strong>Khalti:</strong> Refunded to your Khalti wallet</li>
            <li><strong>Bank Transfer:</strong> Refunded to your bank account (you provide details)</li>
          </ul>

          <p>
            Note: Payment provider fees (eSewa/Khalti transaction fees) are non-refundable.
          </p>

          <h2>Pro-rated Refunds</h2>

          <p>
            For annual subscriptions cancelled mid-year:
          </p>
          <p>
            <strong>Formula:</strong> Refund = (Months Remaining / 12) × Amount Paid
          </p>
          <p>
            <strong>Example:</strong> You paid NPR 28,790 for Business annual. After 4 months,
            you cancel. Refund = (8/12) × 28,790 = NPR 19,193
          </p>

          <h2>Disputes</h2>

          <p>
            If you disagree with our refund decision, you may:
          </p>
          <ul>
            <li>Reply to our decision email with additional information</li>
            <li>Request escalation to founder review</li>
            <li>If still unresolved, follow dispute process in Terms of Service</li>
          </ul>

          <h2>Contact</h2>

          <p>
            For refund-related questions:<br />
            <strong>Email:</strong> support@nuvlyx.anjef.com.np<br />
            <strong>WhatsApp:</strong> +977-9803506667<br />
            <strong>Response time:</strong> Within 2 business days
          </p>

        </div>
      </div>
    </section>

    <Footer />
  </div>
);

export default Refund;
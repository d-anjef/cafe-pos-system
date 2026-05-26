import LandingNavbar from '../components/LandingNavbar';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const About = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />
    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">About us</div>
        <h1 className="nv-page-title">Built in Nepal. <span className="nv-gradient-text">For Nepali cafés.</span></h1>
        <p className="nv-page-sub">We're on a mission to empower every café with modern, accessible technology.</p>
      </div>
    </div>

    <section className="nv-section">
      <div className="nv-container nv-container-narrow">
        <div className="nv-prose">
          <h2>Our story</h2>
          <p>NUVLYX was born from a simple observation: most café POS systems were built for Western markets. Nothing supported eSewa, nothing felt local, and nothing was priced for small Nepali businesses.</p>

          <h2>Our mission</h2>
          <p>From idea to impact. We believe every café owner deserves enterprise-grade tools at accessible prices. Whether you run one stall or twenty branches — NUVLYX scales with you.</p>

          <h2>What we believe</h2>
          <p><strong>Local first.</strong> Built around eSewa, Khalti, and the Nepali workflow.<br/>
          <strong>Simple beats complex.</strong> Setup in minutes, not weeks.<br/>
          <strong>Honest pricing.</strong> No hidden fees, no per-transaction tax.<br/>
          <strong>You own your data.</strong> Always exportable, always yours.</p>
        </div>
      </div>
    </section>

    <CTASection />
    <Footer />
  </div>
);

export default About;
import LandingNavbar from '../components/LandingNavbar';
import PricingCard from '../components/PricingCard';
import FAQ from '../components/FQA';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Pricing = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />
    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">Pricing</div>
        <h1 className="nv-page-title">Simple plans, <span className="nv-gradient-text">no surprises</span></h1>
        <p className="nv-page-sub">Choose monthly or save 20% yearly. Cancel anytime.</p>
      </div>
    </div>
    <PricingCard />
    <FAQ />
    <CTASection />
    <Footer />
  </div>
);

export default Pricing;
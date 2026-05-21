import LandingNavbar from '../components/LandingNavbar';
import FeatureSection from '../components/FeatureSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Features = () => (
  <div className="nv-root nv-landing">
    <LandingNavbar />
    <div className="nv-page-header">
      <div className="nv-container">
        <div className="nv-eyebrow">Features</div>
        <h1 className="nv-page-title">Everything you need to <span className="nv-gradient-text">run smarter</span></h1>
        <p className="nv-page-sub">Powerful tools designed for cafés in Nepal.</p>
      </div>
    </div>
    <FeatureSection />
    <CTASection />
    <Footer />
  </div>
);

export default Features;
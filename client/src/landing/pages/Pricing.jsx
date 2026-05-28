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
    {/* ✅ Removed duplicate header — PricingCard already has its own */}
    <PricingCard />
    <FAQ />
    <CTASection />
    <Footer />
  </div>
);

export default Pricing;
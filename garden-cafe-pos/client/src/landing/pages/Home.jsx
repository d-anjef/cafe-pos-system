import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import PricingCard from '../components/PricingCard';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FQA';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Home = () => {
  return (
    <div className="nv-root nv-landing">
      <LandingNavbar />
      <Hero />
      <FeatureSection />
      <PricingCard />
      <Testimonials />
      <FAQ />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Home;
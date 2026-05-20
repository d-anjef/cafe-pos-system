import LandingNavbar from '../components/LandingNavbar';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import PricingCard from '../components/PricingCard';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FQA';
import Footer from '../components/Footer';

const Home = () => {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <Hero />
      <FeatureSection />
      <PricingCard />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
};

export default Home;
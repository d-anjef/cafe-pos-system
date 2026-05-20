import LandingNavbar from '../components/LandingNavbar';
import PricingCard from '../components/PricingCard';
import Footer from '../components/Footer';

const Pricing = () => {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <section style={{ paddingTop: '100px', minHeight: '30vh', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '3rem', marginBottom: '1rem' }}>
          Choose Your Plan
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Start with 14-day free trial. No credit card required.
        </p>
      </section>
      <PricingCard />
      <Footer />
    </div>
  );
};

export default Pricing;
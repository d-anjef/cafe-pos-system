import LandingNavbar from '../components/LandingNavbar';
import FeatureSection from '../components/FeatureSection';
import Footer from '../components/Footer';

const Features = () => {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <section style={{ paddingTop: '100px', minHeight: '50vh', textAlign: 'center' }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '3rem', marginBottom: '1rem' }}>
          All Features
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>
          Everything you need to run your cafe efficiently
        </p>
      </section>
      <FeatureSection />
      <Footer />
    </div>
  );
};

export default Features;
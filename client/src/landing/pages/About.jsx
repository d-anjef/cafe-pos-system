import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';

const About = () => {
  return (
    <div className="landing-page">
      <LandingNavbar />
      <section style={{ 
        paddingTop: '120px', 
        minHeight: '70vh', 
        maxWidth: '800px', 
        margin: '0 auto',
        padding: '120px 2rem 4rem'
      }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '3rem', marginBottom: '2rem' }}>
          About Garden & Cafe POS
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          We're on a mission to empower cafes and restaurants across Nepal with modern, 
          affordable point-of-sale technology.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: '1.8', marginBottom: '1.5rem' }}>
          Built specifically for the Nepali market, our system supports local payment 
          methods like eSewa and Khalti, while providing enterprise-grade features at 
          accessible prices.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem', lineHeight: '1.8' }}>
          Join hundreds of cafes already using Garden & Cafe POS to streamline their operations.
        </p>
      </section>
      <Footer />
    </div>
  );
};

export default About;
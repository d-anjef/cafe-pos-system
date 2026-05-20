import { useState } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you! We will contact you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="landing-page">
      <LandingNavbar />
      <section style={{ 
        paddingTop: '120px', 
        minHeight: '70vh', 
        maxWidth: '600px', 
        margin: '0 auto',
        padding: '120px 2rem 4rem'
      }}>
        <h1 style={{ color: 'var(--gold)', fontSize: '3rem', marginBottom: '2rem', textAlign: 'center' }}>
          Contact Us
        </h1>
        
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Mail size={20} />
            <span>support@gardencafe.com</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Phone size={20} />
            <span>+977-1-4123456</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
            <MapPin size={20} />
            <span>Thamel, Kathmandu, Nepal</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '1rem'
            }}
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            style={{
              padding: '1rem',
              background: 'var(--bg-secondary)',
              border: '2px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              resize: 'vertical'
            }}
          />
          <button type="submit" style={{
            padding: '1rem',
            background: 'var(--gold)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1.1rem',
            fontWeight: '700',
            cursor: 'pointer'
          }}>
            Send Message
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
};

export default Contact;
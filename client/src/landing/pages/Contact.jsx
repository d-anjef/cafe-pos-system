import { useState } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import Footer from '../components/Footer';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import '../styles/nuvlyx-landing.css';
import '../../styles/nuvlyx-theme.css';

const Contact = () => {
  const [data, setData] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setData({ name: '', email: '', message: '' });
      setSent(false);
    }, 3000);
  };

  return (
    <div className="nv-root nv-landing">
      <LandingNavbar />

      <div className="nv-page-header">
        <div className="nv-container">
          <div className="nv-eyebrow">Contact</div>
          <h1 className="nv-page-title">Let's <span className="nv-gradient-text">talk</span></h1>
          <p className="nv-page-sub">Got questions? Want a demo? We'd love to hear from you.</p>
        </div>
      </div>

      <section className="nv-section">
        <div className="nv-container">
          <div className="nv-contact-grid">

            {/* CONTACT INFO */}
            <div className="nv-contact-info">
              <h3>Get in touch</h3>
              <div className="nv-contact-item">
                <Mail size={20} />
                <div>
                  <small>Email</small>
                  <strong>hello@nuvlyx.com</strong>
                </div>
              </div>
              <div className="nv-contact-item">
                <Phone size={20} />
                <div>
                  <small>Phone</small>
                  <strong>+977-1-4123456</strong>
                </div>
              </div>
              <div className="nv-contact-item">
                <MapPin size={20} />
                <div>
                  <small>Office</small>
                  <strong>Thamel, Kathmandu, Nepal</strong>
                </div>
              </div>
            </div>

            {/* CONTACT FORM */}
            <form onSubmit={handleSubmit} className="nv-contact-form nv-glass">
              {sent ? (
                <div style={{textAlign:'center', padding:'40px 20px'}}>
                  <div style={{fontSize:48}}>✅</div>
                  <h3>Message sent!</h3>
                  <p style={{opacity:0.6}}>We'll get back within 24 hours.</p>
                </div>
              ) : (
                <>
                  <h3>Send us a message</h3>

                  <div className="nv-input-group">
                    <label>Name</label>
                    <input
                      type="text"
                      value={data.name}
                      onChange={e => setData({...data, name: e.target.value})}
                      placeholder="Your name"
                      required
                      style={{padding:12, border:'1px solid var(--nv-border)', borderRadius:10, background:'var(--nv-surface)', color:'var(--nv-text)'}}
                    />
                  </div>

                  <div className="nv-input-group">
                    <label>Email</label>
                    <input
                      type="email"
                      value={data.email}
                      onChange={e => setData({...data, email: e.target.value})}
                      placeholder="you@company.com"
                      required
                      style={{padding:12, border:'1px solid var(--nv-border)', borderRadius:10, background:'var(--nv-surface)', color:'var(--nv-text)'}}
                    />
                  </div>

                  <div className="nv-input-group">
                    <label>Message</label>
                    <textarea
                      value={data.message}
                      onChange={e => setData({...data, message: e.target.value})}
                      placeholder="How can we help?"
                      required
                      rows={5}
                      style={{padding:12, border:'1px solid var(--nv-border)', borderRadius:10, background:'var(--nv-surface)', color:'var(--nv-text)', resize:'vertical', fontFamily:'inherit'}}
                    />
                  </div>

                  <button type="submit" className="nv-btn-gold" style={{width:'100%', padding:14}}>
                    Send message <Send size={16} />
                  </button>
                </>
              )}
            </form>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
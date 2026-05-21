import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="nv-cta-section">
      <div className="nv-container">
        <div className="nv-cta-card">
          <div className="nv-cta-glow" />

          <Sparkles size={28} style={{ color: 'var(--nv-gold)', marginBottom: 16 }} />

          <h2>Ready to take your café <span className="nv-gradient-text">from idea to impact?</span></h2>
          <p>Join hundreds of Nepali cafés already growing with NUVLYX.</p>

          <div className="nv-cta-buttons">
            <Link to="/signup" className="nv-btn-gold" style={{ padding: '14px 28px' }}>
              Start free trial <ArrowRight size={16} />
            </Link>
            <Link to="/contact" className="nv-btn-ghost" style={{ padding: '14px 28px' }}>
              Talk to sales
            </Link>
          </div>

          <small>No credit card required · 14-day free trial · Cancel anytime</small>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
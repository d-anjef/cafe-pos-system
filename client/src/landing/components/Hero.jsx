import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Play } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <CheckCircle size={16} />
            <span>Trusted by 500+ cafes in Nepal</span>
          </div>

          <h1 className="hero-title">
            The Modern POS System for
            <span className="gradient-text"> Your Cafe & Restaurant</span>
          </h1>

          <p className="hero-subtitle">
            Streamline operations, boost sales, and delight customers with our 
            all-in-one point of sale solution. Start your 14-day free trial today.
          </p>

          <div className="hero-cta">
            <Link to="/signup" className="cta-primary">
              Start Free Trial
              <ArrowRight size={20} />
            </Link>
            <button className="cta-secondary">
              <Play size={20} />
              Watch Demo
            </button>
          </div>

          <div className="hero-features">
            <div className="hero-feature">
              <CheckCircle size={18} />
              <span>No credit card required</span>
            </div>
            <div className="hero-feature">
              <CheckCircle size={18} />
              <span>14-day free trial</span>
            </div>
            <div className="hero-feature">
              <CheckCircle size={18} />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <img 
              src="/images/dashboard-preview.png" 
              alt="Garden & Cafe POS Dashboard"
              className="hero-image"
            />
            <div className="floating-card card-1">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-label">Today's Sales</div>
                <div className="card-value">Rs 45,230</div>
                <div className="card-trend positive">+12.5%</div>
              </div>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🍽️</div>
              <div className="card-content">
                <div className="card-label">Active Orders</div>
                <div className="card-value">23</div>
              </div>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">⭐</div>
              <div className="card-content">
                <div className="card-label">Customer Rating</div>
                <div className="card-value">4.9/5</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-wave">
        <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg">
          <path 
            fill="var(--bg-secondary)" 
            d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
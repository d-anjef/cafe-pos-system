import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import './LandingNavbar.css';

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="landing-navbar">
      <div className="landing-navbar-container">
        <Link to="/" className="landing-logo">
          <span className="logo-icon">🌿</span>
          <span className="logo-text">Garden & Cafe POS</span>
        </Link>

        <div className={`landing-nav-links ${isOpen ? 'mobile-open' : ''}`}>
          <Link to="/features" className="nav-link">Features</Link>
          <Link to="/pricing" className="nav-link">Pricing</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          
          <div className="nav-actions">
            <Link to="/login" className="nav-btn login-btn">Login</Link>
            <Link to="/signup" className="nav-btn signup-btn">Start Free Trial</Link>
          </div>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  );
};

export default LandingNavbar;
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

const LandingNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { to: '/features', label: 'Features' },
    { to: '/pricing',  label: 'Pricing' },
    { to: '/about',    label: 'About' },
    { to: '/contact',  label: 'Contact' },
  ];

  return (
    <nav className={`nv-nav ${scrolled ? 'nv-nav-scrolled' : ''}`}>
      <div className="nv-nav-inner">

        {/* LOGO */}
        <Link to="/" className="nv-nav-logo">
          <div className="nv-nav-logo-icon">N</div>
          <span>NUVLYX</span>
        </Link>

        {/* DESKTOP LINKS */}
        <div className="nv-nav-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nv-nav-link ${location.pathname === link.to ? 'nv-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="nv-nav-actions">
          <ThemeToggle />
          <Link to="/login" className="nv-nav-login">Sign in</Link>
          <Link to="/signup" className="nv-btn-gold nv-nav-cta">
            Start Free Trial
          </Link>

          <button
            className="nv-mobile-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="nv-mobile-menu">
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} className="nv-mobile-link">
              {link.label}
            </Link>
          ))}
          <Link to="/login" className="nv-mobile-link">Sign in</Link>
          <Link to="/signup" className="nv-btn-gold" style={{ width: '100%' }}>
            Start Free Trial
          </Link>
        </div>
      )}
    </nav>
  );
};

export default LandingNavbar;
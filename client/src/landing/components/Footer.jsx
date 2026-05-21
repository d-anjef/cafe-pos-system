import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="nv-footer">
      <div className="nv-container">

        <div className="nv-footer-grid">

          {/* BRAND */}
          <div>
            <Link to="/" className="nv-nav-logo" style={{marginBottom:14}}>
              <div className="nv-nav-logo-icon">N</div>
              <span>NUVLYX</span>
            </Link>
            <p className="nv-footer-tagline">From idea to impact</p>
            <p className="nv-footer-desc">Modern POS for cafés. Built for Nepal, ready for the world.</p>
          </div>

          {/* PRODUCT */}
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link to="/features">Features</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
              <li><Link to="/signup">Free trial</Link></li>
              <li><a href="#demo">Request demo</a></li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><a href="#careers">Careers</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
          </div>

          {/* SUPPORT */}
          <div>
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#status">System status</a></li>
              <li><Link to="/contact">Contact support</Link></li>
            </ul>
          </div>

          {/* CONTACT */}
          <div>
            <h4>Contact</h4>
            <ul className="nv-footer-contact">
              <li><Mail size={14} /> <a href="mailto:hello@nuvlyx.com">hello@nuvlyx.com</a></li>
              <li><Phone size={14} /> <a href="tel:+97714123456">+977-1-4123456</a></li>
              <li><MapPin size={14} /> Thamel, Kathmandu, Nepal</li>
            </ul>
          </div>

        </div>

        <div className="nv-footer-bottom">
          <span>© {new Date().getFullYear()} NUVLYX. All rights reserved.</span>
          <div className="nv-footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/cookies">Cookies</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
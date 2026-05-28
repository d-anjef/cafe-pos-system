import { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Slight delay so it doesn't pop instantly
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'essential-only');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        maxWidth: 520,
        margin: '0 auto',
        background: 'var(--nv-glass, rgba(20, 20, 20, 0.95))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--nv-glass-border, rgba(212, 175, 55, 0.3))',
        borderRadius: 16,
        padding: 20,
        zIndex: 9999,
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        color: 'var(--nv-text, #fff)',
        animation: 'cookieSlideUp 0.4s ease-out'
      }}
    >
      <style>{`
        @keyframes cookieSlideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#d4af37',
            flexShrink: 0
          }}
        >
          <Cookie size={20} />
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700 }}>
            We value your privacy
          </h4>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}>
            We use essential cookies for authentication and core functionality.
            We do NOT use tracking or advertising cookies.{' '}
            <Link
              to="/privacy"
              style={{ color: '#d4af37', textDecoration: 'underline' }}
            >
              Learn more
            </Link>
          </p>
        </div>

        <button
          onClick={handleDecline}
          aria-label="Close"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            opacity: 0.5,
            padding: 4
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={handleDecline}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 8,
            color: 'inherit',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Essential only
        </button>
        <button
          onClick={handleAccept}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'linear-gradient(135deg, #d4af37, #f0c445)',
            border: 'none',
            borderRadius: 8,
            color: '#000',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer'
          }}
        >
          Accept all
        </button>
      </div>
    </div>
  );
};

export default CookieBanner;
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import '../styles/nuvlyx-theme.css';

export default function NotFound() {
  return (
    <div className="nv-root" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'var(--nv-bg)'
    }}>
      <div style={{
        maxWidth: 500,
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: 120,
          fontWeight: 900,
          lineHeight: 1,
          background: 'linear-gradient(135deg, #d4af37, #f0c445)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: 20
        }}>
          404
        </div>

        <h1 style={{
          fontSize: 32,
          fontWeight: 800,
          color: 'var(--nv-text)',
          margin: '0 0 12px 0'
        }}>
          Page Not Found
        </h1>

        <p style={{
          fontSize: 16,
          color: 'var(--nv-text-soft)',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <Link to="/" className="nv-btn-gold">
            <Home size={16} /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="nv-btn-ghost"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>

        <p style={{
          marginTop: 40,
          fontSize: 13,
          color: 'var(--nv-text-muted)'
        }}>
          Need help? <a
            href="mailto:support@nuvlyx.anjef.com.np"
            style={{ color: '#d4af37' }}
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
import { Link } from 'react-router-dom';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import '../styles/nuvlyx-theme.css';

export default function ServerError() {
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
          width: 100,
          height: 100,
          margin: '0 auto 24px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '2px solid #ef4444',
          borderRadius: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ef4444'
        }}>
          <AlertTriangle size={48} />
        </div>

        <div style={{
          fontSize: 64,
          fontWeight: 900,
          color: '#ef4444',
          margin: '0 0 12px 0',
          letterSpacing: '-2px'
        }}>
          500
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 800,
          color: 'var(--nv-text)',
          margin: '0 0 12px 0'
        }}>
          Something Went Wrong
        </h1>

        <p style={{
          fontSize: 15,
          color: 'var(--nv-text-soft)',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          Our servers are having a moment. We've been notified and are working on it.
          Try refreshing the page or come back in a few minutes.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => window.location.reload()}
            className="nv-btn-gold"
          >
            <RefreshCw size={16} /> Refresh Page
          </button>
          <Link to="/" className="nv-btn-ghost">
            <Home size={16} /> Go Home
          </Link>
        </div>

        <p style={{
          marginTop: 40,
          fontSize: 13,
          color: 'var(--nv-text-muted)'
        }}>
          If this keeps happening, <a
            href="mailto:support@nuvlyx.anjef.com.np"
            style={{ color: '#d4af37' }}
          >
            contact support
          </a>
        </p>
      </div>
    </div>
  );
}
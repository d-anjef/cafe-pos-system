import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, X, Sparkles, Crown } from 'lucide-react';
import api from '../services/api';

export default function TrialBanner() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const res = await api.get('/trial/info');
        setInfo(res.data);

        // Show notification on login
        const lastShown = sessionStorage.getItem('trialBannerShown');
        if (!lastShown) {
          setTimeout(() => setShow(true), 1500); // Delay for nice entrance
          sessionStorage.setItem('trialBannerShown', 'true');
        }
      } catch (err) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    loadInfo();
    const interval = setInterval(loadInfo, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setShow(false);
  };

  const handleMinimize = () => {
    setMinimized(true);
  };

  const handleExpand = () => {
    setMinimized(false);
    setShow(true);
  };

  const handleUpgrade = () => {
    setShow(false);
    navigate('/admin');
    setTimeout(() => {
      // Try to click billing tab if exists
      const buttons = document.querySelectorAll('.sidebar-btn');
      buttons.forEach(btn => {
        if (btn.textContent.includes('Billing')) {
          btn.click();
        }
      });
    }, 100);
  };

  if (loading || !info) return null;

  // Don't show for paid/free/super_admin
  if (info.status === 'paid' || info.status === 'super_admin' || info.status === 'free') {
    return null;
  }

  // GRACE PERIOD — Always show, can't dismiss
  if (info.status === 'grace') {
    return (
      <NotificationCard
        variant="grace"
        icon={<AlertTriangle size={24} />}
        title="Trial Ended"
        message={
          info.daysLeft > 0
            ? `Read-only mode. Account auto-downgrades to Free in ${info.daysLeft} day${info.daysLeft !== 1 ? 's' : ''}.`
            : `Your account will move to Free plan soon. Upgrade NOW to keep all features and data.`
        }
        actionLabel="Upgrade Now"
        onAction={handleUpgrade}
        canDismiss={false}
        show={true}
      />
    );
  }

  // TRIALING
  if (info.status === 'trialing') {
    const daysLeft = info.daysLeft;

    // Critical: 0-1 days, can't dismiss
    if (daysLeft <= 1) {
      return (
        <NotificationCard
          variant="critical"
          icon={<Clock size={24} />}
          title={`Trial Ends ${daysLeft === 0 ? 'Today' : 'Tomorrow'}!`}
          message="Don't lose access to QR ordering, multiple branches, and all premium features. Upgrade now."
          actionLabel="Upgrade Now"
          onAction={handleUpgrade}
          canDismiss={false}
          show={true}
        />
      );
    }

    // Warning: 2-3 days
    if (daysLeft <= 3) {
      return (
        <>
          {minimized ? (
            <MinimizedPill
              variant="warning"
              icon={<Clock size={16} />}
              text={`${daysLeft}d left`}
              onClick={handleExpand}
            />
          ) : (
            <NotificationCard
              variant="warning"
              icon={<Clock size={24} />}
              title={`${daysLeft} days left on trial`}
              message="Upgrade now to keep QR ordering, multi-branch support, and all Business features."
              actionLabel="View Plans"
              onAction={handleUpgrade}
              canDismiss={true}
              onMinimize={handleMinimize}
              onClose={handleClose}
              show={show}
            />
          )}
        </>
      );
    }

    // Info: 4-14 days
    if (daysLeft > 3) {
      return (
        <>
          {minimized ? (
            <MinimizedPill
              variant="info"
              icon={<Sparkles size={16} />}
              text={`${daysLeft}d trial`}
              onClick={handleExpand}
            />
          ) : (
            <NotificationCard
              variant="info"
              icon={<Sparkles size={24} />}
              title={`Welcome! ${daysLeft} days of Business trial left`}
              message="You have full access to all premium features. Explore everything and decide what fits best."
              actionLabel="View Plans"
              onAction={handleUpgrade}
              canDismiss={true}
              onMinimize={handleMinimize}
              onClose={handleClose}
              show={show}
            />
          )}
        </>
      );
    }
  }

  return null;
}

// ============================================================
// NOTIFICATION CARD (Bottom-right popup)
// ============================================================
function NotificationCard({
  variant,
  icon,
  title,
  message,
  actionLabel,
  onAction,
  canDismiss,
  onClose,
  onMinimize,
  show
}) {
  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes notifSlideIn {
          from {
            transform: translateY(100%) translateX(0);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(0);
            opacity: 1;
          }
        }
        @keyframes notifPulse {
          0%, 100% { box-shadow: 0 10px 40px ${colors[variant].glow}; }
          50% { box-shadow: 0 15px 50px ${colors[variant].glowStrong}; }
        }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 400,
        width: 'calc(100vw - 48px)',
        background: '#fff',
        borderRadius: 16,
        border: `2px solid ${colors[variant].border}`,
        boxShadow: `0 10px 40px ${colors[variant].glow}`,
        animation: variant === 'grace' || variant === 'critical'
          ? 'notifSlideIn 0.5s ease-out, notifPulse 2s ease-in-out infinite'
          : 'notifSlideIn 0.5s ease-out',
        overflow: 'hidden'
      }}>

        {/* HEADER STRIPE */}
        <div style={{
          height: 4,
          background: `linear-gradient(90deg, ${colors[variant].border}, ${colors[variant].accent})`
        }} />

        <div style={{ padding: 20 }}>

          {/* TOP ROW — Icon + Title + Close */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
            marginBottom: 12
          }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: colors[variant].iconBg,
              color: colors[variant].iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h4 style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 800,
                color: '#1a1a1a',
                lineHeight: 1.3
              }}>
                {title}
              </h4>
            </div>

            {canDismiss && (
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                <button
                  onClick={onMinimize}
                  title="Minimize"
                  style={iconBtnStyle}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="4" y="11" width="16" height="2" rx="1" />
                  </svg>
                </button>
                <button
                  onClick={onClose}
                  title="Dismiss"
                  style={iconBtnStyle}
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* MESSAGE */}
          <p style={{
            margin: '0 0 16px 0',
            fontSize: 13,
            color: '#555',
            lineHeight: 1.6
          }}>
            {message}
          </p>

          {/* ACTION BUTTON */}
          <button
            onClick={onAction}
            style={{
              width: '100%',
              padding: '11px 16px',
              borderRadius: 10,
              border: 'none',
              background: colors[variant].btnBg,
              color: colors[variant].btnText,
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: `0 4px 12px ${colors[variant].glow}`
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Crown size={14} />
            {actionLabel}
            <span style={{ marginLeft: 4 }}>→</span>
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================================
// MINIMIZED PILL (Small bottom-right indicator)
// ============================================================
function MinimizedPill({ variant, icon, text, onClick }) {
  return (
    <>
      <style>{`
        @keyframes pillSlideIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>

      <button
        onClick={onClick}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          padding: '8px 14px',
          background: '#fff',
          border: `2px solid ${colors[variant].border}`,
          borderRadius: 100,
          color: colors[variant].border,
          fontWeight: 700,
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          boxShadow: `0 4px 16px ${colors[variant].glow}`,
          animation: 'pillSlideIn 0.3s ease-out'
        }}
        title="Click to view trial info"
      >
        {icon}
        <span>{text}</span>
      </button>
    </>
  );
}

// ============================================================
// COLOR PALETTE
// ============================================================
const colors = {
  grace: {
    border: '#ef4444',
    accent: '#dc2626',
    iconBg: 'rgba(239, 68, 68, 0.12)',
    iconColor: '#ef4444',
    btnBg: '#ef4444',
    btnText: '#fff',
    glow: 'rgba(239, 68, 68, 0.2)',
    glowStrong: 'rgba(239, 68, 68, 0.35)'
  },
  critical: {
    border: '#f59e0b',
    accent: '#d97706',
    iconBg: 'rgba(245, 158, 11, 0.12)',
    iconColor: '#f59e0b',
    btnBg: '#f59e0b',
    btnText: '#fff',
    glow: 'rgba(245, 158, 11, 0.2)',
    glowStrong: 'rgba(245, 158, 11, 0.35)'
  },
  warning: {
    border: '#d4af37',
    accent: '#f0c445',
    iconBg: 'rgba(212, 175, 55, 0.12)',
    iconColor: '#d4af37',
    btnBg: 'linear-gradient(135deg, #d4af37, #f0c445)',
    btnText: '#000',
    glow: 'rgba(212, 175, 55, 0.25)',
    glowStrong: 'rgba(212, 175, 55, 0.4)'
  },
  info: {
    border: '#d4af37',
    accent: '#f0c445',
    iconBg: 'rgba(212, 175, 55, 0.12)',
    iconColor: '#d4af37',
    btnBg: 'linear-gradient(135deg, #d4af37, #f0c445)',
    btnText: '#000',
    glow: 'rgba(212, 175, 55, 0.2)',
    glowStrong: 'rgba(212, 175, 55, 0.3)'
  }
};

const iconBtnStyle = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: 'none',
  background: 'transparent',
  color: '#999',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s'
};
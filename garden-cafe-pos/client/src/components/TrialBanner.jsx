import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, X, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function TrialBanner() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInfo = async () => {
      try {
        const res = await api.get('/trial/info');
        setInfo(res.data);
      } catch (err) {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    loadInfo();

    // Refresh every 5 minutes
    const interval = setInterval(loadInfo, 5 * 60 * 1000);

    // Check dismissal state
    const dismissedAt = localStorage.getItem('trialBannerDismissed');
    if (dismissedAt) {
      const hoursSince = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) {
        setDismissed(true);
      }
    }

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('trialBannerDismissed', Date.now().toString());
  };

  const handleUpgrade = () => {
    navigate('/admin');
    // Trigger billing tab (handled in URL or state)
    setTimeout(() => {
      const billingBtn = document.querySelector('[data-tab="billing"]');
      if (billingBtn) billingBtn.click();
    }, 100);
  };

  if (loading || !info) return null;

  // Don't show for paid users or super admin
  if (info.status === 'paid' || info.status === 'super_admin' || info.status === 'free') {
    return null;
  }

  // ============================================================
  // GRACE PERIOD BANNER — RED, can't dismiss
  // ============================================================
  if (info.status === 'grace') {
    return (
      <div style={styles.banner('grace')}>
        <div style={styles.content}>
          <div style={styles.iconBox('grace')}>
            <AlertTriangle size={20} />
          </div>
          <div style={styles.text}>
            <div style={styles.title}>
              ⚠️ Trial Ended — Read-Only Mode
            </div>
            <div style={styles.subtitle}>
              {info.daysLeft > 0
                ? `Auto-downgrade to Free plan in ${info.daysLeft} day${info.daysLeft !== 1 ? 's' : ''}. Upgrade now to keep all features.`
                : `Your account will downgrade to Free plan soon. Upgrade NOW to keep your data accessible.`
              }
            </div>
          </div>
          <button onClick={handleUpgrade} style={styles.btn('grace')}>
            Upgrade Now →
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // TRIALING BANNER — Show only if dismissible & not dismissed
  // ============================================================
  if (info.status === 'trialing') {
    const daysLeft = info.daysLeft;

    // Critical: 0-1 days, can't dismiss
    if (daysLeft <= 1) {
      return (
        <div style={styles.banner('critical')}>
          <div style={styles.content}>
            <div style={styles.iconBox('critical')}>
              <Clock size={20} />
            </div>
            <div style={styles.text}>
              <div style={styles.title}>
                ⏰ Trial Ends {daysLeft === 0 ? 'Today' : 'Tomorrow'}!
              </div>
              <div style={styles.subtitle}>
                Don't lose access — upgrade now to keep all your Business features.
              </div>
            </div>
            <button onClick={handleUpgrade} style={styles.btn('critical')}>
              Upgrade Now →
            </button>
          </div>
        </div>
      );
    }

    // Warning: 2-3 days, dismissible
    if (daysLeft <= 3 && !dismissed) {
      return (
        <div style={styles.banner('warning')}>
          <div style={styles.content}>
            <div style={styles.iconBox('warning')}>
              <Clock size={20} />
            </div>
            <div style={styles.text}>
              <div style={styles.title}>
                Trial ends in {daysLeft} days
              </div>
              <div style={styles.subtitle}>
                Upgrade now to keep QR ordering, multiple branches, and all premium features.
              </div>
            </div>
            <button onClick={handleUpgrade} style={styles.btn('warning')}>
              Upgrade
            </button>
            <button onClick={handleDismiss} style={styles.closeBtn}>
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    // Info: 4-14 days, dismissible
    if (daysLeft > 3 && !dismissed) {
      return (
        <div style={styles.banner('info')}>
          <div style={styles.content}>
            <div style={styles.iconBox('info')}>
              <Sparkles size={18} />
            </div>
            <div style={styles.text}>
              <div style={styles.titleSmall}>
                ✨ {daysLeft} days left on your Business trial
              </div>
            </div>
            <button onClick={handleUpgrade} style={styles.btnSmall('info')}>
              View Plans
            </button>
            <button onClick={handleDismiss} style={styles.closeBtn}>
              <X size={14} />
            </button>
          </div>
        </div>
      );
    }
  }

  return null;
}

// ============================================================
// STYLES
// ============================================================
const colors = {
  grace: {
    bg: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    border: '#ef4444',
    text: '#991b1b',
    iconBg: '#ef4444',
    iconColor: '#fff'
  },
  critical: {
    bg: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
    border: '#f59e0b',
    text: '#92400e',
    iconBg: '#f59e0b',
    iconColor: '#fff'
  },
  warning: {
    bg: 'linear-gradient(135deg, #fefce8, #fef3c7)',
    border: '#d4af37',
    text: '#854d0e',
    iconBg: '#d4af37',
    iconColor: '#fff'
  },
  info: {
    bg: 'linear-gradient(135deg, #f9fafb, #f3f4f6)',
    border: '#d4af37',
    text: '#1a1a1a',
    iconBg: 'rgba(212, 175, 55, 0.15)',
    iconColor: '#d4af37'
  }
};

const styles = {
  banner: (variant) => ({
    background: colors[variant].bg,
    borderBottom: `2px solid ${colors[variant].border}`,
    padding: '10px 16px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    color: colors[variant].text
  }),
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    maxWidth: 1400,
    margin: '0 auto',
    flexWrap: 'wrap'
  },
  iconBox: (variant) => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    background: colors[variant].iconBg,
    color: colors[variant].iconColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  }),
  text: {
    flex: 1,
    minWidth: 200
  },
  title: {
    fontWeight: 700,
    fontSize: 14,
    marginBottom: 2
  },
  titleSmall: {
    fontWeight: 600,
    fontSize: 13
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.85,
    lineHeight: 1.4
  },
  btn: (variant) => ({
    padding: '8px 18px',
    borderRadius: 8,
    border: 'none',
    background: colors[variant].iconBg,
    color: colors[variant].iconColor,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0
  }),
  btnSmall: (variant) => ({
    padding: '6px 14px',
    borderRadius: 6,
    border: `1px solid ${colors[variant].border}`,
    background: 'transparent',
    color: colors[variant].text,
    fontWeight: 600,
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0
  }),
  closeBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: 'inherit',
    opacity: 0.6,
    padding: 4,
    display: 'flex',
    alignItems: 'center'
  }
};
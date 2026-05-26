import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    description: 'For testing the waters',
    features: ['1 Branch', '5 Tables', '3 Staff', '20 Menu Items', 'Basic analytics', 'Email support'],
    cta: 'Get started',
    highlighted: false,
  },
  {
    name: 'Starter',
    monthly: 999,
    yearly: 9590,
    description: 'For small single-branch cafés',
    features: ['1 Branch', '15 Tables', '5 Staff', '50 Menu items', 'PDF receipts', 'Priority email'],
    cta: 'Start free trial',
    highlighted: false,
  },
  {
    name: 'Business',
    monthly: 2999,
    yearly: 28790,
    description: 'For growing multi-branch operations',
    features: ['5 Branches', '50 Tables', '20 Staff', '200 Menu items', 'Custom branding', 'Inventory tracking', 'Phone support'],
    cta: 'Start free trial',
    highlighted: true,
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    monthly: 9999,
    yearly: 95990,
    description: 'For chains and franchises',
    features: ['20 Branches', '200 Tables', '100 Staff', '1000 Menu items', 'API access', 'White-label', '24/7 support'],
    cta: 'Contact sales',
    highlighted: false,
  },
];

const PricingCard = () => {
  const [cycle, setCycle] = useState('monthly');

  return (
    <section className="nv-section nv-section-soft" id="pricing">
      <div className="nv-container">

        <div className="nv-section-header">
          <div className="nv-eyebrow">Pricing</div>
          <h2 className="nv-section-title">
            Simple plans, <span className="nv-gradient-text">no surprises</span>
          </h2>
          <p className="nv-section-subtitle">
            Choose monthly or save 20% with yearly. Cancel anytime.
          </p>

          {/* TOGGLE */}
          <div className="nv-pricing-toggle">
            <button
              className={cycle === 'monthly' ? 'nv-toggle-active' : ''}
              onClick={() => setCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={cycle === 'yearly' ? 'nv-toggle-active' : ''}
              onClick={() => setCycle('yearly')}
            >
              Yearly <span className="nv-save-badge">-20%</span>
            </button>
          </div>
        </div>

        <div className="nv-pricing-grid">
          {plans.map((plan, i) => {
            const price = cycle === 'yearly' ? plan.yearly : plan.monthly;
            return (
              <div
                key={i}
                className={`nv-price-card nv-glass ${plan.highlighted ? 'nv-price-highlighted' : ''}`}
              >
                {plan.badge && <div className="nv-price-badge">{plan.badge}</div>}

                <div className="nv-price-name">{plan.name}</div>
                <div className="nv-price-desc">{plan.description}</div>

                <div className="nv-price-amount">
                  <span className="nv-price-currency">NPR</span>
                  <span className="nv-price-num">{price.toLocaleString()}</span>
                  <span className="nv-price-period">/{cycle === 'yearly' ? 'yr' : 'mo'}</span>
                </div>

                <ul className="nv-price-features">
                  {plan.features.map((f, idx) => (
                    <li key={idx}><Check size={16} /> {f}</li>
                  ))}
                </ul>

                <Link
                  to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  className={plan.highlighted ? 'nv-btn-gold' : 'nv-btn-ghost'}
                  style={{ width: '100%' }}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default PricingCard;
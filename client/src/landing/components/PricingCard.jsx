import { Link } from 'react-router-dom';
import { Check, Zap, Star, Crown } from 'lucide-react';
import './PricingCard.css';

const plans = [
  {
    name: 'Free',
    icon: <Zap size={24} />,
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      '1 Branch',
      '5 Tables',
      '3 Staff Accounts',
      '20 Menu Items',
      '7 Days Analytics',
      'Basic Support',
      'Email Support'
    ],
    notIncluded: [
      'PDF Receipts',
      'QR Ordering',
      'Custom Branding',
      'Multi-Branch',
      'Priority Support'
    ],
    cta: 'Get Started Free',
    highlighted: false,
    color: '#3b82f6'
  },
  {
    name: 'Starter',
    icon: <Star size={24} />,
    price: 2900,
    monthlyPrice: 29,
    period: 'month',
    description: 'Great for small cafes',
    features: [
      '1 Branch',
      'Unlimited Tables',
      '10 Staff Accounts',
      'Unlimited Menu Items',
      '30 Days Analytics',
      'PDF Receipts',
      'Priority Email Support',
      'eSewa & Khalti',
      'Live Chat Support'
    ],
    notIncluded: [
      'QR Ordering',
      'Custom Branding',
      'Multi-Branch',
      'API Access'
    ],
    cta: 'Start 14-Day Trial',
    highlighted: false,
    color: '#10b981'
  },
  {
    name: 'Business',
    icon: <Crown size={24} />,
    price: 7900,
    monthlyPrice: 79,
    period: 'month',
    description: 'Most popular choice',
    features: [
      '5 Branches',
      'Unlimited Tables',
      '50 Staff Accounts',
      'Unlimited Menu Items',
      '1 Year Analytics',
      'PDF Receipts',
      'QR Ordering for Customers',
      'Custom Branding',
      'Staff Performance Metrics',
      'Inventory Management',
      'Priority Support',
      'Phone Support',
      'All Payment Methods'
    ],
    notIncluded: [
      'API Access',
      'White Label'
    ],
    cta: 'Start 14-Day Trial',
    highlighted: true,
    color: '#d4af37',
    badge: 'Most Popular'
  },
  {
    name: 'Enterprise',
    icon: <Crown size={24} />,
    price: 19900,
    monthlyPrice: 199,
    period: 'month',
    description: 'For large operations',
    features: [
      'Unlimited Branches',
      'Unlimited Everything',
      'Dedicated Account Manager',
      'API Access',
      'Custom Integrations',
      'White Label Option',
      'Multi-Currency Support',
      'Advanced Analytics',
      'Custom Reports',
      'Accounting Software Integration',
      '24/7 Priority Support',
      'On-site Training',
      'Custom Features on Request'
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    highlighted: false,
    color: '#8b5cf6'
  }
];

const PricingSection = () => {
  return (
    <section className="pricing-section">
      <div className="pricing-container">
        <div className="section-header">
          <h2 className="section-title">Simple, Transparent Pricing</h2>
          <p className="section-subtitle">
            Choose the perfect plan for your business. All plans include 14-day free trial.
          </p>
        </div>

        <div className="pricing-grid">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`pricing-card ${plan.highlighted ? 'highlighted' : ''}`}
              style={{ '--plan-color': plan.color }}
            >
              {plan.badge && (
                <div className="pricing-badge">{plan.badge}</div>
              )}

              <div className="pricing-header">
                <div className="plan-icon" style={{ color: plan.color }}>
                  {plan.icon}
                </div>
                <h3 className="plan-name">{plan.name}</h3>
                <p className="plan-description">{plan.description}</p>
              </div>

              <div className="pricing-price">
                <div className="price-wrapper">
                  <span className="currency">Rs</span>
                  <span className="price">{plan.price.toLocaleString()}</span>
                  <span className="period">/{plan.period}</span>
                </div>
                {plan.monthlyPrice && (
                  <p className="price-usd">≈ ${plan.monthlyPrice} USD</p>
                )}
              </div>

              <ul className="features-list">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item included">
                    <Check size={18} />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature, idx) => (
                  <li key={idx} className="feature-item not-included">
                    <span className="cross">×</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link 
                to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                className={`pricing-cta ${plan.highlighted ? 'cta-highlighted' : ''}`}
                style={plan.highlighted ? { background: plan.color } : {}}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <div className="pricing-footer">
          <p>All plans are billed in NPR. Prices shown are monthly rates.</p>
          <p>Save 20% with annual billing. <Link to="/contact">Contact us</Link> for custom pricing.</p>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
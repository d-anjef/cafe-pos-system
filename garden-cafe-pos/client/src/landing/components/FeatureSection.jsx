import { Building2, CreditCard, WifiOff, ChefHat, Smartphone } from 'lucide-react';

const features = [
  {
    icon: <Building2 size={26} />,
    title: 'Multi-branch ready',
    description: 'Manage multiple locations from one unified dashboard. Compare performance, share menus, scale fast.',
  },
  {
    icon: <CreditCard size={26} />,
    title: 'Nepali payments',
    description: 'Accept eSewa, Khalti, FonePay, cash, and cards. Built for the Nepali market from day one.',
  },
  {
    icon: <WifiOff size={26} />,
    title: 'Works offline',
    description: 'Internet down? No problem. Orders save locally and auto-sync the moment you reconnect.',
  },
  {
    icon: <ChefHat size={26} />,
    title: 'Real-time kitchen',
    description: 'Live order tickets to your kitchen display. Track timers, statuses, and never miss an order.',
  },
  {
    icon: <Smartphone size={26} />,
    title: 'Waiter mobile app',
    description: 'Take orders tableside on any phone or tablet. Fast, intuitive, and works everywhere.',
  },
];

const FeatureSection = () => {
  return (
    <section className="nv-section" id="features">
      <div className="nv-container">

        <div className="nv-section-header">
          <div className="nv-eyebrow">Features</div>
          <h2 className="nv-section-title">
            Everything you need to <span className="nv-gradient-text">run smarter</span>
          </h2>
          <p className="nv-section-subtitle">
            Built for cafés in Nepal. Loved by owners who want clarity, control, and growth.
          </p>
        </div>

        <div className="nv-features-grid">
          {features.map((f, i) => (
            <div key={i} className="nv-feature-card nv-glass">
              <div className="nv-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.description}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeatureSection;
import { 
  Smartphone, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Wifi, 
  Lock,
  BarChart3,
  MessageSquare,
  Clock,
  Zap,
  Globe,
  HeadphonesIcon
} from 'lucide-react';
import './FeatureSection.css';

const features = [
  {
    icon: <Smartphone size={32} />,
    title: 'Mobile & Tablet Ready',
    description: 'Works perfectly on any device. Take orders from anywhere in your restaurant.',
    color: '#3b82f6'
  },
  {
    icon: <TrendingUp size={32} />,
    title: 'Real-Time Analytics',
    description: 'Track sales, monitor performance, and make data-driven decisions instantly.',
    color: '#10b981'
  },
  {
    icon: <Users size={32} />,
    title: 'Staff Management',
    description: 'Monitor employee performance, manage shifts, and calculate commissions easily.',
    color: '#f59e0b'
  },
  {
    icon: <CreditCard size={32} />,
    title: 'Multiple Payments',
    description: 'Accept Cash, eSewa, Khalti, QR codes, and tap-to-pay in one system.',
    color: '#8b5cf6'
  },
  {
    icon: <Wifi size={32} />,
    title: 'Works Offline',
    description: 'Continue operations even without internet. Auto-sync when connected.',
    color: '#ef4444'
  },
  {
    icon: <Lock size={32} />,
    title: 'Secure & Compliant',
    description: 'Bank-level encryption, secure payments, and automatic VAT calculation.',
    color: '#06b6d4'
  },
  {
    icon: <BarChart3 size={32} />,
    title: 'Multi-Branch Support',
    description: 'Manage multiple locations from one dashboard. Compare performance across branches.',
    color: '#d4af37'
  },
  {
    icon: <MessageSquare size={32} />,
    title: 'Customer QR Ordering',
    description: 'Let customers scan QR codes to view menu and place orders directly.',
    color: '#ec4899'
  },
  {
    icon: <Clock size={32} />,
    title: 'Kitchen Display System',
    description: 'Real-time order tickets for kitchen with status tracking and timers.',
    color: '#14b8a6'
  },
  {
    icon: <Zap size={32} />,
    title: 'Lightning Fast',
    description: 'Optimized for speed. Process orders and payments in seconds.',
    color: '#f97316'
  },
  {
    icon: <Globe size={32} />,
    title: 'Multi-Language',
    description: 'Support for English and Nepali with more languages coming soon.',
    color: '#6366f1'
  },
  {
    icon: <HeadphonesIcon size={32} />,
    title: '24/7 Support',
    description: 'Get help whenever you need it. Priority support for business plans.',
    color: '#a855f7'
  }
];

const FeatureSection = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Run Your Cafe</h2>
          <p className="section-subtitle">
            Powerful features designed specifically for cafes and restaurants in Nepal
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card"
              style={{ '--accent-color': feature.color }}
            >
              <div className="feature-icon" style={{ color: feature.color }}>
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;
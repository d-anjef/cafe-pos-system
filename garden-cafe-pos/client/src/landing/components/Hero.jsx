import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Hero = () => {
  return (
    <section className="nv-hero">
      <div className="nv-hero-mesh" />

      <div className="nv-container nv-hero-inner">

        {/* BADGE */}
        <div className="nv-hero-badge">
          <Sparkles size={14} />
          <span>From idea to impact</span>
        </div>

        {/* HEADLINE */}
        <h1 className="nv-hero-title">
          Modern POS for cafes.
          <br />
          <span className="nv-gradient-text">Built for Nepal.</span>
        </h1>

        <p className="nv-hero-subtitle">
          NUVLYX powers your café with real-time orders, multi-branch management, and Nepali payments — all in one platform.
        </p>

        {/* CTA */}
        <div className="nv-hero-cta">
          <Link to="/signup" className="nv-btn-gold nv-hero-btn">
            Start free trial <ArrowRight size={16} />
          </Link>
          <Link to="/pricing" className="nv-btn-ghost nv-hero-btn">
            View pricing
          </Link>
        </div>

        <div className="nv-hero-trust">
          <span>✓ No credit card required</span>
          <span>✓ 14-day free trial</span>
          <span>✓ Cancel anytime</span>
        </div>

        {/* DASHBOARD PREVIEW MOCKUP */}
        <div className="nv-hero-preview">
          <div className="nv-preview-window">
            <div className="nv-preview-bar">
              <span className="nv-preview-dot" style={{background:'#ef4444'}} />
              <span className="nv-preview-dot" style={{background:'#f59e0b'}} />
              <span className="nv-preview-dot" style={{background:'#10b981'}} />
              <span className="nv-preview-url">app.nuvlyx.com/dashboard</span>
            </div>

            <div className="nv-preview-body">
              <div className="nv-preview-sidebar">
                <div className="nv-preview-logo">
                  <div className="nv-brand-icon" style={{width:28, height:28, fontSize:14}}>N</div>
                  <strong>NUVLYX</strong>
                </div>
                <div className="nv-preview-nav-item nv-active">📊 Dashboard</div>
                <div className="nv-preview-nav-item">🍽 Menu</div>
                <div className="nv-preview-nav-item">🪑 Tables</div>
                <div className="nv-preview-nav-item">📦 Orders</div>
                <div className="nv-preview-nav-item">💳 Billing</div>
              </div>

              <div className="nv-preview-main">
                <div className="nv-preview-kpis">
                  <div className="nv-preview-kpi">
                    <small>Today's Revenue</small>
                    <strong>NPR 45,230</strong>
                    <span style={{color:'#10b981', fontSize:11}}>↑ +12.5%</span>
                  </div>
                  <div className="nv-preview-kpi">
                    <small>Active Orders</small>
                    <strong>23</strong>
                    <span style={{color:'var(--nv-gold)', fontSize:11}}>● Live</span>
                  </div>
                  <div className="nv-preview-kpi">
                    <small>Customers</small>
                    <strong>187</strong>
                    <span style={{color:'#10b981', fontSize:11}}>↑ +8.2%</span>
                  </div>
                </div>

                <div className="nv-preview-chart">
                  <div className="nv-preview-chart-title">Last 7 days revenue</div>
                  <div className="nv-preview-bars">
                    {[60, 45, 75, 50, 80, 65, 90].map((h, i) => (
                      <div key={i} style={{
                        flex: 1,
                        height: `${h}%`,
                        background: 'var(--nv-gradient-gold)',
                        borderRadius: '4px 4px 0 0',
                        opacity: 0.85
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FLOATING CARDS */}
          <div className="nv-float-card nv-float-1">
            <div style={{fontSize:24}}>💳</div>
            <div>
              <div style={{fontSize:11, opacity:0.6}}>Payment via</div>
              <strong>eSewa</strong>
            </div>
          </div>
          <div className="nv-float-card nv-float-2">
            <div style={{fontSize:24}}>🏢</div>
            <div>
              <div style={{fontSize:11, opacity:0.6}}>Active branches</div>
              <strong>5 locations</strong>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import './signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    // Organization details
    organizationName: '',
    // Owner details
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.organizationName.trim()) {
      setError('Please enter your cafe/restaurant name');
      return false;
    }
    if (formData.organizationName.length < 3) {
      setError('Organization name must be at least 3 characters');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Please enter your email');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Please enter a password');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (data.success && data.token) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show success and redirect
        setStep(3);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }

    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <Link to="/" className="signup-logo">
            🌿 Garden & Cafe POS
          </Link>
          <p className="signup-subtitle">Create your account and start your 14-day free trial</p>
        </div>

        {/* Progress Steps */}
        <div className="signup-progress">
          <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 1 ? <CheckCircle2 size={20} /> : '1'}
            </div>
            <span className="step-label">Organization</span>
          </div>
          <div className={`progress-line ${step > 1 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-circle">
              {step > 2 ? <CheckCircle2 size={20} /> : '2'}
            </div>
            <span className="step-label">Your Details</span>
          </div>
          <div className={`progress-line ${step > 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>
            <div className="step-circle">3</div>
            <span className="step-label">Complete</span>
          </div>
        </div>

        <div className="signup-form-wrapper">
          {error && (
            <div className="signup-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {/* Step 1: Organization Info */}
          {step === 1 && (
            <form className="signup-form step-1" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
              <div className="form-section">
                <div className="section-icon">
                  <Building2 size={32} />
                </div>
                <h2 className="section-title">Tell us about your business</h2>
                <p className="section-description">
                  What's the name of your cafe or restaurant?
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">Organization Name</label>
                <div className="input-wrapper">
                  <Building2 size={20} className="input-icon" />
                  <input
                    type="text"
                    name="organizationName"
                    className="input-field"
                    placeholder="e.g., Garden & Cafe"
                    value={formData.organizationName}
                    onChange={handleChange}
                    autoFocus
                    required
                  />
                </div>
                <p className="input-hint">This will be the name of your organization in the system</p>
              </div>

              <button type="submit" className="btn-primary btn-next">
                Continue
                <ArrowRight size={20} />
              </button>

              <div className="form-footer">
                Already have an account? <Link to="/login">Login here</Link>
              </div>
            </form>
          )}

          {/* Step 2: Owner Details */}
          {step === 2 && (
            <form className="signup-form step-2" onSubmit={handleSubmit}>
              <div className="form-section">
                <div className="section-icon">
                  <User size={32} />
                </div>
                <h2 className="section-title">Create your owner account</h2>
                <p className="section-description">
                  You'll use these credentials to manage <strong>{formData.organizationName}</strong>
                </p>
              </div>

              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div className="input-wrapper">
                  <User size={20} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={handleChange}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={20} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="input-field"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    name="password"
                    className="input-field"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock size={20} className="input-icon" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="input-field"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="signup-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>

              <div className="terms-notice">
                By signing up, you agree to our{' '}
                <Link to="/terms">Terms of Service</Link> and{' '}
                <Link to="/privacy">Privacy Policy</Link>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="signup-success">
              <div className="success-icon">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="success-title">Welcome to Garden & Cafe POS! 🎉</h2>
              <p className="success-message">
                Your account for <strong>{formData.organizationName}</strong> has been created successfully.
              </p>
              <div className="success-features">
                <div className="success-feature">
                  <CheckCircle2 size={20} />
                  <span>14-day free trial activated</span>
                </div>
                <div className="success-feature">
                  <CheckCircle2 size={20} />
                  <span>All business features unlocked</span>
                </div>
                <div className="success-feature">
                  <CheckCircle2 size={20} />
                  <span>Email verification sent</span>
                </div>
              </div>
              <p className="redirect-message">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>

        {step < 3 && (
          <div className="signup-benefits">
            <h3>What you'll get:</h3>
            <ul>
              <li><CheckCircle2 size={16} /> 14-day free trial, no credit card required</li>
              <li><CheckCircle2 size={16} /> Full access to all business features</li>
              <li><CheckCircle2 size={16} /> Real-time order and inventory management</li>
              <li><CheckCircle2 size={16} /> Multiple payment methods (Cash, eSewa, Khalti)</li>
              <li><CheckCircle2 size={16} /> Priority customer support</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Signup;
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, User, Mail, Lock, ArrowRight,
  CheckCircle2, AlertCircle, ArrowLeft, Sparkles, Shield, Zap
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/nuvlyx-theme.css";
import "./login.css";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedStaff, setGeneratedStaff] = useState([]);

  const [formData, setFormData] = useState({
    organizationName: "",
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.organizationName.trim()) return setError("Enter your business name") || false;
    if (formData.organizationName.length < 3) return setError("Name must be at least 3 characters") || false;
    return true;
  };

  const validateStep2 = () => {
    if (!formData.name.trim()) return setError("Enter your name") || false;
    if (!/\S+@\S+\.\S+/.test(formData.email)) return setError("Enter a valid email") || false;
    if (formData.password.length < 6) return setError("Password must be at least 6 characters") || false;
    if (formData.password !== formData.confirmPassword) return setError("Passwords don't match") || false;
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      if (data.success && data.token) { 
        localStorage.setItem("token", data.token); 
        localStorage.setItem("user", JSON.stringify(data.user));
        if (data.generatedStaff) setGeneratedStaff(data.generatedStaff);  // ✅ NEW
        setStep(3);
        setTimeout(() => navigate("/dashboard"), 8000);  // ✅ 8 sec so they can read
        }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-root nv-auth-page">
      <div className="nv-auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="nv-auth-wrapper">

        {/* LEFT BRAND */}
        <div className="nv-auth-brand">
          <Link to="/" className="nv-brand-logo">
            <div className="nv-brand-icon">N</div>
            <span>NUVLYX</span>
          </Link>

          <div className="nv-brand-content">
            <h1>Start your <span className="nv-gradient-text">14-day</span> free trial</h1>
            <p className="nv-brand-tagline">No credit card required</p>

            <div className="nv-brand-features">
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Sparkles size={18} /></div>
                <div>
                  <strong>Full access</strong>
                  <span>All business features unlocked</span>
                </div>
              </div>
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Zap size={18} /></div>
                <div>
                  <strong>5 min setup</strong>
                  <span>Be live in minutes</span>
                </div>
              </div>
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Shield size={18} /></div>
                <div>
                  <strong>Cancel anytime</strong>
                  <span>No contracts, no surprises</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nv-brand-footer">
            © {new Date().getFullYear()} NUVLYX
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="nv-auth-form-wrap">
          <div className="nv-signup-form-area">

            {/* PROGRESS */}
            {step < 3 && (
              <div className="nv-signup-progress">
                {[1, 2].map(n => (
                  <div
                    key={n}
                    className={`nv-progress-pill ${step >= n ? "nv-active" : ""}`}
                  />
                ))}
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div className="nv-auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1 */}
            {step === 1 && (
              <form className="nv-auth-form" onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
                <div className="nv-auth-header">
                  <h2>What's your business name?</h2>
                  <p>This will be your organization in NUVLYX</p>
                </div>

                <div className="nv-input-group">
                  <label>Business name</label>
                  <div className="nv-input-wrap">
                    <Building2 size={18} className="nv-input-icon" />
                    <input
                      type="text"
                      name="organizationName"
                      placeholder="e.g. Garden & Cafe"
                      value={formData.organizationName}
                      onChange={handleChange}
                      autoFocus
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="nv-btn-gold nv-auth-submit">
                  Continue <ArrowRight size={16} />
                </button>

                <div className="nv-auth-divider"><span>or</span></div>

                <div className="nv-auth-footer">
                  Already have an account?{" "}
                  <Link to="/login" className="nv-link">Sign in</Link>
                </div>

                <Link to="/" className="nv-back-home">← Back to home</Link>
              </form>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <form className="nv-auth-form" onSubmit={handleSubmit}>
                <div className="nv-auth-header">
                  <h2>Create your account</h2>
                  <p>You'll manage <strong style={{color: 'var(--nv-gold)'}}>{formData.organizationName}</strong></p>
                </div>

                <div className="nv-input-group">
                  <label>Full name</label>
                  <div className="nv-input-wrap">
                    <User size={18} className="nv-input-icon" />
                    <input
                      type="text" name="name"
                      placeholder="John Doe"
                      value={formData.name} onChange={handleChange}
                      autoFocus required
                    />
                  </div>
                </div>

                <div className="nv-input-group">
                  <label>Email</label>
                  <div className="nv-input-wrap">
                    <Mail size={18} className="nv-input-icon" />
                    <input
                      type="email" name="email"
                      placeholder="you@company.com"
                      value={formData.email} onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="nv-input-group">
                  <label>Password</label>
                  <div className="nv-input-wrap">
                    <Lock size={18} className="nv-input-icon" />
                    <input
                      type="password" name="password"
                      placeholder="Min 6 characters"
                      value={formData.password} onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="nv-input-group">
                  <label>Confirm password</label>
                  <div className="nv-input-wrap">
                    <Lock size={18} className="nv-input-icon" />
                    <input
                      type="password" name="confirmPassword"
                      placeholder="Re-enter password"
                      value={formData.confirmPassword} onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    className="nv-btn-ghost"
                    onClick={() => setStep(1)}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button
                    type="submit"
                    className="nv-btn-gold"
                    disabled={loading}
                    style={{ flex: 2 }}
                  >
                    {loading ? "Creating..." : <>Create account <ArrowRight size={16} /></>}
                  </button>
                </div>

                <div className="nv-terms">
                  By continuing, you agree to our{" "}
                  <Link to="/terms" className="nv-link">Terms</Link> and{" "}
                  <Link to="/privacy" className="nv-link">Privacy Policy</Link>
                </div>
              </form>
            )}

            {/* STEP 3 SUCCESS */}
            {step === 3 && (
  <div className="nv-signup-success">
    <div className="nv-success-icon">
      <CheckCircle2 size={48} />
    </div>
    <h2>Welcome to NUVLYX 🎉</h2>
    <p>Your account for <strong>{formData.organizationName}</strong> is ready</p>

    {generatedStaff && generatedStaff.length > 0 && (
      <div style={{
        background: 'var(--nv-glass)',
        border: '1px solid var(--nv-gold)',
        borderRadius: 12,
        padding: 20,
        margin: '24px 0',
        textAlign: 'left'
      }}>
        <strong style={{ color: 'var(--nv-gold)', display: 'block', marginBottom: 12 }}>
          🔐 Staff accounts auto-created
        </strong>
        <p style={{ fontSize: 13, color: 'var(--nv-text-soft)', marginBottom: 14 }}>
          Save these credentials. You can share with your staff or change passwords later.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {generatedStaff.map((s, i) => (
            <div key={i} style={{
              padding: '8px 12px',
              background: 'var(--nv-surface)',
              borderRadius: 8,
              fontSize: 12
            }}>
              <strong style={{ textTransform: 'capitalize' }}>{s.role.replace('_', ' ')}:</strong>{' '}
              <code style={{ color: 'var(--nv-gold)' }}>{s.email}</code>
              <span style={{ opacity: 0.6 }}> / {s.password}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="nv-success-list">
      <div><CheckCircle2 size={16} /> 14-day Business trial activated</div>
      <div><CheckCircle2 size={16} /> All staff accounts created</div>
      <div><CheckCircle2 size={16} /> Ready to manage your café</div>
    </div>

    <p className="nv-redirect">Redirecting to your dashboard...</p>
  </div>
)}
          </div>
        </div>
      </div>                      
    </div>  );
}       
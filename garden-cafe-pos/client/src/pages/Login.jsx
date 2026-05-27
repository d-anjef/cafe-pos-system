import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle, Loader, ArrowRight, Shield, Zap, Globe } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/nuvlyx-theme.css";
import "./login.css";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";

const getRedirectPath = (role) => {
  switch (role) {
    case "super_admin":    return "/super-admin";
    case "owner":          return "/admin";
    case "admin":          return "/admin";
    case "branch_manager": return "/admin";
    case "waiter":         return "/waiter";
    case "kitchen":        return "/kitchen";
    default:               return "/login";
  }
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (user) navigate(getRedirectPath(user.role), { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      navigate(getRedirectPath(loggedInUser.role), { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nv-root nv-auth-page">

      {/* THEME TOGGLE */}
      <div className="nv-auth-theme-toggle">
        <ThemeToggle />
      </div>

      <div className="nv-auth-wrapper">

        {/* LEFT — BRAND PANEL */}
        <div className="nv-auth-brand">
          <Link to="/" className="nv-brand-logo">
            <div className="nv-brand-icon">N</div>
            <span>NUVLYX</span>
          </Link>

          <div className="nv-brand-content">
            <h1>Welcome back to <span className="nv-gradient-text">NUVLYX</span></h1>
            <p className="nv-brand-tagline">From idea to impact</p>

            <div className="nv-brand-features">
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Zap size={18} /></div>
                <div>
                  <strong>Real-time</strong>
                  <span>Live kitchen & waiter sync</span>
                </div>
              </div>
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Globe size={18} /></div>
                <div>
                  <strong>Multi-branch</strong>
                  <span>Scale across locations</span>
                </div>
              </div>
              <div className="nv-brand-feature">
                <div className="nv-bf-icon"><Shield size={18} /></div>
                <div>
                  <strong>Secure</strong>
                  <span>Bank-grade encryption</span>
                </div>
              </div>
            </div>
          </div>

          <div className="nv-brand-footer">
            © {new Date().getFullYear()} NUVLYX. All rights reserved.
          </div>
        </div>

        {/* RIGHT — FORM PANEL */}
        <div className="nv-auth-form-wrap">
          <form className="nv-auth-form" onSubmit={handleSubmit}>

            <div className="nv-auth-header">
              <h2>Sign in</h2>
              <p>Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="nv-auth-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="nv-input-group">
              <label>Email address</label>
              <div className="nv-input-wrap">
                <Mail size={18} className="nv-input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div className="nv-input-group">
              <div className="nv-label-row">
                <label>Password</label>
                
              </div>
              <div className="nv-input-wrap">
                <Lock size={18} className="nv-input-icon" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button type="submit" disabled={loading} className="nv-btn-gold nv-auth-submit">
              {loading ? (
                <><Loader size={16} className="nv-spin" /> Signing in...</>
              ) : (
                <>Sign in <ArrowRight size={16} /></>
              )}
            </button>
            {/* Add this anywhere in your login form */}
<div style={{
  textAlign: "right",
  marginTop: -8,
  marginBottom: 4
}}>
  <Link
    to="/forgot-password"
    style={{
      fontSize: 13,
      color: "var(--nv-gold)",
      textDecoration: "none",
      fontWeight: 600
    }}
  >
    Forgot password?
  </Link>
</div>

            <div className="nv-auth-divider"><span>or</span></div>

            <div className="nv-auth-footer">
              Don't have an account?{" "}
              <Link to="/signup" className="nv-link">
                Start free trial
              </Link>
            </div>

            <Link to="/" className="nv-back-home">← Back to home</Link>
          </form>
        </div>

      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Lock, ArrowRight, CheckCircle2, AlertCircle, ShieldCheck, Eye, EyeOff
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/nuvlyx-theme.css";
import "./login.css";
import "./signup.css";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [verifying, setVerifying]    = useState(true);
  const [tokenValid, setTokenValid]  = useState(false);
  const [userName, setUserName]      = useState("");
  const [error, setError]            = useState("");
  const [loading, setLoading]        = useState(false);
  const [success, setSuccess]        = useState(false);

  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]       = useState(false);

  // ── Verify token on mount ────────────────────────────
  useEffect(() => {
    if (!token || !email) {
      setError("Invalid reset link. Please request a new one.");
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/verify-reset-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token, email })
          }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        setTokenValid(true);
        setUserName(data.name || "");
      } catch (err) {
        setError(err.message || "Reset link is invalid or expired");
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [token, email]);

  // ── Handle reset ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email, newPassword: password })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setSuccess(true);
      setTimeout(() => navigate("/login"), 4000);
    } catch (err) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // ── Verifying state ──────────────────────────────────
  if (verifying) {
    return (
      <div className="nv-root nv-auth-page" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ textAlign: "center", color: "var(--nv-text-soft)" }}>
          <div className="loader-ring" style={{ margin: "0 auto 16px" }} />
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

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
            <h1>
              {success
                ? <>You're all <span className="nv-gradient-text">set</span>!</>
                : <>Create new <span className="nv-gradient-text">password</span></>
              }
            </h1>
            <p className="nv-brand-tagline">
              {success
                ? "Login with your new password"
                : "Choose a strong password to secure your account"
              }
            </p>
          </div>

          <div className="nv-brand-footer">
            © {new Date().getFullYear()} NUVLYX
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="nv-auth-form-wrap">
          <div className="nv-signup-form-area">

            {/* SUCCESS STATE */}
            {success && (
              <div className="nv-signup-success">
                <div className="nv-success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Password reset! 🎉</h2>
                <p>Your password has been changed successfully</p>

                <div className="nv-success-list">
                  <div><CheckCircle2 size={16} /> Password updated</div>
                  <div><CheckCircle2 size={16} /> Confirmation email sent</div>
                  <div><CheckCircle2 size={16} /> Account secure</div>
                </div>

                <p className="nv-redirect">Redirecting to login...</p>

                <Link
                  to="/login"
                  className="nv-btn-gold"
                  style={{
                    marginTop: 16,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  Go to login now
                </Link>
              </div>
            )}

            {/* INVALID TOKEN STATE */}
            {!success && !tokenValid && (
              <div className="nv-signup-success">
                <div style={{
                  width: 64, height: 64,
                  margin: "0 auto 20px",
                  background: "rgba(229,57,53,0.15)",
                  border: "1px solid #e53935",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <AlertCircle size={28} color="#e53935" />
                </div>
                <h2>Invalid reset link</h2>
                <p>{error || "This link has expired or is invalid"}</p>

                <p style={{ fontSize: 13, color: "var(--nv-text-soft)", marginTop: 12 }}>
                  Reset links expire after 1 hour. Please request a new one.
                </p>

                <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                  <Link
                    to="/forgot-password"
                    className="nv-btn-gold"
                    style={{
                      flex: 1,
                      textDecoration: "none",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    Request new link
                  </Link>
                  <Link
                    to="/login"
                    className="nv-btn-ghost"
                    style={{
                      flex: 1,
                      textDecoration: "none",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            )}

            {/* RESET FORM */}
            {!success && tokenValid && (
              <>
                {error && (
                  <div className="nv-auth-error">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                <form className="nv-auth-form" onSubmit={handleSubmit}>
                  <div className="nv-auth-header">
                    <div style={{
                      width: 56,
                      height: 56,
                      margin: "0 auto 16px",
                      background: "rgba(212,175,55,0.15)",
                      border: "1px solid var(--nv-gold)",
                      borderRadius: 14,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      <ShieldCheck size={24} color="var(--nv-gold)" />
                    </div>
                    <h2>Set new password</h2>
                    {userName && (
                      <p>Hi <strong style={{ color: "var(--nv-gold)" }}>{userName}</strong>, create a new password below</p>
                    )}
                  </div>

                  <div className="nv-input-group">
                    <label>New password</label>
                    <div className="nv-input-wrap">
                      <Lock size={18} className="nv-input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Min 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        autoFocus
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 12,
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--nv-text-soft)",
                          padding: 4,
                          display: "flex",
                          alignItems: "center"
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="nv-input-group">
                    <label>Confirm new password</label>
                    <div className="nv-input-wrap">
                      <Lock size={18} className="nv-input-icon" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                        required
                      />
                    </div>
                  </div>

                  {/* PASSWORD STRENGTH HINT */}
                  {password && (
                    <div style={{
                      fontSize: 12,
                      color: "var(--nv-text-soft)",
                      padding: "8px 12px",
                      background: "var(--nv-glass)",
                      borderRadius: 8,
                      marginBottom: 12
                    }}>
                      {password.length < 6 && "❌ Too short (min 6 chars)"}
                      {password.length >= 6 && password.length < 10 && "⚠️ Good — consider longer"}
                      {password.length >= 10 && "✅ Strong password"}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="nv-btn-gold nv-auth-submit"
                    disabled={loading || !password || !confirmPassword}
                  >
                    {loading ? "Resetting..." : <>Reset Password <ArrowRight size={16} /></>}
                  </button>

                  <Link
                    to="/login"
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: 16,
                      fontSize: 13,
                      color: "var(--nv-text-soft)",
                      textDecoration: "none"
                    }}
                  >
                    Remember your password? Sign in
                  </Link>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
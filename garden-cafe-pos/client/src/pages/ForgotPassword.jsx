import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/nuvlyx-theme.css";
import "./login.css";
import "./signup.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
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
            <h1>Forgot your <span className="nv-gradient-text">password</span>?</h1>
            <p className="nv-brand-tagline">
              No worries — we'll help you reset it
            </p>

            <div style={{
              marginTop: 40,
              padding: 20,
              background: "var(--nv-glass)",
              border: "1px solid var(--nv-border)",
              borderRadius: 12,
              fontSize: 13,
              color: "var(--nv-text-soft)",
              lineHeight: 1.7
            }}>
              💡 We'll send a secure link to your email.<br/>
              The link expires in 1 hour for security.
            </div>
          </div>

          <div className="nv-brand-footer">
            © {new Date().getFullYear()} NUVLYX
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="nv-auth-form-wrap">
          <div className="nv-signup-form-area">

            {!sent ? (
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
                      <KeyRound size={24} color="var(--nv-gold)" />
                    </div>
                    <h2>Reset your password</h2>
                    <p>Enter your email and we'll send you a reset link</p>
                  </div>

                  <div className="nv-input-group">
                    <label>Email address</label>
                    <div className="nv-input-wrap">
                      <Mail size={18} className="nv-input-icon" />
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        autoFocus
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="nv-btn-gold nv-auth-submit"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : <>Send Reset Link <ArrowRight size={16} /></>}
                  </button>

                  <Link
                    to="/login"
                    className="nv-btn-ghost"
                    style={{
                      marginTop: 12,
                      width: "100%",
                      textDecoration: "none",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6
                    }}
                  >
                    <ArrowLeft size={16} /> Back to login
                  </Link>
                </form>
              </>
            ) : (
              // ─── SUCCESS STATE ───
              <div className="nv-signup-success">
                <div className="nv-success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Check your email</h2>
                <p>
                  If an account exists with <strong>{email}</strong>,
                  you'll receive a password reset link shortly.
                </p>

                <div style={{
                  background: "var(--nv-glass)",
                  border: "1px solid var(--nv-border)",
                  borderRadius: 12,
                  padding: 20,
                  margin: "24px 0",
                  textAlign: "left",
                  fontSize: 13,
                  color: "var(--nv-text-soft)",
                  lineHeight: 1.7
                }}>
                  <strong style={{ color: "var(--nv-gold)", display: "block", marginBottom: 8 }}>
                    What's next?
                  </strong>
                  ✓ Check your inbox (and spam folder)<br/>
                  ✓ Click the reset link in the email<br/>
                  ✓ Set a new password<br/>
                  ✓ Login with your new password<br/>
                </div>

                <p style={{ fontSize: 12, color: "var(--nv-text-soft)", margin: "8px 0 16px" }}>
                  Didn't receive it? Check spam, or wait 5 minutes before requesting again.
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => { setSent(false); setEmail(""); }}
                    className="nv-btn-ghost"
                    style={{ flex: 1 }}
                  >
                    Try another email
                  </button>
                  <Link
                    to="/login"
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
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, User, Mail, Lock, ArrowRight,
  CheckCircle2, AlertCircle, ArrowLeft, Sparkles, Shield, Zap,
  KeyRound, RefreshCw
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/nuvlyx-theme.css";
import "./login.css";
import "./signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep]                   = useState(1);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState("");
  const [generatedStaff, setGeneratedStaff] = useState([]);
  const [acceptTerms, setAcceptTerms] = useState(false);

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

  // ── Step 1 validation ─────────────────────────────────
  const validateStep1 = () => {
    if (!formData.organizationName.trim()) return setError("Enter your business name") || false;
    if (formData.organizationName.length < 3) return setError("Name must be at least 3 characters") || false;
    return true;
  };

  // ── Step 2 validation ─────────────────────────────────
 const validateStep2 = () => {
  if (!formData.name.trim()) return setError("Enter your name") || false;
  if (!/\S+@\S+\.\S+/.test(formData.email)) return setError("Enter a valid email") || false;
  if (formData.password.length < 6) return setError("Password must be at least 6 characters") || false;
  if (formData.password !== formData.confirmPassword) return setError("Passwords don't match") || false;
  if (!acceptTerms) return setError("Please accept the Terms of Service to continue") || false;  // ✅ NEW
  return true;
};

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
  };

  // ============================================================
  // STEP 2 → 3: Request verification code
  // ============================================================
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/send-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send code");

      // Move to verification step
      setStep(3);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 3 → 4: Verify code AND create account
  // ============================================================
  const handleVerifyAndRegister = async (code) => {
    setLoading(true);
    setError("");

    try {
      // ── 1. Verify the code ────────────────────────────
      const verifyRes = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-code`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            code
          })
        }
      );

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.message || "Invalid code");
      }

      // ── 2. Code verified → Now create the account ──────
      const registerRes = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            organizationName: formData.organizationName,
            name: formData.name,
            email: formData.email,
            password: formData.password
          })
        }
      );

      const registerData = await registerRes.json();
      if (!registerRes.ok) {
        throw new Error(registerData.message || "Registration failed");
      }

      // ── 3. Success — save token and show success screen ──
      if (registerData.success && registerData.token) {
        localStorage.setItem("token", registerData.token);
        localStorage.setItem("user", JSON.stringify(registerData.user));
        if (registerData.generatedStaff) {
          setGeneratedStaff(registerData.generatedStaff);
        }
        setStep(4);
        setTimeout(() => navigate("/dashboard"), 8000);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
      throw err;  // Re-throw so VerificationStep knows it failed
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // STEP 3: Resend code
  // ============================================================
  const handleResendCode = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/send-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            name: formData.name
          })
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to resend");

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
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

            {/* PROGRESS (now 3 dots for steps 1, 2, 3) */}
            {step < 4 && (
              <div className="nv-signup-progress">
                {[1, 2, 3].map(n => (
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

            {/* ─── STEP 1: BUSINESS NAME ─── */}
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

            {/* ─── STEP 2: ACCOUNT DETAILS ─── */}
            {step === 2 && (
              <form className="nv-auth-form" onSubmit={handleRequestCode}>
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
                    {loading ? "Sending code..." : <>Send verification code <ArrowRight size={16} /></>}
                  </button>
                </div>

                {/* TERMS CHECKBOX — ✅ NEW */}
<div style={{
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  marginTop: 16,
  padding: 12,
  background: 'rgba(212, 175, 55, 0.05)',
  border: `1px solid ${acceptTerms ? 'var(--nv-gold)' : 'var(--nv-border)'}`,
  borderRadius: 10,
  transition: 'border 0.2s'
}}>
  <input
    type="checkbox"
    id="acceptTerms"
    checked={acceptTerms}
    onChange={(e) => setAcceptTerms(e.target.checked)}
    style={{
      marginTop: 3,
      width: 18,
      height: 18,
      cursor: 'pointer',
      accentColor: 'var(--nv-gold)',
      flexShrink: 0
    }}
  />
  <label
    htmlFor="acceptTerms"
    style={{
      fontSize: 13,
      lineHeight: 1.5,
      cursor: 'pointer',
      color: 'var(--nv-text-soft)'
    }}
  >
    I agree to the{' '}
    <Link to="/terms" target="_blank" className="nv-link" style={{ fontWeight: 600 }}>
      Terms of Service
    </Link>
    ,{' '}
    <Link to="/privacy" target="_blank" className="nv-link" style={{ fontWeight: 600 }}>
      Privacy Policy
    </Link>
    , and{' '}
    <Link to="/refund-policy" target="_blank" className="nv-link" style={{ fontWeight: 600 }}>
      Refund Policy
    </Link>
  </label>
</div>
              </form>
            )}

            {/* ─── STEP 3: EMAIL VERIFICATION ─── */}
            {step === 3 && (
              <VerificationStep
                email={formData.email}
                onVerify={handleVerifyAndRegister}
                onResend={handleResendCode}
                onBack={() => setStep(2)}
                loading={loading}
                error={error}
              />
            )}

            {/* ─── STEP 4: SUCCESS ─── */}
            {step === 4 && (
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
                  <div><CheckCircle2 size={16} /> Email verified</div>
                  <div><CheckCircle2 size={16} /> 14-day Business trial activated</div>
                  <div><CheckCircle2 size={16} /> All staff accounts created</div>
                  <div><CheckCircle2 size={16} /> Welcome email sent to inbox</div>
                </div>

                <p className="nv-redirect">Redirecting to your dashboard in 8 seconds...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// VERIFICATION STEP COMPONENT
// 6-digit code input with auto-advance + resend countdown
// ============================================================
function VerificationStep({ email, onVerify, onResend, onBack, loading, error }) {
  const [code, setCode]               = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setCooldown] = useState(60);
  const [resending, setResending]     = useState(false);
  const inputsRef                     = useRef([]);

  // ── Auto-focus first input ───────────────────────────
  useEffect(() => {
    if (inputsRef.current[0]) inputsRef.current[0].focus();
  }, []);

  // ── Resend cooldown countdown ────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Handle digit input ───────────────────────────────
  const handleChange = (idx, value) => {
    // Only allow single digit
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[idx] = value;
    setCode(newCode);

    // Auto-advance to next input
    if (value && idx < 5) {
      inputsRef.current[idx + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (idx === 5 && value) {
      const fullCode = [...newCode.slice(0, 5), value].join("");
      if (fullCode.length === 6) {
        handleSubmit(fullCode);
      }
    }
  };

  // ── Handle backspace to go back ──────────────────────
  const handleKeyDown = (idx, e) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
  };

  // ── Handle paste (paste full code) ───────────────────
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 0) return;

    const newCode = [...code];
    for (let i = 0; i < pasted.length && i < 6; i++) {
      newCode[i] = pasted[i];
    }
    setCode(newCode);

    // Focus last filled or first empty
    const nextEmptyIdx = newCode.findIndex(c => !c);
    const focusIdx = nextEmptyIdx === -1 ? 5 : nextEmptyIdx;
    inputsRef.current[focusIdx]?.focus();

    // Auto-submit if 6 digits pasted
    if (pasted.length === 6) {
      handleSubmit(pasted);
    }
  };

  // ── Submit code ──────────────────────────────────────
  const handleSubmit = async (fullCode) => {
    try {
      await onVerify(fullCode);
    } catch (err) {
      // Clear inputs on failure for retry
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length === 6) handleSubmit(fullCode);
  };

  // ── Handle resend ────────────────────────────────────
  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);

    try {
      await onResend();
      setCooldown(60);
      // Clear inputs
      setCode(["", "", "", "", "", ""]);
      inputsRef.current[0]?.focus();
    } catch {
      // Error handled in parent
    } finally {
      setResending(false);
    }
  };

  const allFilled = code.every(c => c !== "");

  return (
    <form className="nv-auth-form" onSubmit={handleManualSubmit}>
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
        <h2>Check your email</h2>
        <p>
          We sent a 6-digit code to<br/>
          <strong style={{ color: "var(--nv-gold)" }}>{email}</strong>
        </p>
      </div>

      {/* 6-DIGIT INPUT */}
      <div style={{
        display: "flex",
        gap: 8,
        justifyContent: "center",
        margin: "24px 0",
        flexWrap: "wrap"
      }}>
        {code.map((digit, idx) => (
          <input
            key={idx}
            ref={el => inputsRef.current[idx] = el}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={idx === 0 ? handlePaste : undefined}
            disabled={loading}
            style={{
              width: 48,
              height: 56,
              fontSize: 24,
              fontWeight: 700,
              textAlign: "center",
              borderRadius: 10,
              border: digit
                ? "2px solid var(--nv-gold)"
                : "1px solid var(--nv-border)",
              background: "var(--nv-surface)",
              color: "var(--nv-text)",
              outline: "none",
              transition: "all 0.15s"
            }}
          />
        ))}
      </div>

      <button
        type="submit"
        className="nv-btn-gold nv-auth-submit"
        disabled={!allFilled || loading}
        style={{
          opacity: (!allFilled || loading) ? 0.5 : 1,
          cursor: (!allFilled || loading) ? "not-allowed" : "pointer"
        }}
      >
        {loading ? "Verifying..." : <>Verify & Create Account <ArrowRight size={16} /></>}
      </button>

      {/* RESEND */}
      <div style={{
        textAlign: "center",
        marginTop: 20,
        fontSize: 13,
        color: "var(--nv-text-soft)"
      }}>
        Didn't receive the code?{" "}
        {resendCooldown > 0 ? (
          <span style={{ opacity: 0.5 }}>
            Resend in {resendCooldown}s
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="nv-link"
            style={{
              background: "none",
              border: "none",
              cursor: resending ? "wait" : "pointer",
              padding: 0,
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 4
            }}
          >
            <RefreshCw size={12} />
            {resending ? "Sending..." : "Resend code"}
          </button>
        )}
      </div>

      <button
        type="button"
        className="nv-btn-ghost"
        onClick={onBack}
        disabled={loading}
        style={{ marginTop: 16, width: "100%" }}
      >
        <ArrowLeft size={16} /> Use a different email
      </button>

      {/* INFO BOX */}
      <div style={{
        marginTop: 16,
        padding: 12,
        background: "var(--nv-glass)",
        borderRadius: 10,
        fontSize: 11,
        color: "var(--nv-text-soft)",
        textAlign: "center"
      }}>
        💡 Tip: Check your spam folder if you don't see it
      </div>
    </form>
  );
}
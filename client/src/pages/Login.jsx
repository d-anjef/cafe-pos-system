import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, AlertCircle } from "lucide-react";
import "./login.css";

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ---------------- AUTO REDIRECT ---------------- */
  useEffect(() => {
    if (user) {
      const route = user.role === "owner" ? "/admin"
                  : user.role === "admin" ? "/admin"
                  : user.role === "waiter" ? "/waiter"
                  : "/kitchen";
      navigate(route);
    }
  }, [user, navigate]);

  /* ---------------- LOGIN HANDLER ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Navigation happens automatically via useEffect
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card glass-card" onSubmit={handleSubmit}>
        <div className="login-logo">🌿</div>
        <h2 className="login-title">GARDEN & CAFE</h2>
        <p className="login-subtitle">Staff Portal</p>

        {error && (
          <div className="login-error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="login-field">
          <label>
            <Mail size={18} />
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your.email@example.com"
            required
            autoFocus
          />
        </div>

        <div className="login-field">
          <label>
            <Lock size={18} />
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="login-btn">
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="login-footer">
          <p>Don't have an account?</p>
          <Link to="/signup" className="signup-link">
            Start Free Trial →
          </Link>
        </div>

        <div className="login-back">
          <Link to="/">← Back to Home</Link>
        </div>
      </form>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Footer from "../components/Footer";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const fromDestination = location.state?.from?.pathname || "/dashboard";
  const redirectMessage = location.state?.message || "";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!formData.email || !formData.password) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Login successful! Redirecting...");

      setTimeout(() => {
        navigate(fromDestination, { replace: true });
      }, 800);
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-layout-wrapper">
      <div className="login-main-content">
        <div className="login-card">
          {/* Logo Header */}
          <Link to="/" className="login-logo-link">
            <div className="login-logo-badge">AI</div>
            <div className="login-logo-text">
              <span className="brand-title">CareerMatch</span>
              <span className="brand-subtitle">AI Resume Platform</span>
            </div>
          </Link>

          <div className="login-heading">
            <h1>Welcome Back</h1>
            <p>Sign in to continue your career journey and interview practice.</p>
          </div>

          {redirectMessage && (
            <div className="auth-alert alert-info" style={{ marginBottom: "16px", background: "#f0f7f2", border: "1px solid #cbe3cf", color: "#1f5735" }}>
              🔒 {redirectMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-field">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {message && (
              <div
                className={`auth-alert ${
                  message.includes("successful") ? "alert-success" : "alert-error"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              className="btn-auth-submit"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In →"}
            </button>
          </form>

          <div className="form-switch-row">
            <span>Don't have an account?</span>
            <Link to="/signup" className="switch-link">
              Create an account
            </Link>
          </div>
        </div>
      </div>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default Login;
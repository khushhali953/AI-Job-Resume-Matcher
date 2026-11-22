import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setMessage("Please fill all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Signup failed");
        return;
      }

      // Save token and user info for Dashboard
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      localStorage.setItem("user", JSON.stringify(data.user));
      setMessage("Account created successfully! Redirecting...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-layout-wrapper">
      <div className="signup-main-content">
        <div className="signup-container-card">
          {/* Left Hero / Brand Perks Column */}
          <div className="signup-brand-panel">
            <Link to="/" className="signup-brand-logo">
              <div className="signup-logo-badge">AI</div>
              <div className="signup-logo-text">
                <span className="brand-name">CareerMatch</span>
                <span className="brand-sub">AI Resume Platform</span>
              </div>
            </Link>

            <div className="brand-quote">
              <h2>Join the AI-powered career platform.</h2>
              <p>
                Accelerate your job search with intelligent resume scoring, personalized skill gap roadmaps, and realistic technical interview preparation.
              </p>
            </div>

            <div className="brand-perks-list">
              <div className="perk-item">
                <span className="perk-icon">⚡</span>
                <div>
                  <strong>ATS Resume Scoring</strong>
                  <p>Direct PyMuPDF parsing with Cloudinary cloud storage.</p>
                </div>
              </div>

              <div className="perk-item">
                <span className="perk-icon">🎯</span>
                <div>
                  <strong>AI Interview Preparation</strong>
                  <p>Practice OOP, system design, and behavioral questions with instant AI scoring.</p>
                </div>
              </div>

              <div className="perk-item">
                <span className="perk-icon">📊</span>
                <div>
                  <strong>Skill Gap Analysis</strong>
                  <p>Compare against industry job standards for MERN, Java, and Python roles.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="signup-form-panel">
            <div className="form-header">
              <h1>Create Your Account</h1>
              <p>Start your personalized career preparation in less than 2 minutes.</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="e.g. Khushhali Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

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
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {message && (
                <div
                  className={`auth-alert ${
                    message.includes("success") ? "alert-success" : "alert-error"
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
                {loading ? "Creating Account..." : "Create Account →"}
              </button>
            </form>

            <div className="form-switch-row">
              <span>Already have an account?</span>
              <Link to="/login" className="switch-link">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default Signup;
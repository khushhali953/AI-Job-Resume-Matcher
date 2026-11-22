import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useResume } from "../context/ResumeContext";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { clearResumeState } = useResume();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    clearResumeState();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navLinks = [
    { to: "/dashboard", label: "Dashboard", icon: "⌂" },
    { to: "/resume-analyzer", label: "Resume Analyzer", icon: "📄" },
    { to: "/job-matcher", label: "Job Matcher", icon: "💼" },
    // { to: "/skill-gap", label: "Skill Gap", icon: "📊" },
    // { to: "/rsume-improver", label: "Resume Improver", icon: "✨" },
    { to: "/interview-prep", label: "Interview Prep", icon: "🎯" },
  ];

  return (
    <header className="site-navbar">
      {/* Brand Logo with Green & White Theme */}
      <Link to="/dashboard" className="nav-logo">
        <div className="logo-badge">AI</div>
        <div className="logo-text-group">
          <span className="logo-title">CareerMatch</span>
          <span className="logo-subtitle">AI Resume Platform</span>
        </div>
      </Link>

      {/* Mobile Hamburger Button */}
      <button
        type="button"
        className="mobile-nav-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle navigation menu"
      >
        ☰
      </button>

      {/* Top Navbar Links */}
      <nav className={`nav-links-menu ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {navLinks.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link-item ${isActive ? "active" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <span className="nav-icon">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Right User & Logout Actions */}
      <div className="nav-right-actions">
        <div className="nav-user-pill">
          <div className="nav-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="nav-user-info">
            <span className="nav-user-name">{user?.name || "Khushhali"}</span>
            <span className="nav-user-role">Job Seeker</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="nav-logout-btn"
          title="Sign out of your account"
        >
          <span>↪</span> Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;

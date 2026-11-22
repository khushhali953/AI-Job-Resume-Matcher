import { Link } from "react-router-dom";
import "./Footer.css";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Section with Brand & Links Grid */}
        <div className="footer-top-grid">
          {/* Brand Info Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              <div className="footer-logo-badge">AI</div>
              <div className="footer-logo-text">
                <span className="brand-name">CareerMatch</span>
                <span className="brand-sub">AI Resume Platform</span>
              </div>
            </Link>

            <p className="footer-tagline">
              Empowering engineers and job seekers with instant AI resume analysis, personalized skill gap roadmaps, and intelligent mock interview coaching.
            </p>

            <div className="footer-status-pill">
              <span className="status-dot"></span>
              <span>All AI Systems Operational</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="footer-links-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
              <li>
                <Link to="/resume-analyzer">Resume Analyzer</Link>
              </li>
              <li>
                <Link to="/job-matcher">Job Matcher</Link>
              </li>
              <li>
                <Link to="/skill-gap">Skill Gap Report</Link>
              </li>
              <li>
                <Link to="/interview-prep">Interview Prep</Link>
              </li>
            </ul>
          </div>

          {/* Resources Links */}
          <div className="footer-links-col">
            <h4>Features & Tools</h4>
            <ul>
              <li>
                <Link to="/resume-analyzer">Cloudinary PDF Storage</Link>
              </li>
              <li>
                <Link to="/job-matcher">Role Skill Mapping</Link>
              </li>
              <li>
                <Link to="/interview-prep">OOP & System Design Practice</Link>
              </li>
              <li>
                <Link to="/interview-prep">HR & STAR Method Coaching</Link>
              </li>
              <li>
                <Link to="/dashboard">Career Readiness Scoring</Link>
              </li>
            </ul>
          </div>

          {/* Account / Quick Links */}
          <div className="footer-links-col">
            <h4>Get Started</h4>
            <ul>
              <li>
                <Link to="/signup">Create Free Account</Link>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/">Home Overview</Link>
              </li>
              <li>
                <a href="#how-it-works" onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}>
                  How It Works
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <p className="copyright-text">
            © {new Date().getFullYear()} CareerMatch. AI-Powered Resume Matching & Career Platform. All rights reserved.
          </p>

          <div className="footer-legal-links">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Security & ATS Compliance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

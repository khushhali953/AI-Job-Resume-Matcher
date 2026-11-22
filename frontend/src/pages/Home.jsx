import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import "./Home.css";

function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="home-page">
      {/* ================= TOP NAVBAR ================= */}
      <nav className="home-navbar">
        <Link to="/" className="home-logo">
          <div className="home-logo-badge">AI</div>
          <div className="home-logo-text">
            <span className="brand-title">CareerMatch</span>
            <span className="brand-subtitle">AI Resume Platform</span>
          </div>
        </Link>

        <div className="home-nav-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            About
          </a>
        </div>

        <div className="home-nav-actions">
          {user && (
            <Link to="/dashboard" className="home-btn-ghost" style={{ fontWeight: 600 }}>
              Dashboard
            </Link>
          )}
          <Link to="/login" className="home-btn-ghost">
            Sign In
          </Link>
          <Link to="/signup" className="home-btn-primary">
            Sign Up <span>→</span>
          </Link>
        </div>
      </nav>

      {/* ================= HERO SECTION ================= */}
      <section className="home-hero" id="home">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-sparkle">✨</span>
              <span>AI-Powered Career & Resume Platform</span>
            </div>

            <h1 className="hero-title">
              Turn Your Resume Into <br />
              <span className="gradient-text">Real Career Opportunities.</span>
            </h1>

            <p className="hero-description">
              Upload your resume for instant AI scoring, pinpoint high-priority skill gaps for top roles, and practice personalized technical & HR mock interviews with real-time feedback.
            </p>

            <div className="hero-cta-group">
              <Link to="/resume-analyzer" className="home-btn-primary large-cta">
                <span>📄 Analyze Your Resume</span>
                <span className="btn-arrow">→</span>
              </Link>

              <Link to="/interview-prep" className="home-btn-outline large-cta">
                <span>🎯 Practice Interview</span>
              </Link>
            </div>

            <div className="hero-proof-strip">
              <div className="proof-item">
                <span className="proof-check">✓</span>
                <span>Cloudinary PDF Storage</span>
              </div>
              <div className="proof-item">
                <span className="proof-check">✓</span>
                <span>98% ATS Skill Matching</span>
              </div>
              <div className="proof-item">
                <span className="proof-check">✓</span>
                <span>AI Interview Coaching</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Interactive Card */}
          <div className="hero-right">
            <div className="hero-card-stack">
              {/* Floating Top Badge */}
              <div className="floating-badge badge-top">
                <span className="badge-icon">⚡</span>
                <div>
                  <strong>AI Match Rate: 92%</strong>
                  <span>Software Engineer Target</span>
                </div>
              </div>

              {/* Main Dashboard Preview Card */}
              <div className="hero-preview-card">
                <div className="card-header-row">
                  <div className="user-profile-summary">
                    <div className="avatar-chip">AI</div>
                    <div>
                      <strong>Senior / Full Stack Candidate</strong>
                      <small>sample_resume.pdf • Cloudinary Verified</small>
                    </div>
                  </div>
                  <span className="status-pill-green">ATS Ready</span>
                </div>

                {/* Score Dial Row */}
                <div className="preview-score-row">
                  <div className="preview-score-circle">
                    <span className="circle-score">92</span>
                    <span className="circle-label">Score</span>
                  </div>

                  <div className="preview-score-info">
                    <h4>Strong Technical Profile</h4>
                    <p>Matches 8 out of 9 core requirements for MERN & Full Stack roles.</p>
                  </div>
                </div>

                {/* Skills Pill Cloud */}
                <div className="preview-skills-block">
                  <span className="preview-section-title">Verified Skills:</span>
                  <div className="pill-wrap">
                    <span className="skill-pill-green">Java</span>
                    <span className="skill-pill-green">React</span>
                    <span className="skill-pill-green">Node.js</span>
                    <span className="skill-pill-green">SQL</span>
                    <span className="skill-pill-green">MongoDB</span>
                    <span className="skill-pill-green">REST API</span>
                  </div>
                </div>

                {/* Interview Preview Snippet */}
                <div className="preview-interview-box">
                  <div className="interview-preview-header">
                    <span className="interview-badge">🎯 Mock Interview Question</span>
                    <span className="interview-score">Score: 8.8 / 10</span>
                  </div>
                  <p className="interview-q-text">
                    &ldquo;Explain the four pillars of Object-Oriented Programming in Java.&rdquo;
                  </p>
                  <div className="interview-feedback-mini">
                    <span>✓ Clear definitions of Encapsulation, Abstraction, Inheritance & Polymorphism</span>
                  </div>
                </div>
              </div>

              {/* Floating Bottom Badge */}
              <div className="floating-badge badge-bottom">
                <span className="badge-icon">📊</span>
                <div>
                  <strong>Skill Gap Identified</strong>
                  <span>Learn Docker & Spring Boot</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES GRID ================= */}
      <section className="features-section" id="features">
        <div className="section-header">
          <span className="eyebrow-text">POWERFUL AI CAPABILITIES</span>
          <h2>Everything You Need to Get Hired</h2>
          <p>
            An end-to-end platform designed to help software engineers stand out to recruiters and ace every interview round.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <div className="feature-box">
            <div className="feature-icon-wrap">📄</div>
            <h3>AI Resume Analyzer</h3>
            <p>
              Upload your PDF to Cloudinary and get deep ATS compatibility scoring, automated skill extraction, and personalized career roadmaps.
            </p>
            <Link to="/resume-analyzer" className="feature-link">
              Analyze Resume <span>→</span>
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="feature-box">
            <div className="feature-icon-wrap">💼</div>
            <h3>Smart Job Matcher</h3>
            <p>
              Compare your verified competencies against industry-standard requirements for MERN, Java, Python, and Cloud roles.
            </p>
            <Link to="/job-matcher" className="feature-link">
              Find Matching Jobs <span>→</span>
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="feature-box">
            <div className="feature-icon-wrap">📊</div>
            <h3>Skill Gap Analyzer</h3>
            <p>
              Pinpoint the exact missing tools, frameworks, and database concepts you need to learn to maximize your match percentage.
            </p>
            <Link to="/skill-gap" className="feature-link">
              View Skill Gap <span>→</span>
            </Link>
          </div>

          {/* Feature 4 */}
          <div className="feature-box">
            <div className="feature-icon-wrap">🎯</div>
            <h3>AI Interview Prep</h3>
            <p>
              Practice tailored Technical, HR, and Mixed interview sessions with instant AI answer evaluations, strengths, and sample answers.
            </p>
            <Link to="/interview-prep" className="feature-link">
              Start Practice <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-header">
          <span className="eyebrow-text">FOUR SIMPLE STEPS</span>
          <h2>How CareerMatch Accelerates Your Job Search</h2>
          <p>
            From resume upload to final offer letter, our AI guides every step of your professional journey.
          </p>
        </div>

        <div className="steps-container">
          {/* Step 1 */}
          <div className="step-card">
            <div className="step-num">01</div>
            <div className="step-icon">📤</div>
            <h4>Upload Your Resume</h4>
            <p>Securely upload your PDF resume to Cloudinary for instant PyMuPDF text parsing and indexing.</p>
          </div>

          {/* Step 2 */}
          <div className="step-card">
            <div className="step-num">02</div>
            <div className="step-icon">🤖</div>
            <h4>Get AI Analysis</h4>
            <p>Review your ATS score, detected languages, frameworks, education, and career recommendations.</p>
          </div>

          {/* Step 3 */}
          <div className="step-card">
            <div className="step-num">03</div>
            <div className="step-icon">🎯</div>
            <h4>Practice Interviews</h4>
            <p>Answer questions tailored to your resume skills and get immediate AI feedback with model answers.</p>
          </div>

          {/* Step 4 */}
          <div className="step-card">
            <div className="step-num">04</div>
            <div className="step-icon">🏆</div>
            <h4>Bridge Gaps & Succeed</h4>
            <p>Follow tailored learning paths, close your skill gaps, and step into interviews with total confidence.</p>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION BANNER ================= */}
      <section className="cta-section">
        <div className="cta-card">
          <span className="cta-badge">GET STARTED TODAY</span>
          <h2>Ready to Land Your Dream Tech Role?</h2>
          <p>
            Join thousands of candidates who analyze their resumes, sharpen their technical skills, and prepare for interviews with CareerMatch.
          </p>

          <div className="cta-actions">
            <Link to="/signup" className="cta-btn-white">
              Create Free Account <span>→</span>
            </Link>
            <Link to="/resume-analyzer" className="cta-btn-trans">
              Try Resume Analyzer
            </Link>
          </div>
        </div>
      </section>

      {/* ================= REUSABLE FOOTER ================= */}
      <Footer />
    </div>
  );
}

export default Home;
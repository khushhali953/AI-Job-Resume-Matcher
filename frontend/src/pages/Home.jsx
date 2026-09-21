import "./Home.css";
import { Link } from "react-router-dom";
function Home() {
  return (
    <div className="home">

      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">
          <div className="logo-icon">M</div>
          <div>
            <h2>Matchify</h2>
            <span>Your Resume. Real Opportunities.</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#home" className="active">Home</a>
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
        </div>

        <div className="nav-buttons">
          <button className="login-btn">Sign In</button>
          <Link to="/signup" className="primary-btn">
            Get Started
            </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero" id="home">

        <div className="hero-content">

          <div className="badge">
            ✨ AI-Powered Career Platform
          </div>

          <h1>
            Turn Your Resume Into
            <span> Real Opportunities.</span>
          </h1>

          <p>
            Upload your resume, let AI understand your skills,
            discover matching jobs, identify skill gaps and
            get personalized career recommendations.
          </p>

          <div className="hero-buttons">
            <button className="primary-btn large-btn">
              Upload Resume <span>→</span>
            </button>

            <button className="secondary-btn">
              <span>⌕</span> Explore Jobs
            </button>
          </div>

          <div className="benefits">
            <span>✓ AI Resume Analysis</span>
            <span>✓ Smart Job Matching</span>
            <span>✓ Skill Gap Insights</span>
          </div>

        </div>

        {/* Dashboard Preview */}
        <div className="hero-preview">

          <div className="floating-card card-top">
            📄 Resume Analysis
          </div>

          <div className="dashboard-card">

            <div className="dashboard-header">
              <div>
                <small>Resume Match Result</small>
                <h3>Software Engineer</h3>
              </div>

              <span className="details">View Details →</span>
            </div>

            <div className="match-area">

              <div className="score-circle">
                <strong>86%</strong>
                <small>Match</small>
              </div>

              <div className="job-info">
                <h3>Software Engineer</h3>
                <p>Full Stack Development</p>

                <div className="status">
                  <span>Good Match</span>
                  <span>Relevant Skills</span>
                </div>
              </div>

            </div>

            <div className="skills-section">
              <h4>Matched Skills</h4>

              <div className="skills">
                <span>Java</span>
                <span>React</span>
                <span>Node.js</span>
                <span>MongoDB</span>
                <span>Git</span>
              </div>
            </div>

            <div className="skills-section missing">
              <h4>Missing Skills</h4>

              <div className="skills">
                <span>Spring Boot</span>
                <span>AWS</span>
                <span>Docker</span>
              </div>
            </div>

            <div className="ai-suggestion">
              <div className="bulb">💡</div>

              <div>
                <strong>AI Suggestion</strong>
                <p>
                  Learning Spring Boot and AWS could improve
                  your match for backend roles.
                </p>
              </div>
            </div>

          </div>

          <div className="floating-card card-bottom">
            📈 Skill Gap Detected
          </div>

        </div>

      </section>

      {/* Feature Strip */}
      <section className="feature-strip">

        <div>
          <strong>AI</strong>
          <span>Resume Analysis</span>
        </div>

        <div>
          <strong>🎯</strong>
          <span>Smart Job Matching</span>
        </div>

        <div>
          <strong>📊</strong>
          <span>Skill Gap Analysis</span>
        </div>

        <div>
          <strong>✨</strong>
          <span>Career Guidance</span>
        </div>

      </section>

      {/* Features */}
      <section className="features" id="features">

        <div className="section-heading">
          <span>POWERFUL FEATURES</span>

          <h2>
            Everything You Need to
            <br />
            <span>Get Job Ready.</span>
          </h2>

          <p>
            From understanding your resume to preparing for interviews,
            Matchify helps you throughout your career journey.
          </p>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="feature-icon">📄</div>
            <h3>AI Resume Analysis</h3>
            <p>
              Automatically extract your skills, education,
              experience and projects from your resume.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Smart Job Matching</h3>
            <p>
              Compare your resume with job descriptions
              using AI-powered semantic matching.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Skill Gap Analysis</h3>
            <p>
              Discover which skills you already have and
              which skills you need for a target role.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎤</div>
            <h3>Interview Preparation</h3>
            <p>
              Generate personalized interview questions
              based on your resume and target job.
            </p>
          </div>

        </div>

      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">

        <div className="section-heading">
          <span>HOW IT WORKS</span>

          <h2>
            From Resume to
            <span> Opportunity.</span>
          </h2>

          <p>
            Four simple steps to move closer to your next opportunity.
          </p>
        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <div className="step-icon">↑</div>
            <h3>Upload Resume</h3>
            <p>
              Upload your resume in PDF or DOCX format.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <div className="step-icon">✦</div>
            <h3>AI Analysis</h3>
            <p>
              AI extracts and understands your professional profile.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <div className="step-icon">⌕</div>
            <h3>Find Matches</h3>
            <p>
              Compare your profile with relevant job opportunities.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <div className="step-icon">↗</div>
            <h3>Improve & Grow</h3>
            <p>
              Identify skill gaps and get personalized suggestions.
            </p>
          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="cta">

        <div>
          <span>READY TO GET STARTED?</span>

          <h2>
            Your next opportunity
            <br />
            starts with your resume.
          </h2>

          <p>
            Let AI help you understand where you stand
            and where you can go next.
          </p>

          <button className="primary-btn large-btn">
            Analyze My Resume →
          </button>
        </div>

      </section>

      {/* Footer */}
      <footer>

        <div className="footer-logo">
          <div className="logo-icon">M</div>
          <div>
            <h3>Matchify</h3>
            <p>AI-powered career matching.</p>
          </div>
        </div>

        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#about">About</a>
          <a href="#">GitHub</a>
        </div>

        <p className="copyright">
          © 2026 Matchify. All rights reserved.
        </p>

      </footer>

    </div>
  );
}

export default Home;
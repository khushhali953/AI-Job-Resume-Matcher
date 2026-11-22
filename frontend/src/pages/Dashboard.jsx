import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useResume } from "../context/ResumeContext";
import "./Dashboard.css";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const { uploadedResume: latestResume } = useResume();

  const resumeScore = latestResume?.analysis?.score || 86;
  const skillsCount =
    latestResume?.analysis?.totalSkillsFound ||
    latestResume?.analysis?.skills?.length ||
    18;

  const handleOpenPdf = (e) => {
    e.preventDefault();
    if (!latestResume) return;
    const url = latestResume.viewUrl || latestResume.filePath;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="dashboard-page">
      {/* Top Navbar with Green & White Theme */}
      <Navbar />

      {/* Main Content Area */}
      <main className="dashboard-container">
        {/* ================= WELCOME BANNER ================= */}
        <div className="welcome-section">
          <div>
            <p className="welcome-label">Career Dashboard</p>
            <h1>Welcome back, {user?.name || "Khushhali"} 👋</h1>
            <p className="welcome-text">
              Here is your career overview, AI resume strength score, and
              matched job opportunities.
            </p>
          </div>

          <Link to="/resume-analyzer" className="primary-btn">
            + Analyze Resume
          </Link>
        </div>

        {/* ================= STATS GRID ================= */}
        <div className="stats-grid">
          {/* Card 1: Resume Score */}
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon">🎯</div>
              <span className="stat-change">+12%</span>
            </div>
            <p>Resume Score</p>
            <h2>
              {resumeScore}
              <span>/100</span>
            </h2>
            <div className="progress">
              <div
                className="progress-fill"
                style={{ width: `${Math.min(resumeScore, 100)}%` }}
              ></div>
            </div>
            <small>
              {resumeScore >= 80
                ? "Strong profile strength"
                : "Average profile strength"}
            </small>
          </div>

          {/* Card 2: Jobs Matched */}
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon">💼</div>
              <span className="stat-change">+5</span>
            </div>
            <p>Jobs Matched</p>
            <h2>24</h2>
            <div className="stat-footer">
              <span>8 new matches this week</span>
            </div>
          </div>

          {/* Card 3: Skills Detected */}
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon">✓</div>
              <span className="stat-change">Active</span>
            </div>
            <p>Skills Detected</p>
            <h2>{skillsCount}</h2>
            <div className="stat-footer">
              <span>
                {latestResume?.originalName
                  ? `${latestResume.originalName}`
                  : "Verified technical skills"}
              </span>
            </div>
          </div>

          {/* Card 4: Profile Completion */}
          <div className="stat-card">
            <div className="stat-top">
              <div className="stat-icon">📊</div>
              <span className="stat-change">85%</span>
            </div>
            <p>Profile Strength</p>
            <h2>85%</h2>
            <div className="progress">
              <div className="progress-fill" style={{ width: "85%" }}></div>
            </div>
            <small>Profile details verified</small>
          </div>
        </div>

        {/* ================= MAIN GRID ================= */}
        <div className="dashboard-grid">
          {/* RESUME ANALYSIS CARD */}
          <div className="dashboard-card resume-analysis">
            <div className="card-header">
              <div>
                <h3>AI Resume Evaluation</h3>
                <p>Latest uploaded resume metrics</p>
              </div>
              <Link to="/resume-analyzer">View Full Analysis →</Link>
            </div>

            <div className="resume-score-section">
              <div
                className="score-circle"
                style={{
                  background: `conic-gradient(#286b43 0% ${resumeScore}%, #e8f3ea ${resumeScore}% 100%)`,
                }}
              >
                <div>
                  <strong>{resumeScore}</strong>
                  <span>/100</span>
                </div>
              </div>

              <div className="score-info">
                <h4>
                  {resumeScore >= 80 ? "Strong Competitive Resume" : "Good Profile"}
                </h4>
                <p>
                  Your resume demonstrates strong technical foundations. Review
                  your recommended skills and career roadmap.
                </p>

                <div className="score-tags">
                  <span>✓ ATS Friendly</span>
                  <span>✓ {skillsCount} Skills</span>
                  <span>
                    {latestResume?.analysis?.sectionsFound?.experience
                      ? "✓ Experience"
                      : "! Fresher Profile"}
                  </span>
                </div>

                {latestResume && (
                  <div style={{ marginTop: "14px" }}>
                    <button
                      type="button"
                      onClick={handleOpenPdf}
                      className="cld-view-button"
                      title="Open resume PDF"
                    >
                      ☁️ View on Cloudinary ↗
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="analysis-items">
              <div>
                <span>Skills</span>
                <strong>92%</strong>
              </div>
              <div>
                <span>Experience</span>
                <strong>
                  {latestResume?.analysis?.sectionsFound?.experience
                    ? "84%"
                    : "Fresher"}
                </strong>
              </div>
              <div>
                <span>Formatting</span>
                <strong>95%</strong>
              </div>
              <div>
                <span>Keywords</span>
                <strong>88%</strong>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="dashboard-card quick-actions">
            <div className="card-header">
              <div>
                <h3>Quick Actions</h3>
                <p>Continue your career growth</p>
              </div>
            </div>

            <Link to="/resume-analyzer" className="quick-action">
              <div className="action-icon">📄</div>
              <div>
                <strong>Analyze Resume</strong>
                <span>AI score & skill gap</span>
              </div>
              <b>→</b>
            </Link>

            <Link to="/job-matcher" className="quick-action">
              <div className="action-icon">💼</div>
              <div>
                <strong>Find Matching Jobs</strong>
                <span>Discover suitable roles</span>
              </div>
              <b>→</b>
            </Link>

            <Link to="/skill-gap" className="quick-action">
              <div className="action-icon">📊</div>
              <div>
                <strong>Check Skill Gap</strong>
                <span>High-priority skills</span>
              </div>
              <b>→</b>
            </Link>

            <Link to="/interview-prep" className="quick-action">
              <div className="action-icon">🎯</div>
              <div>
                <strong>Interview Prep</strong>
                <span>AI mock practice & feedback</span>
              </div>
              <b>→</b>
            </Link>
          </div>
        </div>

        {/* ================= BOTTOM GRID ================= */}
        <div className="dashboard-grid bottom-grid">
          {/* RECOMMENDED JOBS */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>Recommended Jobs</h3>
                <p>Matches based on detected skills</p>
              </div>
              <Link to="/job-matcher">View All →</Link>
            </div>

            <div className="job-list">
              <div className="job-item">
                <div className="company-logo">G</div>
                <div className="job-info">
                  <strong>Software Engineer</strong>
                  <span>Google • Bengaluru</span>
                </div>
                <div className="match-score">94% Match</div>
              </div>

              <div className="job-item">
                <div className="company-logo">M</div>
                <div className="job-info">
                  <strong>Full Stack Developer</strong>
                  <span>Microsoft • Hyderabad</span>
                </div>
                <div className="match-score">89% Match</div>
              </div>

              <div className="job-item">
                <div className="company-logo">A</div>
                <div className="job-info">
                  <strong>Backend Developer</strong>
                  <span>Amazon • Bengaluru</span>
                </div>
                <div className="match-score">85% Match</div>
              </div>
            </div>
          </div>

          {/* SKILL GAP */}
          <div className="dashboard-card">
            <div className="card-header">
              <div>
                <h3>Target Skills Priority</h3>
                <p>Skills to target for senior engineering roles</p>
              </div>
              <Link to="/skill-gap">View Roadmap →</Link>
            </div>

            <div className="skill-list">
              <div className="skill-row">
                <div>
                  <strong>Docker & Containerization</strong>
                  <span>High priority</span>
                </div>
                <div className="skill-progress">
                  <div style={{ width: "40%" }}></div>
                </div>
              </div>

              <div className="skill-row">
                <div>
                  <strong>AWS Cloud Services</strong>
                  <span>High priority</span>
                </div>
                <div className="skill-progress">
                  <div style={{ width: "55%" }}></div>
                </div>
              </div>

              <div className="skill-row">
                <div>
                  <strong>TypeScript & React</strong>
                  <span>Medium priority</span>
                </div>
                <div className="skill-progress">
                  <div style={{ width: "70%" }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default Dashboard;
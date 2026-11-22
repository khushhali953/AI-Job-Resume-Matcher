import { useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MissingSkillsAccordion from "../components/MissingSkillsAccordion";
import { useResume } from "../context/ResumeContext";
import "./JobMatcher.css";

// Comprehensive database of roles and standard required industry skills
const ROLE_SKILLS = {
  "MERN Stack Developer": {
    required: ["JavaScript", "React", "Node.js", "Express.js", "MongoDB", "HTML", "CSS", "REST API", "Git"],
    advice: {
      "Express.js": "Build REST APIs, learn middleware, and handle modular routes.",
      "MongoDB": "Learn CRUD operations, queries, indexes, and Mongoose schema modeling.",
      "React": "Master components, hooks (useState, useEffect), and responsive state management.",
      "Node.js": "Deepen backend runtime architecture, event loop, and asynchronous operations.",
      "REST API": "Design clean API endpoints with standard HTTP status codes and error handling.",
      "JavaScript": "Master ES6+ concepts, async/await, closures, and promises.",
      "Git": "Practice version control, branch management, and GitHub pull requests.",
      "HTML": "Learn semantic HTML5 markup and accessibility best practices.",
      "CSS": "Master Flexbox, CSS Grid, and responsive layout styling."
    }
  },
  "Full Stack Developer": {
    required: ["JavaScript", "React", "Node.js", "SQL", "MongoDB", "HTML", "CSS", "Git", "REST API", "Docker"],
    advice: {
      "Docker": "Learn containerization, Dockerfiles, and multi-container Docker Compose setups.",
      "SQL": "Practice relational queries, table joins, transactions, and indexing.",
      "React": "Build interactive user interfaces with components, hooks, and client-side routing.",
      "Node.js": "Develop scalable backend web services with Express or Fastify.",
      "MongoDB": "Master document storage, aggregations, and high-performance querying.",
      "REST API": "Implement secure JWT authenticated endpoints with request validation."
    }
  },
  "Frontend Developer": {
    required: ["JavaScript", "TypeScript", "React", "HTML", "CSS", "Tailwind CSS", "Redux", "Git"],
    advice: {
      "TypeScript": "Add strict type safety with interfaces, types, and generic component props.",
      "React": "Master modern React patterns, custom hooks, and performance profiling.",
      "Tailwind CSS": "Speed up responsive UI development with utility-first CSS classes.",
      "Redux": "Manage complex global application state using Redux Toolkit.",
      "JavaScript": "Deep dive into the DOM, event bubbling, and modern web APIs."
    }
  },
  "Backend Developer": {
    required: ["Node.js", "Express.js", "Python", "SQL", "PostgreSQL", "MongoDB", "REST API", "Docker", "Git"],
    advice: {
      "Express.js": "Build production RESTful APIs with authentication and rate limiting.",
      "PostgreSQL": "Design normalized database tables, foreign keys, and perform query tuning.",
      "Docker": "Deploy and test backend microservices inside isolated containers.",
      "Python": "Learn Python backend microservices using FastAPI or Django.",
      "SQL": "Write optimized database queries and handle concurrent transactions."
    }
  },
  "Java Software Engineer": {
    required: ["Java", "Spring Boot", "SQL", "MySQL", "Data Structures", "Algorithms", "Git", "REST API"],
    advice: {
      "Spring Boot": "Build enterprise REST APIs using Spring Data JPA, IoC, and Spring Security.",
      "Data Structures": "Practice arrays, linked lists, trees, heaps, and hash maps.",
      "Algorithms": "Master sorting, binary search, and dynamic programming patterns on LeetCode.",
      "SQL": "Learn relational schema design, indexing, and stored procedures in MySQL."
    }
  },
  "Python & AI Engineer": {
    required: ["Python", "Machine Learning", "Deep Learning", "NumPy", "Pandas", "TensorFlow", "PyTorch", "SQL", "Git"],
    advice: {
      "Machine Learning": "Study supervised and unsupervised algorithms using Scikit-Learn.",
      "Deep Learning": "Build neural networks and computer vision models with PyTorch or TensorFlow.",
      "Pandas": "Master data frames, data cleaning, and statistical analysis.",
      "NumPy": "Perform vectorized array operations and numerical linear algebra."
    }
  },
  "Cloud & DevOps Engineer": {
    required: ["Linux", "Docker", "Kubernetes", "AWS", "CI/CD", "Git", "Python"],
    advice: {
      "Docker": "Package applications with efficient multi-stage Docker builds.",
      "Kubernetes": "Orchestrate container workloads with Pods, Deployments, and Services.",
      "AWS": "Manage core cloud infrastructure with EC2, S3, RDS, and IAM roles.",
      "CI/CD": "Automate test and deployment pipelines with GitHub Actions."
    }
  }
};

// Skill extraction helper from pasted Job Description text
const ALL_COMMON_SKILLS = [
  "JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "HTML", "CSS", "Tailwind CSS",
  "Node.js", "Express.js", "Python", "Django", "Flask", "FastAPI", "Java", "Spring Boot", "C++",
  "SQL", "MySQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Docker", "Kubernetes", "Git", "GitHub",
  "REST API", "GraphQL", "Machine Learning", "Deep Learning", "Data Structures", "Algorithms"
];

function extractSkillsFromText(text) {
  if (!text || text.trim() === "") return [];
  const found = [];
  ALL_COMMON_SKILLS.forEach((skill) => {
    const regex = new RegExp(`(?<![\\w#+])${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w#+])`, "i");
    if (regex.test(text)) {
      found.push(skill);
    }
  });
  return found;
}

function JobMatcher() {
  const {
    uploadedResume: resume,
    loadingResume,
    jobMatcherData,
    setJobMatcherData,
    clearJobMatcherData,
  } = useResume();

  // Read persisted state from ResumeContext
  const selectedRole = jobMatcherData?.selectedRole || "MERN Stack Developer";
  const jobDescription = jobMatcherData?.jobDescription || "";
  const report = jobMatcherData?.report || null;
  const reportRef = useRef(null);

  const handleRoleChange = (e) => {
    setJobMatcherData({ selectedRole: e.target.value });
  };

  const handleJobDescChange = (e) => {
    setJobMatcherData({ jobDescription: e.target.value });
  };

  const handleReset = () => {
    clearJobMatcherData();
  };

  const handleAnalyzeGap = (e) => {
    e.preventDefault();

    if (!resume) return;

    // Get candidate's skills from resume
    const userSkills = resume.analysis?.skills || [];
    const userSkillsLower = userSkills.map((s) => s.toLowerCase());

    // Get required skills from selected role
    let requiredSkills = ROLE_SKILLS[selectedRole]?.required || [];
    const roleAdvice = ROLE_SKILLS[selectedRole]?.advice || {};

    // If user pasted a job description, also extract skills from it
    if (jobDescription.trim().length > 10) {
      const extractedFromJD = extractSkillsFromText(jobDescription);
      if (extractedFromJD.length > 0) {
        // Merge without duplicates
        const combined = Array.from(new Set([...requiredSkills, ...extractedFromJD]));
        requiredSkills = combined;
      }
    }

    // Calculate matched & missing skills
    const matchedSkills = [];
    const missingSkills = [];

    requiredSkills.forEach((reqSkill) => {
      const isMatched = userSkillsLower.includes(reqSkill.toLowerCase());
      if (isMatched) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const totalRequired = requiredSkills.length || 1;
    const matchPercentage = Math.round((matchedSkills.length / totalRequired) * 100);

    // Build tailored learning path for the missing skills
    const learningPath = missingSkills.map((skill, index) => {
      let advice = roleAdvice[skill];
      if (!advice) {
        advice = `Learn core concepts, complete hands-on tutorials, and build a project with ${skill}.`;
      }
      return {
        step: index + 1,
        skill: skill,
        title: `Learn & Practice ${skill}`,
        description: advice,
      };
    });

    const newReport = {
      role: selectedRole,
      matchPercentage,
      matchedSkills,
      missingSkills,
      learningPath,
    };

    // Save report in context & user-isolated sessionStorage
    setJobMatcherData({
      selectedRole,
      jobDescription,
      report: newReport,
    });

    setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="job-matcher-page">
      {/* Top Navbar with Green & White Theme */}
      <Navbar />

      <main className="job-matcher-container">
        {/* Header */}
        <header className="page-header">
          <span className="eyebrow">AI Skill Gap Intelligence</span>
          <h1>Skill Gap & Job Matcher Analyzer</h1>
          <p>
            Identify the skills you need for your dream job. Compare your resume
            qualifications directly against target industry roles or custom job descriptions.
          </p>
        </header>

        {/* Loading state */}
        {loadingResume ? (
          <div className="empty-state-card">
            <p>Loading your profile details...</p>
          </div>
        ) : !resume ? (
          /* ================= EMPTY STATE: WHEN NO RESUME IS UPLOADED ================= */
          <div className="empty-state-card">
            <div className="empty-target-icon">🎯</div>
            <h2>Upload your resume to identify your skill gaps</h2>
            <p>
              We need your analyzed resume skills to compare against target job roles
              and calculate your personalized skill gap report.
            </p>
            <Link to="/resume-analyzer" className="empty-upload-btn">
              + Upload Resume Now
            </Link>
          </div>
        ) : (
          /* ================= COMPARE YOUR SKILLS FORM ================= */
          <div>
            <div className="matcher-form-card">
              <h2 className="card-title">
                <span>📊</span> Compare Your Skills
              </h2>

              <form onSubmit={handleAnalyzeGap}>
                {/* 1. Selected Resume */}
                <div className="form-group">
                  <label>Selected Resume</label>
                  <div className="selected-resume-box">
                    <div className="resume-file-info">
                      <span className="resume-icon">📄</span>
                      <div>
                        <span className="resume-name">
                          {resume.originalName || "My Resume.pdf"}
                        </span>
                        <span className="resume-skill-count">
                          {resume.analysis?.skills?.length || 0} Skills Detected
                        </span>
                      </div>
                    </div>
                    <Link to="/resume-analyzer" className="change-resume-link">
                      Switch / Upload New Resume →
                    </Link>
                  </div>
                </div>

                {/* 2. Target Job Role */}
                <div className="form-group">
                  <label htmlFor="target-role">Target Job Role</label>
                  <select
                    id="target-role"
                    className="form-select"
                    value={selectedRole}
                    onChange={handleRoleChange}>
                    {Object.keys(ROLE_SKILLS).map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Paste Job Description */}
                <div className="form-group">
                  <label htmlFor="job-desc">
                    Or paste a job description (Optional)
                  </label>
                  <textarea
                    id="job-desc"
                    className="form-textarea"
                    placeholder="Paste job requirements or JD here (optional)..."
                    value={jobDescription}
                    onChange={handleJobDescChange}
                  ></textarea>
                </div>

                {/* 4. Action Buttons */}
                <div className="matcher-btn-row">
                  <button type="submit" className="analyze-btn">
                    Analyze Skill Gap →
                  </button>
                  {report && (
                    <button
                      type="button"
                      className="reset-matcher-btn"
                      onClick={handleReset}
                      title="Clear saved search and reset results"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* ================= RESULTS: SKILL GAP REPORT ================= */}
            {report && (
              <section ref={reportRef} className="report-section">
                <div className="report-header">
                  <h2>Your Skill Gap Report</h2>
                  <p>
                    Comparing your resume against requirements for{" "}
                    <strong>{report.role}</strong>
                  </p>
                </div>

                {/* 3 Summary Cards */}
                <div className="report-summary-grid">
                  {/* Card 1: Skill Match % */}
                  <div className="summary-stat-card">
                    <div className="stat-icon-wrap match">🎯</div>
                    <div className="stat-subtext">Skill Match</div>
                    <div className="stat-val">{report.matchPercentage}%</div>
                    <div className="stat-desc">
                      {report.matchPercentage >= 75
                        ? "High qualification match"
                        : report.matchPercentage >= 50
                        ? "Moderate match — targeted learning needed"
                        : "Entry level gap — follow recommended roadmap"}
                    </div>
                  </div>

                  {/* Card 2: Skills to Learn */}
                  <div className="summary-stat-card">
                    <div className="stat-icon-wrap missing">⚡</div>
                    <div className="stat-subtext">Skills to Learn</div>
                    <div className="stat-val">{report.missingSkills.length}</div>
                    <div className="stat-desc">Missing required skills</div>
                  </div>

                  {/* Card 3: Skills Matched */}
                  <div className="summary-stat-card">
                    <div className="stat-icon-wrap matched">✓</div>
                    <div className="stat-subtext">Skills Matched</div>
                    <div className="stat-val">{report.matchedSkills.length}</div>
                    <div className="stat-desc">Verified skills from resume</div>
                  </div>
                </div>

                {/* Side-by-Side Comparison: Skills You Have vs Skills You Need */}
                <div className="comparison-grid">
                  {/* Column 1: Skills You Have */}
                  <div className="skills-panel">
                    <div className="panel-head">
                      <h3>Skills You Have</h3>
                      <span className="panel-pill matched-pill">
                        {report.matchedSkills.length} Matched
                      </span>
                    </div>

                    {report.matchedSkills.length > 0 ? (
                      <div className="skills-tags-wrap">
                        {report.matchedSkills.map((skill, index) => (
                          <span key={index} className="skill-tag-pill have">
                            <span>✓</span> {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#798c7e", fontSize: "14px" }}>
                        No direct skills matched for this target role yet.
                      </p>
                    )}
                  </div>

                  {/* Column 2: Skills You Need */}
                  <div className="skills-panel">
                    <div className="panel-head">
                      <h3>Skills You Need</h3>
                      <span className="panel-pill missing-pill">
                        {report.missingSkills.length} Missing
                      </span>
                    </div>

                    {report.missingSkills.length > 0 ? (
                      <div className="skills-tags-wrap">
                        {report.missingSkills.map((skill, index) => (
                          <span key={index} className="skill-tag-pill need">
                            <span>+</span> {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p style={{ color: "#286b43", fontSize: "14px", fontWeight: 650 }}>
                        ✓ Incredible! You already have all the core required skills for this role!
                      </p>
                    )}
                  </div>
                </div>

                {/* Recommended Learning Path */}
                {report.learningPath.length > 0 && (
                  <div className="learning-path-panel">
                    <h3>Recommended Learning Path</h3>
                    <p>
                      Step-by-step guidance to bridge your skill gaps and qualify for{" "}
                      {report.role}.
                    </p>

                    <div className="learning-path-list">
                      {report.learningPath.map((item) => (
                        <div key={item.step} className="learning-card">
                          <div className="step-number">{item.step}</div>
                          <div className="step-details">
                            <h4>{item.title}</h4>
                            <p>{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feature 2: Expandable Learning Resources for Missing Target Skills */}
                {report.missingSkills && report.missingSkills.length > 0 && (
                  <MissingSkillsAccordion
                    skills={report.missingSkills}
                    title="Skills You Are Missing for this Role"
                    subtitle="Click each missing skill below to access verified GeeksforGeeks articles and YouTube video tutorials."
                  />
                )}

                {/* Feature 3: Prepare for Interview CTA for Matched Role */}
                <div style={{
                  marginTop: "32px",
                  background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
                  border: "1.5px solid #bbf7d0",
                  borderRadius: "16px",
                  padding: "24px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  flexWrap: "wrap",
                  boxShadow: "0 4px 16px rgba(22, 101, 52, 0.08)"
                }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px 0", color: "#166534", fontSize: "18px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>🎯</span> Practice Mock Interview for {report.role}
                    </h3>
                    <p style={{ margin: 0, color: "#374151", fontSize: "14px", lineHeight: "1.5" }}>
                      Generate dynamic AI interview questions tailored to your resume skills and this target role using Google Gemini.
                    </p>
                  </div>
                  <Link
                    to="/interview-prep"
                    state={{ role: report.role }}
                    style={{
                      background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "#ffffff",
                      padding: "12px 24px",
                      borderRadius: "10px",
                      fontWeight: 700,
                      fontSize: "14.5px",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)",
                    }}
                  >
                    <span>🚀</span> Prepare for Interview →
                  </Link>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default JobMatcher;

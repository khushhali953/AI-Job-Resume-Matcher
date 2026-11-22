import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import MissingSkillsAccordion from "../components/MissingSkillsAccordion";
import { extractMissingSkills } from "../utils/learningResources";
import { useResume } from "../context/ResumeContext";
import "./ResumeAnalyzer.css";

// Helper to format Markdown bold text (**text**) into <strong>text</strong>
function formatText(text) {
  if (!text) return "";
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function ResumeAnalyzer() {
  const fileInputRef = useRef(null);

  // Resume context maintains uploaded resume and analysis across page navigations and refreshes
  const {
    uploadedResume,
    analysis,
    loadingResume,
    setResumeData,
  } = useResume();

  // Extract missing skills dynamically (never showing skills the user already has)
  const missingSkills = extractMissingSkills(analysis);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCopyLink = () => {
    const link = uploadedResume?.filePath;
    if (link) {
      navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleOpenPdf = (e) => {
    e.preventDefault();
    if (!uploadedResume) return;
    // Open via viewUrl which streams the PDF directly with 0 errors
    const targetUrl =
      uploadedResume.viewUrl ||
      `http://localhost:5000/api/resumes/view/${uploadedResume._id}` ||
      uploadedResume.filePath;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const processFile = async (file) => {
    if (!file) return;

    setMessage("");
    setError("");

    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setMessage("Uploading resume to Cloudinary & calculating AI score...");

      const token = localStorage.getItem("token");
      const headers = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Upload and analyze dynamically in real time
      const uploadResponse = await fetch(
        "http://localhost:5000/api/resumes/upload",
        {
          method: "POST",
          headers,
          credentials: "include",
          body: formData,
        }
      );

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || "Resume upload failed.");
      }

      let finalAnalysis = uploadData.analysis;

      if (!finalAnalysis || !finalAnalysis.skills || finalAnalysis.skills.length === 0) {
        if (uploadData.resume?._id) {
          // Fallback: Trigger analyze endpoint if not returned directly
          setMessage("Resume saved to Cloudinary! Fetching AI results...");
          const analyzeResponse = await fetch(
            `http://localhost:5000/api/resumes/analyze/${uploadData.resume._id}`,
            {
              method: "POST",
              headers,
              credentials: "include",
            }
          );

          const analyzeData = await analyzeResponse.json();
          if (analyzeResponse.ok && analyzeData.analysis) {
            finalAnalysis = analyzeData.analysis;
          }
        }
      }

      // Persist resume and analysis into global context and storage
      setResumeData(uploadData.resume, finalAnalysis);
      setMessage("Resume uploaded to Cloudinary & analyzed successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong during upload.");
      setMessage("");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const getSectionCount = () => {
    if (!analysis?.sectionsFound) return 0;
    let count = 0;
    if (analysis.sectionsFound.education) count++;
    if (analysis.sectionsFound.experience) count++;
    if (analysis.sectionsFound.projects) count++;
    return count;
  };

  const hasNoExperience =
    analysis && analysis.sectionsFound && !analysis.sectionsFound.experience;

  return (
    <div className="resume-analyzer-page">
      {/* Top Navbar with Green & White Theme */}
      <Navbar />

      <main className="analyzer-container">
        {/* Header */}
        <header className="resume-header">
          <div className="analyzer-header-row">
            <div>
              <span className="eyebrow">Smart Career AI</span>
              <h1>AI Resume Analyzer & Career Advisor</h1>
              <p>
                Upload your resume PDF to store it securely on Cloudinary and get real-time
                AI scores, skills detection, section checks, and a personalized career roadmap.
              </p>
            </div>

            {uploadedResume && (
              <button
                type="button"
                className="upload-another-btn"
                onClick={handleUploadClick}
                disabled={loading}
              >
                + Upload Another Resume
              </button>
            )}
          </div>
        </header>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />

        {/* Upload Card / Dropzone: Shown immediately on page load */}
        <div
          className={`upload-card ${isDragging ? "dragging" : ""}`}
          onClick={handleUploadClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="file-icon-box">📄</div>
          <h2>{loading ? "Processing Resume..." : "Upload Your Resume"}</h2>
          <p>
            Drag and drop your resume PDF here, or click to browse (Max 5 MB)
          </p>

          <div className="upload-card-actions">
            <button
              type="button"
              className="upload-button"
              onClick={(e) => {
                e.stopPropagation();
                handleUploadClick();
              }}
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? "Uploading & Analyzing..." : "Select PDF Resume"}
            </button>
          </div>

          {message && (
            <div className="upload-message" onClick={(e) => e.stopPropagation()}>
              <span>✓</span>
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="error-message" onClick={(e) => e.stopPropagation()}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ================= CLOUDINARY STORAGE CARD ================= */}
        {/* Appears dynamically as soon as user uploads their resume */}
        {uploadedResume && (
          <div className="cloudinary-card">
            <div className="cloudinary-left">
              <div className="cloud-icon-badge">☁️</div>
              <div className="cloudinary-meta">
                <h3>
                  {uploadedResume.originalName || "Uploaded Resume.pdf"}
                  <span className="cld-tag">✓ Saved to Cloudinary</span>
                </h3>
                <p>
                  Uploaded on{" "}
                  {new Date(
                    uploadedResume.uploadedAt || Date.now()
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {uploadedResume.filePath && (
                  <span className="cld-url-preview" title={uploadedResume.filePath}>
                    {uploadedResume.filePath}
                  </span>
                )}
              </div>
            </div>

            <div className="cloudinary-actions">
              <button
                type="button"
                onClick={handleOpenPdf}
                className="cld-view-btn"
                title="Click to view and open your resume PDF"
              >
                <span>🔗</span> View on Cloudinary ↗
              </button>

              <button
                type="button"
                className="cld-copy-btn"
                onClick={handleCopyLink}
                title="Copy Cloudinary URL to clipboard"
              >
                {copied ? "✓ Copied!" : "📋 Copy Link"}
              </button>
            </div>
          </div>
        )}

        {/* ================= DYNAMIC AI ANALYSIS RESULTS ================= */}
        {/* Only rendered AFTER the user uploads a resume */}
        {analysis && (
          <section className="analysis-results">
            <div className="results-heading">
              <div>
                <span className="eyebrow">AI Career Evaluation</span>
                <h2>Resume Analysis Results</h2>
                <p>
                  Calculated metrics and intelligent evaluation of your profile.
                </p>
              </div>

              <div className="analysis-badge">
                <span className="status-dot"></span>
                <span>Analysis Complete</span>
              </div>
            </div>

            {/* Top 3 Metric Cards */}
            <div className="results-grid">
              {/* Card 1: Resume Score */}
              <div className="result-card">
                <div className="result-icon score">🎯</div>
                <div className="result-label">AI Resume Score</div>
                <h3>
                  {analysis.score ?? 80}
                  <span className="total-count">/100</span>
                </h3>
                <div className="score-progress-bar">
                  <div
                    className="score-progress-fill"
                    style={{ width: `${Math.min(analysis.score ?? 80, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Card 2: Total Skills */}
              <div className="result-card">
                <div className="result-icon skills">💡</div>
                <div className="result-label">Skills Detected</div>
                <h3>{analysis.totalSkillsFound ?? analysis.skills?.length ?? 0}</h3>
                <span className="total-count">Verified technologies</span>
              </div>

              {/* Card 3: Sections */}
              <div className="result-card">
                <div className="result-icon sections">📑</div>
                <div className="result-label">Sections Found</div>
                <h3>
                  {getSectionCount()}
                  <span className="total-count">/3 key sections</span>
                </h3>
                <span className="total-count">
                  {getSectionCount() === 3
                    ? "Full structure coverage"
                    : hasNoExperience
                    ? "Fresher (No Work Experience)"
                    : "Partial coverage"}
                </span>
              </div>
            </div>

            {/* Panel 1: Detected Skills */}
            <div className="result-panel">
              <div className="panel-heading">
                <div>
                  <h3>Detected Skills & Technologies</h3>
                  <p>
                    Technical skills and tools identified by our AI parser.
                  </p>
                </div>
                <span className="count-badge">
                  {analysis.skills?.length || 0}
                </span>
              </div>

              {analysis.skills?.length > 0 ? (
                <div className="skills-list">
                  {analysis.skills.map((skill, index) => (
                    <span className="skill-tag" key={index}>
                      <span>✓</span> {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="empty-state">
                  No technical skills matched in the document.
                </p>
              )}
            </div>

            {/* Panel 2: Section Audit */}
            <div className="result-panel">
              <div className="panel-heading">
                <div>
                  <h3>Section Structure Audit</h3>
                  <p>
                    Verification of standard resume sections required for ATS screening.
                  </p>
                </div>
              </div>

              <div className="sections-list">
                {/* Education */}
                <div className="section-item">
                  <div className="section-left">
                    <div
                      className={`section-icon ${
                        analysis.sectionsFound?.education ? "found" : "missing"
                      }`}
                    >
                      {analysis.sectionsFound?.education ? "✓" : "!"}
                    </div>
                    <div>
                      <h4>Education & Academic Credentials</h4>
                      <p>
                        Degree, university, GPA, or academic qualifications.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`section-status ${
                      analysis.sectionsFound?.education ? "found" : "missing"
                    }`}
                  >
                    {analysis.sectionsFound?.education ? "Detected" : "Missing"}
                  </span>
                </div>

                {/* Experience */}
                <div className="section-item">
                  <div className="section-left">
                    <div
                      className={`section-icon ${
                        analysis.sectionsFound?.experience ? "found" : "missing"
                      }`}
                    >
                      {analysis.sectionsFound?.experience ? "✓" : "!"}
                    </div>
                    <div>
                      <h4>Work Experience & Employment</h4>
                      <p>
                        {analysis.sectionsFound?.experience
                          ? "Past roles, internships, achievements, and impact."
                          : "No formal Work Experience or Internships detected in this resume."}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`section-status ${
                      analysis.sectionsFound?.experience ? "found" : "missing"
                    }`}
                  >
                    {analysis.sectionsFound?.experience ? "Detected" : "Not Found (Fresher)"}
                  </span>
                </div>

                {/* Projects */}
                <div className="section-item">
                  <div className="section-left">
                    <div
                      className={`section-icon ${
                        analysis.sectionsFound?.projects ? "found" : "missing"
                      }`}
                    >
                      {analysis.sectionsFound?.projects ? "✓" : "!"}
                    </div>
                    <div>
                      <h4>Projects & Portfolio</h4>
                      <p>
                        Hands-on software projects, repositories, and technical builds.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`section-status ${
                      analysis.sectionsFound?.projects ? "found" : "missing"
                    }`}
                  >
                    {analysis.sectionsFound?.projects ? "Detected" : "Missing"}
                  </span>
                </div>
              </div>

              {/* Fresher Profile Notice */}
              {hasNoExperience && (
                <div className="fresher-alert">
                  <span>💡</span>
                  <div>
                    <strong>Fresher Profile Detected:</strong> Your resume has no listed work experience.
                    For college students and recent graduates, this is completely normal!
                    Recruiters will evaluate your technical projects, hackathon achievements, and core programming skills.
                    Review the career path and suggestions below to stand out.
                  </div>
                </div>
              )}
            </div>

            {/* ================= CAREER PATH & LEARNING ROADMAP ================= */}
            {analysis.careerPath && (
              <div className="career-path-card">
                <div className="career-header">
                  <div>
                    <span className="role-badge">
                      🎯 Recommended Career Track
                    </span>
                    <h3 className="career-title">
                      {analysis.careerPath.primaryRole || "Software Engineer"}
                    </h3>
                    <p className="career-summary">
                      {analysis.careerPath.summary}
                    </p>
                  </div>
                  <div className="match-pill">
                    {analysis.careerPath.matchPercentage}% Profile Match
                  </div>
                </div>

                {/* Missing Skills to Target */}
                {analysis.careerPath.missingSkills?.length > 0 && (
                  <div className="missing-skills-section">
                    <h4>Recommended Skills to Learn Next</h4>
                    <div className="missing-skills-tags">
                      {analysis.careerPath.missingSkills.map((s, idx) => (
                        <span key={idx} className="missing-tag">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4-Step Milestone Roadmap */}
                {analysis.careerPath.roadmap?.length > 0 && (
                  <div>
                    <h4 style={{ margin: "16px 0 10px", color: "#193d2a", fontSize: "15px", fontWeight: 750 }}>
                      Actionable Career Roadmap
                    </h4>
                    <div className="roadmap-timeline">
                      {analysis.careerPath.roadmap.map((step, idx) => (
                        <div key={idx} className="roadmap-card">
                          <div className="roadmap-step-num">{step.step || idx + 1}</div>
                          <div className="roadmap-step-content">
                            <h5>{step.title}</h5>
                            <p>{step.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Panel 3: AI Recommendations & Tips */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="result-panel">
                <div className="panel-heading">
                  <div>
                    <h3>AI Suggestions & Improvement Tips</h3>
                    <p>
                      Actionable guidance calculated by AI to optimize your resume for recruiters and ATS filters.
                    </p>
                  </div>
                </div>

                <ul className="recommendations-list">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="recommendation-item">
                      <span className="rec-bullet">⚡</span>
                      <span>{formatText(rec)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feature 2: Expandable Learning Resources Inside Each Missing Skill */}
            {missingSkills && missingSkills.length > 0 && (
              <MissingSkillsAccordion
                skills={missingSkills}
                title="Skills You Are Missing"
                subtitle="Click on any missing skill below to access verified GeeksforGeeks articles and YouTube video tutorials."
              />
            )}
          </section>
        )}
      </main>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default ResumeAnalyzer;
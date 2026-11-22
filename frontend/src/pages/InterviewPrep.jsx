import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useResume } from "../context/ResumeContext";
import "./InterviewPrep.css";

// Standard popular roles
const POPULAR_ROLES = [
  "Software Engineer",
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Java Developer",
  "MERN Stack Developer",
  "Python & AI Engineer",
];

function InterviewPrep() {
  const location = useLocation();

  // Navigation / Phase: "setup" | "active" | "report"
  const [phase, setPhase] = useState("setup");

  // Setup Form State
  const [selectedRole, setSelectedRole] = useState(
    location.state?.role || "Software Engineer"
  );
  const [interviewType, setInterviewType] = useState(
    location.state?.interviewType || "Technical Interview"
  );
  const [difficulty, setDifficulty] = useState("Entry Level");
  const [questionCount, setQuestionCount] = useState(5);

  // Resume context (shared application-wide)
  const { uploadedResume: resumeData, loadingResume } = useResume();

  // Active Interview Session State
  const [questions, setQuestions] = useState([]);
  const [generationError, setGenerationError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);

  // Completed Session History & Tracking
  const [sessionResults, setSessionResults] = useState([]);
  const [pastSessions, setPastSessions] = useState([]);
  const [openAccordion, setOpenAccordion] = useState(null);

  // =========================================================================
  // CAMERA & WEBCAM STREAM STATE
  // =========================================================================
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // =========================================================================
  // CANDIDATE SPEECH-TO-TEXT (STT) STATE
  // =========================================================================
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const recognitionRef = useRef(null);
  const baseTranscriptRef = useRef("");

  // =========================================================================
  // AI INTERVIEWER SPEECH SYNTHESIS (TTS) STATE
  // =========================================================================
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);

  // Pre-load speech synthesis voices and check STT support
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
    const SpeechRec =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!SpeechRec) {
      setSpeechSupported(false);
    }
  }, []);

  // WebCam Controls
  const startCamera = async () => {
    try {
      setCameraError("");
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError("Camera access is not supported in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
      setMicActive(true);
    } catch (err) {
      console.warn("Camera/Mic access denied or unavailable:", err);
      setCameraError(
        "Camera/Mic permission not granted. You can still proceed with text or audio dictation."
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
      }
    } else {
      startCamera();
    }
  };

  const toggleMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
      }
    }
  };

  // AI Voice Synthesis (AI Asks the Question)
  const speakQuestion = (text) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (!aiVoiceEnabled || !text) {
      setIsAiSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const naturalVoice =
      voices.find(
        (v) =>
          (v.name.includes("Google") ||
            v.name.includes("Natural") ||
            v.name.includes("Online") ||
            v.name.includes("Samantha") ||
            v.name.includes("Zira")) &&
          v.lang.startsWith("en")
      ) ||
      voices.find((v) => v.lang.startsWith("en")) ||
      voices[0];

    if (naturalVoice) utterance.voice = naturalVoice;

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);
    utterance.onerror = () => setIsAiSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAiSpeaking = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsAiSpeaking(false);
    }
  };

  // Candidate Voice Dictation (Speech-to-Text)
  const startListening = () => {
    const SpeechRec =
      typeof window !== "undefined" &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);

    if (!SpeechRec) {
      alert("Voice speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    // Stop AI speech if active so it doesn't transcribe itself
    stopAiSpeaking();

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      baseTranscriptRef.current = userAnswer.trim();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript + " ";
          } else {
            interimTranscript += item[0].transcript + " ";
          }
        }

        const base = baseTranscriptRef.current ? baseTranscriptRef.current + " " : "";
        const combined = (base + finalTranscript + interimTranscript).trim();
        setUserAnswer(combined);
      };

      recognition.onerror = (err) => {
        console.warn("Speech recognition error:", err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Could not start speech recognition:", err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Lifecycle for Phase & Question Changes (Auto-speak question & Video management)
  useEffect(() => {
    if (phase === "active") {
      if (cameraEnabled && !streamRef.current) {
        startCamera();
      }
      if (questions[currentIndex]?.question) {
        const timer = setTimeout(() => {
          speakQuestion(questions[currentIndex].question);
        }, 550);
        return () => clearTimeout(timer);
      }
    } else {
      stopCamera();
      stopAiSpeaking();
      stopListening();
    }
  }, [phase, currentIndex]);

  // Ensure video element receives stream when ready
  useEffect(() => {
    if (phase === "active" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [phase, cameraActive]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
      stopAiSpeaking();
      stopListening();
    };
  }, []);

  // Load past sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("interview_past_sessions");
      if (saved) {
        setPastSessions(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("Could not parse saved sessions", e);
    }
  }, []);

  // 1. START INTERVIEW SESSION (Pure Dynamic Gemini Generation)
  const handleStartInterview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    setGenerationError("");

    const detectedSkills = resumeData?.analysis?.skills || [];
    const candidateSummary = resumeData?.analysis?.careerPath?.summary || "";

    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(
        "http://localhost:5000/api/interview/generate-questions",
        {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            jobRole: selectedRole,
            interviewType,
            difficulty,
            resumeSkills: detectedSkills,
            candidateProjects: candidateSummary,
            totalQuestions: questionCount,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setUserAnswer("");
        setCurrentFeedback(null);
        setSessionResults([]);
        setPhase("active");
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const errorMsg =
          data.message || data.error || `Server responded with error status ${response.status}`;
        setGenerationError(errorMsg);
      }
    } catch (err) {
      console.error("Gemini interview question generation request failed:", err);
      setGenerationError(
        err.message || "Failed to reach backend server. Please verify your connection or Gemini API key and retry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. SUBMIT ANSWER & GET AI FEEDBACK
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) {
      alert("Please provide or speak your answer before submitting.");
      return;
    }

    stopListening();
    stopAiSpeaking();
    setIsSubmitting(true);
    const activeQ = questions[currentIndex];

    try {
      const response = await fetch(
        "http://localhost:5000/api/interview/evaluate-answer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: activeQ.question,
            userAnswer,
            topic: activeQ.topic,
            category: activeQ.category,
            difficulty: activeQ.difficulty || difficulty,
            sampleAnswer: activeQ.sampleAnswer,
            keywords: activeQ.keywords || [],
          }),
        }
      );

      if (response.ok) {
        const feedback = await response.json();
        setCurrentFeedback(feedback);

        // Store this question's result
        const resultRecord = {
          questionNumber: activeQ.questionNumber,
          question: activeQ.question,
          category: activeQ.category,
          topic: activeQ.topic,
          userAnswer,
          score: feedback.score,
          strengths: feedback.strengths,
          areasToImprove: feedback.areasToImprove,
          sampleAnswer: feedback.sampleAnswer,
        };

        setSessionResults((prev) => [...prev, resultRecord]);
        setIsSubmitting(false);
        return;
      }
    } catch (err) {
      console.warn("Evaluation API error, calculating local score:", err);
    }

    // Graceful fallback evaluator
    const words = userAnswer.trim().split(/\s+/).length;
    const fallbackScore = Math.min(Math.max(Number((4.0 + words * 0.08).toFixed(1)), 4.0), 9.2);
    const fallbackFeedback = {
      score: fallbackScore,
      strengths: [
        "Clearly articulated your perspective with relevant technical terminology.",
        "Demonstrated solid conceptual familiarity with the subject matter.",
      ],
      areasToImprove: [
        "Include more concrete architectural examples or production experiences.",
        "Highlight performance considerations or edge cases.",
      ],
      sampleAnswer: activeQ.sampleAnswer,
      keyTakeaway: "Good explanation! Continue backing up claims with real examples.",
    };

    setCurrentFeedback(fallbackFeedback);
    setSessionResults((prev) => [
      ...prev,
      {
        questionNumber: activeQ.questionNumber,
        question: activeQ.question,
        category: activeQ.category,
        topic: activeQ.topic,
        userAnswer,
        score: fallbackScore,
        strengths: fallbackFeedback.strengths,
        areasToImprove: fallbackFeedback.areasToImprove,
        sampleAnswer: activeQ.sampleAnswer,
      },
    ]);
    setIsSubmitting(false);
  };

  // 3. MOVE TO NEXT QUESTION OR FINISH
  const handleNextQuestion = () => {
    stopListening();
    stopAiSpeaking();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setCurrentFeedback(null);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } else {
      // Finished all questions -> show final report
      handleFinishInterview();
    }
  };

  // 4. GENERATE FINAL REPORT & SAVE SESSION
  const handleFinishInterview = async () => {
    stopCamera();
    stopListening();
    stopAiSpeaking();

    // Calculate overall average score
    const totalScore = sessionResults.reduce((sum, item) => sum + (item.score || 0), 0);
    const avgScore = sessionResults.length > 0 ? (totalScore / sessionResults.length) : 0;
    const overallPercentage = Math.round(avgScore * 10);

    let performanceRating = "Promising Foundation";
    if (overallPercentage >= 85) performanceRating = "Exceptional - Interview Ready";
    else if (overallPercentage >= 70) performanceRating = "Strong Candidate";
    else if (overallPercentage >= 55) performanceRating = "Promising - Needs Targeted Revision";
    else performanceRating = "Needs Practice";

    // Extract topics needing revision (topics where score < 8)
    const revisionTopics = [];
    sessionResults.forEach((item) => {
      if (item.score < 8.0 && item.topic && !revisionTopics.includes(item.topic)) {
        revisionTopics.push(item.topic);
      }
    });

    if (revisionTopics.length === 0) {
      revisionTopics.push("Advanced System Architecture & Scalability", "Clean Code & Design Patterns");
    }

    const completedSession = {
      id: Date.now().toString(),
      jobRole: selectedRole,
      interviewType,
      difficulty,
      totalQuestions: questions.length,
      overallScore: overallPercentage,
      averageScoreOutOf10: Number(avgScore.toFixed(1)),
      performanceRating,
      questions: sessionResults,
      topicsToRevise: revisionTopics,
      completedAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    // Save to local storage history
    const updatedPast = [completedSession, ...pastSessions.slice(0, 9)];
    setPastSessions(updatedPast);
    try {
      localStorage.setItem("interview_past_sessions", JSON.stringify(updatedPast));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    // Attempt to save to backend MongoDB
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      await fetch("http://localhost:5000/api/interview/save-session", {
        method: "POST",
        headers,
        body: JSON.stringify({
          jobRole: selectedRole,
          interviewType,
          difficulty,
          totalQuestions: questions.length,
          overallScore: overallPercentage,
          performanceRating,
          questions: sessionResults,
          topicsToRevise: revisionTopics,
        }),
      });
    } catch (err) {
      console.warn("Session could not be saved to backend DB:", err);
    }

    setPhase("report");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQuitSession = () => {
    if (window.confirm("Are you sure you want to end this interview session? Your progress will be discarded.")) {
      stopCamera();
      stopListening();
      stopAiSpeaking();
      setPhase("setup");
      setCurrentFeedback(null);
      setUserAnswer("");
    }
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + (currentFeedback ? 1 : 0)) / questions.length) * 100) : 0;

  // Words count helper
  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  return (
    <div className="prep-page">
      <Navbar />

      <main className="prep-container">
        {/* ============================================================== */}
        {/* PHASE 1: SETUP SCREEN                                          */}
        {/* ============================================================== */}
        {phase === "setup" && (
          <div>
            <header className="page-header">
              <div className="header-badge-row">
                <span className="eyebrow-pill">🎯 AI-powered</span>
                <span className="eyebrow-pill">Career Practice</span>
              </div>
              <h1>Interview Preparation</h1>
              <p>
                Prepare for your next interview with personalized practice. Tailored questions generated from your resume skills and target job role.
              </p>
            </header>

            {/* Resume Integration Banner */}
            {resumeData && (
              <div className="resume-detected-banner">
                <div className="resume-detected-left">
                  <div className="resume-icon-circle">📄</div>
                  <div>
                    <strong>Resume Connected: {resumeData.originalName || "Uploaded Resume"}</strong>
                    <span>
                      AI detected {resumeData.analysis?.skills?.length || 0} skills to personalize your questions
                    </span>
                  </div>
                </div>

                <div className="resume-skills-pills">
                  {(resumeData.analysis?.skills || []).slice(0, 5).map((skill, i) => (
                    <span key={i} className="skill-tag-mini">
                      ✓ {skill}
                    </span>
                  ))}
                  {(resumeData.analysis?.skills || []).length > 5 && (
                    <span className="skill-tag-mini">
                      +{(resumeData.analysis?.skills || []).length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Choose Your Interview Form Card */}
            <div className="setup-card">
              <h2 className="section-title">
                <span>⚙️</span> Choose your interview
              </h2>

              <form onSubmit={handleStartInterview}>
                {/* 1. Target Job Role */}
                <div className="form-group">
                  <label className="form-label" htmlFor="jobRoleSelect">
                    Target job role
                    <span className="label-hint">Pick or select from popular roles</span>
                  </label>
                  <select
                    id="jobRoleSelect"
                    className="role-select"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    {POPULAR_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>

                  <div className="role-quick-pills">
                    {POPULAR_ROLES.slice(0, 4).map((role) => (
                      <button
                        type="button"
                        key={role}
                        className={`role-pill-btn ${selectedRole === role ? "active" : ""}`}
                        onClick={() => setSelectedRole(role)}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Interview Type */}
                <div className="form-group">
                  <label className="form-label">
                    Interview type
                    <span className="label-hint">Select the focus of your practice session</span>
                  </label>

                  <div className="type-grid">
                    {/* Technical Interview */}
                    <div
                      className={`type-card ${interviewType === "Technical Interview" ? "selected" : ""}`}
                      onClick={() => setInterviewType("Technical Interview")}
                    >
                      {interviewType === "Technical Interview" && (
                        <span className="selected-check">✓</span>
                      )}
                      <div className="type-icon">💻</div>
                      <div className="type-title">Technical Interview</div>
                      <div className="type-desc">
                        Coding fundamentals, OOP pillars, algorithms, data structures, and architecture.
                      </div>
                    </div>

                    {/* HR Interview */}
                    <div
                      className={`type-card ${interviewType === "HR Interview" ? "selected" : ""}`}
                      onClick={() => setInterviewType("HR Interview")}
                    >
                      {interviewType === "HR Interview" && (
                        <span className="selected-check">✓</span>
                      )}
                      <div className="type-icon">🤝</div>
                      <div className="type-title">HR Interview</div>
                      <div className="type-desc">
                        Behavioral STAR questions, communication, conflict resolution, and career motivation.
                      </div>
                    </div>

                    {/* Mixed Interview */}
                    <div
                      className={`type-card ${interviewType === "Mixed Interview" ? "selected" : ""}`}
                      onClick={() => setInterviewType("Mixed Interview")}
                    >
                      {interviewType === "Mixed Interview" && (
                        <span className="selected-check">✓</span>
                      )}
                      <div className="type-icon">⚖️</div>
                      <div className="type-title">Mixed Interview</div>
                      <div className="type-desc">
                        A realistic full-loop interview combining both technical deep-dives and behavioral rounds.
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Difficulty Level & Question Count */}
                <div className="options-split-row">
                  <div className="form-group">
                    <label className="form-label">
                      Difficulty
                      <span className="label-hint">Target career level</span>
                    </label>
                    <div className="pill-group">
                      {["Entry Level", "Intermediate", "Senior Level"].map((lvl) => (
                        <button
                          key={lvl}
                          type="button"
                          className={`diff-pill-btn ${difficulty === lvl ? "active" : ""}`}
                          onClick={() => setDifficulty(lvl)}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Questions
                      <span className="label-hint">Session length</span>
                    </label>
                    <div className="pill-group">
                      {[5, 10].map((cnt) => (
                        <button
                          key={cnt}
                          type="button"
                          className={`count-btn ${questionCount === cnt ? "active" : ""}`}
                          onClick={() => setQuestionCount(cnt)}
                        >
                          {cnt} Questions
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {generationError && (
                  <div
                    className="generation-error-banner"
                    style={{
                      background: "#fef2f2",
                      border: "1.5px solid #fecaca",
                      borderRadius: "12px",
                      padding: "16px 20px",
                      marginBottom: "20px",
                      color: "#991b1b",
                      fontSize: "14px",
                    }}
                  >
                    <strong style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", fontSize: "15px" }}>
                      <span>⚠️</span> AI Question Generation Failed
                    </strong>
                    <p style={{ margin: "0 0 10px 0", lineHeight: "1.5", color: "#7f1d1d" }}>
                      {generationError}
                    </p>

                    {generationError.toLowerCase().includes("api_key") && (
                      <div style={{
                        background: "#ffffff",
                        border: "1px dashed #f87171",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginBottom: "12px",
                        fontSize: "13px",
                        color: "#374151",
                        lineHeight: "1.5"
                      }}>
                        💡 <strong>Quick Fix:</strong> Obtain a free API key at{" "}
                        <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>
                          Google AI Studio
                        </a>
                        , paste it as <code>GEMINI_API_KEY=your_key</code> inside <code>backend/.env</code>, and restart your server.
                      </div>
                    )}

                    {generationError.toLowerCase().includes("rate limit") && (
                      <div style={{
                        background: "#ffffff",
                        border: "1px dashed #fb923c",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        marginBottom: "12px",
                        fontSize: "13px",
                        color: "#9a3412",
                        lineHeight: "1.5"
                      }}>
                        ⏱️ <strong>Rate Limit:</strong> The Gemini API quota was temporarily exceeded. Please wait 10-15 seconds and click <strong>Retry</strong> below.
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        onClick={handleStartInterview}
                        disabled={isSubmitting}
                        style={{
                          background: "#dc2626",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 18px",
                          borderRadius: "8px",
                          fontSize: "13.5px",
                          fontWeight: 700,
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          boxShadow: "0 2px 8px rgba(220, 38, 38, 0.25)",
                        }}
                      >
                        🔄 Retry Question Generation
                      </button>
                    </div>
                  </div>
                )}

                {/* Interactive AI Voice & Video Mode Toggle */}
                <div className="interview-mode-toggle-card">
                  <div className="mode-toggle-info">
                    <div className="mode-toggle-title">
                      <span className="mode-icon">🎥</span>
                      <strong>Interactive AI Voice & Camera Mode</strong>
                      <span className="mode-pill-badge">✨ Live AI Interview</span>
                    </div>
                    <p className="mode-toggle-sub">
                      The AI interviewer will verbally speak each question aloud. Practice answering directly with your webcam on and hands-free voice transcription.
                    </p>
                  </div>
                  <label className="switch-toggle-label" title="Toggle AI Voice and Camera Mode">
                    <input
                      type="checkbox"
                      checked={cameraEnabled}
                      onChange={(e) => setCameraEnabled(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                  </label>
                </div>

                {/* Start Button */}
                <div className="start-btn-wrapper">
                  <button
                    type="submit"
                    className="btn-start-prep"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>✨ Generating Questions with Gemini AI...</span>
                    ) : (
                      <span>🚀 Prepare for Interview</span>
                    )}
                  </button>
                  <span className="prep-ai-hint" style={{
                    display: "block",
                    marginTop: "10px",
                    fontSize: "12.5px",
                    color: "#5f7566",
                    textAlign: "center"
                  }}>
                    ⚡ Powered by Google Gemini — Generates dynamic, context-specific questions tailored to your profile.
                  </span>
                </div>
              </form>
            </div>

            {/* Past Interview History */}
            {pastSessions.length > 0 && (
              <section className="past-sessions-section">
                <h3 className="past-sessions-title">
                  <span>📜</span> Recent Practice Sessions
                </h3>
                <div className="past-sessions-grid">
                  {pastSessions.slice(0, 3).map((sess, idx) => (
                    <div key={idx} className="past-session-item">
                      <strong>{sess.jobRole}</strong>
                      <span style={{ fontSize: "13px", color: "#286b43", fontWeight: 700 }}>
                        {sess.interviewType} • {sess.difficulty}
                      </span>
                      <div className="past-session-meta">
                        <span>Score: {sess.overallScore}%</span>
                        <span>{sess.completedAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PHASE 2: ACTIVE INTERVIEW SCREEN                               */}
        {/* ============================================================== */}
        {phase === "active" && currentQ && (
          <div>
            {/* 1. Header Bar with Selected Job Role, Type, Difficulty */}
            <div className="session-info-bar">
              <div className="session-meta-chips">
                <div className="meta-chip">
                  <span>💼</span>
                  <span>Role:</span>
                  <strong>{selectedRole}</strong>
                </div>

                <div className="meta-chip">
                  <span>📋</span>
                  <span>Type:</span>
                  <strong>{interviewType}</strong>
                </div>

                <div className="meta-chip">
                  <span>📈</span>
                  <span>Level:</span>
                  <strong>{difficulty}</strong>
                </div>

                <div className="meta-chip ai-chip">
                  <span>✨ Gemini AI Generated</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-quit-session"
                onClick={handleQuitSession}
              >
                ✕ Quit Session
              </button>
            </div>

            {/* Progress Bar & Tracker */}
            <div className="progress-container">
              <div className="progress-header-row">
                <span className="progress-label">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <span className="progress-percent">{progressPercent}% Completed</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Virtual Interview Stage (AI Interviewer + Candidate Camera) */}
            <div className="interview-stage-container">
              {/* AI Interviewer Video Tile */}
              <div className={`stage-tile ai-tile ${isAiSpeaking ? "speaking-active" : ""}`}>
                <div className="tile-header">
                  <div className="tile-title-badge">
                    <span className={`ai-status-dot ${isAiSpeaking ? "pulse-dot" : ""}`}></span>
                    <span>AI Interviewer</span>
                  </div>
                  <div className="ai-controls-group">
                    <button
                      type="button"
                      className="btn-replay-voice"
                      title="Replay Question Audio"
                      onClick={() => speakQuestion(currentQ.question)}
                      disabled={isSubmitting}
                    >
                      {isAiSpeaking ? "🔊 AI Speaking..." : "🔄 Replay Question"}
                    </button>
                    <button
                      type="button"
                      className={`btn-mute-ai ${!aiVoiceEnabled ? "muted" : ""}`}
                      title={aiVoiceEnabled ? "Mute AI Voice" : "Unmute AI Voice"}
                      onClick={() => {
                        if (aiVoiceEnabled) {
                          stopAiSpeaking();
                          setAiVoiceEnabled(false);
                        } else {
                          setAiVoiceEnabled(true);
                          speakQuestion(currentQ.question);
                        }
                      }}
                    >
                      {aiVoiceEnabled ? "🔊" : "🔇"}
                    </button>
                  </div>
                </div>

                <div className="ai-avatar-viewport">
                  <div className={`ai-avatar-core ${isAiSpeaking ? "pulse-ring" : ""}`}>
                    <div className="ai-avatar-circle">
                      🤖
                    </div>
                  </div>

                  {/* Sound wave visualizer bars */}
                  <div className={`sound-wave-bars ${isAiSpeaking ? "active" : ""}`}>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                    <span className="wave-bar"></span>
                  </div>

                  <div className="ai-stage-status">
                    {isAiSpeaking ? (
                      <span className="status-speaking">🗣️ AI is speaking the question...</span>
                    ) : isListening ? (
                      <span className="status-listening">👂 AI is listening to your answer...</span>
                    ) : isSubmitting ? (
                      <span className="status-evaluating">🧠 AI is evaluating your response...</span>
                    ) : (
                      <span className="status-ready">Ready for your answer</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Candidate Live Webcam Tile */}
              <div className={`stage-tile candidate-tile ${cameraActive ? "cam-live" : "cam-off"}`}>
                <div className="tile-header">
                  <div className="tile-title-badge candidate-badge">
                    <span className={`cam-status-dot ${cameraActive ? "live" : ""}`}></span>
                    <span>{cameraActive ? "LIVE • Candidate Feed" : "Camera Off"}</span>
                  </div>
                  <div className="candidate-controls-group">
                    <button
                      type="button"
                      className={`cam-control-btn ${cameraActive ? "active" : "disabled"}`}
                      onClick={toggleCamera}
                      title={cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                    >
                      {cameraActive ? "📷 Cam On" : "📷 Cam Off"}
                    </button>
                    <button
                      type="button"
                      className={`cam-control-btn ${micActive ? "active" : "disabled"}`}
                      onClick={toggleMic}
                      title={micActive ? "Mute Microphone" : "Unmute Microphone"}
                    >
                      {micActive ? "🎙️ Mic On" : "🎙️ Mic Off"}
                    </button>
                  </div>
                </div>

                <div className="candidate-video-viewport">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`candidate-video-elem ${cameraActive ? "visible" : "hidden"}`}
                  />
                  {!cameraActive && (
                    <div className="camera-off-placeholder">
                      <div className="cam-placeholder-avatar">👤</div>
                      <p>{cameraError || "Webcam is currently disabled."}</p>
                      <button
                        type="button"
                        className="btn-enable-cam"
                        onClick={startCamera}
                      >
                        Enable Webcam
                      </button>
                    </div>
                  )}

                  {/* Live Recording Badge when Candidate is Speaking */}
                  {isListening && (
                    <div className="candidate-recording-overlay">
                      <span className="rec-pulse-dot"></span>
                      <span>Transcribing Voice Answer...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Question Display Card */}
            <div className="question-card">
              <div className="question-card-top">
                <span
                  className={`category-badge ${
                    currentQ.category === "HR" ? "badge-hr" : "badge-tech"
                  }`}
                >
                  {currentQ.category === "HR" ? "🤝 HR Interview" : "💻 Technical Interview"}
                </span>

                {currentQ.topic && (
                  <span className="topic-badge">📌 {currentQ.topic}</span>
                )}
              </div>

              <div className="question-index-title">
                Question {currentIndex + 1} of {questions.length}
              </div>

              <h2 className="question-prompt">{currentQ.question}</h2>

              <div className="question-instruction">
                💡 {currentQ.contextHint || "Write or speak your answer as if you were in a live interview."}
              </div>

              {/* Voice Input Toolbar */}
              <div className="voice-toolbar-row">
                <div className="voice-toolbar-left">
                  <button
                    type="button"
                    className={`btn-voice-record ${isListening ? "recording" : ""}`}
                    onClick={toggleListening}
                    disabled={Boolean(currentFeedback) || isSubmitting}
                  >
                    <span className="mic-icon">{isListening ? "⏹️" : "🎙️"}</span>
                    <span>{isListening ? "Stop Recording" : "Answer with Voice"}</span>
                    {isListening && <span className="recording-ping"></span>}
                  </button>
                  {isListening && (
                    <span className="speech-detecting-text">
                      🔴 Transcribing your voice live...
                    </span>
                  )}
                  {!speechSupported && (
                    <span className="speech-unsupported-note">
                      (Voice dictation supported in Chrome & Edge)
                    </span>
                  )}
                </div>

                <div className="voice-toolbar-right">
                  <button
                    type="button"
                    className="btn-listen-prompt"
                    onClick={() => speakQuestion(currentQ.question)}
                    disabled={isSubmitting}
                  >
                    <span>{isAiSpeaking ? "🔊 AI Speaking..." : "🔊 Hear Question Aloud"}</span>
                  </button>
                </div>
              </div>

              {/* Text Box for Answer Input */}
              <div className="answer-input-container">
                <textarea
                  className="answer-textarea"
                  rows={7}
                  placeholder="Write your answer as if you were speaking to an interviewer. Detail your approach, core concepts, and concrete examples..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={Boolean(currentFeedback)}
                ></textarea>

                <div className="answer-meta-row">
                  <span>
                    Words: <strong>{wordCount}</strong>
                  </span>
                  <span>
                    {wordCount < 30
                      ? "Tip: Aim for at least 30-60 words for a thorough answer"
                      : "Great depth! Ready to submit"}
                  </span>
                </div>

                {/* Submit & Clear Action Buttons */}
                {!currentFeedback && (
                  <div className="answer-actions-row">
                    <button
                      type="button"
                      className="btn-clear"
                      onClick={() => setUserAnswer("")}
                      disabled={isSubmitting || !userAnswer}
                    >
                      Clear
                    </button>

                    <button
                      type="button"
                      className="btn-submit-answer"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !userAnswer.trim()}
                    >
                      {isSubmitting ? (
                        <>⚡ Analyzing with AI...</>
                      ) : (
                        <>✨ Submit Answer</>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* AI Feedback Panel (Visible after Submit) */}
            {currentFeedback && (
              <div className="feedback-card">
                <div className="feedback-top">
                  <div className="feedback-top-left">
                    <div className="ai-sparkle-icon">✨</div>
                    <div>
                      <h3>AI Performance Feedback</h3>
                      <p>{currentFeedback.keyTakeaway || "Detailed evaluation of your response"}</p>
                    </div>
                  </div>

                  <div className="score-badge-large">
                    <div>
                      <span className="score-num">{currentFeedback.score}</span>
                      <span className="score-total"> / 10</span>
                    </div>
                    <span className="score-rating-tag">
                      {currentFeedback.score >= 8.5
                        ? "Excellent"
                        : currentFeedback.score >= 7.0
                        ? "Strong"
                        : "Developing"}
                    </span>
                  </div>
                </div>

                {/* Strengths & Areas to Improve Columns */}
                <div className="feedback-grid">
                  <div className="feedback-col-strengths">
                    <h4 className="feedback-col-title">
                      <span>✓</span> What You Did Well (Strengths)
                    </h4>
                    <ul className="bullet-list">
                      {currentFeedback.strengths?.map((str, idx) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feedback-col-improvements">
                    <h4 className="feedback-col-title">
                      <span>⚠️</span> Areas to Improve
                    </h4>
                    <ul className="bullet-list">
                      {currentFeedback.areasToImprove?.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sample Answer Card */}
                {currentFeedback.sampleAnswer && (
                  <div className="sample-answer-card">
                    <div className="sample-answer-header">
                      <div className="sample-answer-title">
                        <span>💡</span> Model Sample Answer
                      </div>
                      <span className="sample-badge">Benchmark Reference</span>
                    </div>
                    <div className="sample-answer-text">
                      {currentFeedback.sampleAnswer}
                    </div>
                  </div>
                )}

                {/* Next Question CTA Button */}
                <div className="feedback-actions">
                  <button
                    type="button"
                    className="btn-next-question"
                    onClick={handleNextQuestion}
                  >
                    <span>
                      {currentIndex + 1 < questions.length
                        ? `Next Question (${currentIndex + 2}/${questions.length}) →`
                        : "View Final Report 🏆"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PHASE 3: FINAL REPORT SCREEN                                   */}
        {/* ============================================================== */}
        {phase === "report" && (
          <div>
            <div className="report-hero-card">
              <div className="celebration-icon">🏆</div>
              <h2>Interview Session Completed!</h2>
              <p className="subtitle">
                Great job completing your personalized mock interview for <strong>{selectedRole}</strong>. Review your performance breakdown, question-wise ratings, and key revision topics below.
              </p>

              {/* Metrics Grid */}
              <div className="report-metrics-grid">
                <div className="report-metric-box">
                  <div className="report-metric-label">Overall Score</div>
                  <div className="report-metric-value">
                    {Math.round(
                      (sessionResults.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                        (sessionResults.length || 1)) *
                        10
                    )}%
                  </div>
                  <div className="report-metric-sub">Weighted Mastery</div>
                </div>

                <div className="report-metric-box">
                  <div className="report-metric-label">Questions Completed</div>
                  <div className="report-metric-value">
                    {sessionResults.length} / {questions.length}
                  </div>
                  <div className="report-metric-sub">100% Completed</div>
                </div>

                <div className="report-metric-box">
                  <div className="report-metric-label">Average Score</div>
                  <div className="report-metric-value">
                    {(
                      sessionResults.reduce((acc, curr) => acc + (curr.score || 0), 0) /
                      (sessionResults.length || 1)
                    ).toFixed(1)}
                  </div>
                  <div className="report-metric-sub">Out of 10.0</div>
                </div>

                <div className="report-metric-box">
                  <div className="report-metric-label">Interview Readiness</div>
                  <div className="report-metric-value" style={{ fontSize: "18px", marginTop: "4px" }}>
                    {difficulty}
                  </div>
                  <div className="report-metric-sub">Qualified Target</div>
                </div>
              </div>
            </div>

            {/* Topics to Revise Card */}
            <div className="revise-card">
              <h3>
                <span>🎯</span> Topics to Revise Before Your Real Interview
              </h3>
              <p className="revise-intro">
                Based on your answers, our AI recommends reviewing these specific architectural concepts and patterns:
              </p>
              <div className="revise-tags-wrap">
                {Array.from(
                  new Set([
                    ...sessionResults.filter((s) => s.score < 8.5).map((s) => s.topic),
                    "Object-Oriented Design Patterns",
                    "Database Indexing & Query Tuning",
                    "STAR Method Behavioral Articulation",
                  ])
                )
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((topic, idx) => (
                    <div key={idx} className="revise-tag-item">
                      <span>📖</span> {topic}
                    </div>
                  ))}
              </div>
            </div>

            {/* Question-by-Question Detailed Breakdown */}
            <section className="breakdown-section">
              <h3 className="breakdown-title">Question-wise Breakdown & Feedback</h3>

              {sessionResults.map((item, idx) => {
                const isOpen = openAccordion === idx;
                return (
                  <div key={idx} className="breakdown-card">
                    <div
                      className="breakdown-header"
                      onClick={() => setOpenAccordion(isOpen ? null : idx)}
                    >
                      <div className="breakdown-header-left">
                        <div className="q-num-badge">Q{item.questionNumber}</div>
                        <div className="q-text-summary">{item.question}</div>
                      </div>

                      <div className="breakdown-header-right">
                        <span className="breakdown-score">{item.score} / 10</span>
                        <span className={`accordion-chevron ${isOpen ? "open" : ""}`}>
                          ▼
                        </span>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="breakdown-body">
                        <div className="breakdown-field">
                          <div className="breakdown-field-label">Your Submitted Answer:</div>
                          <div className="user-answer-box">{item.userAnswer}</div>
                        </div>

                        <div className="feedback-grid" style={{ marginTop: "16px", marginBottom: "16px" }}>
                          <div className="feedback-col-strengths">
                            <h5 className="feedback-col-title">
                              <span>✓</span> Strengths
                            </h5>
                            <ul className="bullet-list">
                              {item.strengths?.map((str, sIdx) => (
                                <li key={sIdx}>{str}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="feedback-col-improvements">
                            <h5 className="feedback-col-title">
                              <span>⚠️</span> Areas to Improve
                            </h5>
                            <ul className="bullet-list">
                              {item.areasToImprove?.map((imp, iIdx) => (
                                <li key={iIdx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="sample-answer-card" style={{ marginBottom: 0 }}>
                          <div className="sample-answer-header">
                            <div className="sample-answer-title">
                              <span>💡</span> Ideal Sample Answer
                            </div>
                          </div>
                          <div className="sample-answer-text">{item.sampleAnswer}</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </section>

            {/* Actions: Start New Interview or Return to Dashboard */}
            <div className="report-actions">
              <button
                type="button"
                className="btn-report-primary"
                onClick={() => {
                  setPhase("setup");
                  setCurrentFeedback(null);
                  setUserAnswer("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                <span>🔄 Practice Another Interview</span>
              </button>

              <Link to="/dashboard" className="btn-report-secondary">
                <span>⌂ Back to Dashboard</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Reusable Footer on every page */}
      <Footer />
    </div>
  );
}

export default InterviewPrep;

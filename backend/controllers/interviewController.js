const InterviewSession = require("../models/InterviewSession");
const Resume = require("../models/Resume");
const jwt = require("jsonwebtoken");
const {
  generateInterviewQuestions,
  evaluateAnswerWithGemini,
} = require("../services/geminiService");

/**
 * Helper to safely extract userId from request headers, cookies, or middleware
 */
const getUserIdFromRequest = (req) => {
  if (req.userId) return req.userId;

  let token = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.userId || decoded.id || null;
  } catch (err) {
    return null;
  }
};

/** Dynamic AI-Powered Interview Question Generation Controller */
const generateQuestions = async (req, res) => {
  try {
    const {
      jobRole = "Software Engineer",
      interviewType = "Technical Interview",
      difficulty = "Entry Level",
      resumeSkills = [],
      totalQuestions = 5,
      candidateProjects = "",
    } = req.body || {};

    // 1. Sanitize & Normalize Job Role
    const sanitizedJobRole = typeof jobRole === "string" && jobRole.trim()
      ? jobRole.trim().slice(0, 100)
      : "Software Engineer";

    // 2. Sanitize & Normalize Interview Type
    let effectiveInterviewType = "Technical Interview";
    if (typeof interviewType === "string") {
      const lowerType = interviewType.toLowerCase();
      if (lowerType.includes("hr")) {
        effectiveInterviewType = "HR Interview";
      } else if (lowerType.includes("mix")) {
        effectiveInterviewType = "Mixed Interview";
      } else {
        effectiveInterviewType = "Technical Interview";
      }
    }

    // 3. Sanitize & Normalize Difficulty
    let effectiveDifficulty = "Entry Level";
    if (typeof difficulty === "string") {
      const lowerDiff = difficulty.toLowerCase();
      if (lowerDiff.includes("senior") || lowerDiff.includes("lead") || lowerDiff.includes("expert")) {
        effectiveDifficulty = "Senior Level";
      } else if (lowerDiff.includes("inter") || lowerDiff.includes("mid")) {
        effectiveDifficulty = "Intermediate";
      } else {
        effectiveDifficulty = "Entry Level";
      }
    }

    // 4. Validate and clamp question count between 3 and 10
    const count = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 3), 10);

    let effectiveSkills = [];
    let effectiveProjects ="";
    // 6. Enrich context from authenticated user's uploaded resume if available
    const userId = getUserIdFromRequest(req);
    if (userId) {
      try {
        const userResume = await Resume.findOne({ userId }).sort({ createdAt: -1, uploadedAt: -1 });
        if (userResume && userResume?.analysis) {
          if (Array.isArray(userResume.analysis.skills) && userResume.analysis.skills.length > 0) {
            effectiveSkills = userResume.analysis.skills.map((skill) => String(skill).trim()).filter(Boolean);
          }
          // if (userResume.analysis.careerPath?.summary) {
          //     effectiveProjects=userResume.analysis.careerPath.summary;
          // }
        }
      } catch (dbErr) {
        console.warn("Could not retrieve resume context from MongoDB:", dbErr.message);
      }
    }

    // 7. Call Gemini dynamically (NO static question banks or hardcoded arrays)
    const questions = await generateInterviewQuestions({
      jobRole: sanitizedJobRole,
      interviewType: effectiveInterviewType,
      difficulty: effectiveDifficulty,
      resumeSkills: effectiveSkills,
      // candidateProjects: effectiveProjects,
      totalQuestions: count,
    });

    console.log(
      `[Gemini AI] Successfully generated ${questions.length} questions for "${sanitizedJobRole}" (${effectiveInterviewType}, ${effectiveDifficulty})`
    );

    return res.status(200).json({
      success: true,
      source: "gemini",
      jobRole: sanitizedJobRole,
      interviewType: effectiveInterviewType,
      difficulty: effectiveDifficulty,
      resumeSkillsUsed: effectiveSkills,
      totalQuestions: questions.length,
      questions,
    });
  } catch (error) {
    console.error("[Gemini AI Error]", error.message);
    // Map error to proper HTTP status code
    let statusCode = 500;
    if (error.code === "MISSING_API_KEY" || error.status === 400) {
      statusCode = 400;
    } else if (error.status === 401 || error.status === 403) {
      statusCode = 401;
    } else if (error.status === 429) {
      statusCode = 429;
    } else if (error.status === 503) {
      statusCode = 503;
    }

    return res.status(statusCode).json({
      success: false,
      source: "gemini",
      message: error.message || "Failed to generate interview questions via Google Gemini API.",
      error: error.message,
      canRetry: true,
    });
  }
};

/** Intelligent AI Answer Evaluation Controller*/
const evaluateAnswer = async (req, res) => {
  try {
    const {
      question = "",
      userAnswer = "",
      topic = "General",
      category = "Technical",
      difficulty = "Entry Level",
      sampleAnswer = "",
      keywords = [],
    } = req.body || {};

    const trimmedAnswer = typeof userAnswer === "string" ? userAnswer.trim() : "";

    // Short answer safeguard
    if (!trimmedAnswer || trimmedAnswer.length < 5) {
      return res.status(200).json({
        success: true,
        score: 1.5,
        strengths: ["Attempted the question"],
        areasToImprove: [
          "Your answer is too brief. Provide a structured explanation detailing key concepts, syntax, and examples.",
          "Elaborate with real-world technical context as you would in a live interview.",
        ],
        sampleAnswer: sampleAnswer || "A complete, structured response is expected for this question.",
        keyTakeaway: "Aim for at least 3 to 4 detailed sentences explaining the core mechanics.",
      });
    }

    // Attempt AI evaluation via Gemini if API key is present
    try {
      const geminiEval = await evaluateAnswerWithGemini({
        question,
        userAnswer: trimmedAnswer,
        topic,
        category,
        difficulty,
        sampleAnswer,
        keywords,
      });

      if (geminiEval) {
        return res.status(200).json({
          success: true,
          score: geminiEval.score,
          strengths: geminiEval.strengths,
          areasToImprove: geminiEval.areasToImprove,
          sampleAnswer: sampleAnswer || "Review the model benchmark answer above.",
          keyTakeaway: geminiEval.keyTakeaway,
          source: "gemini",
        });
      }
    } catch (aiEvalErr) {
      console.warn("Gemini direct answer evaluation skipped, using heuristic:", aiEvalErr.message);
    }

    // Heuristic evaluation fallback
    const words = trimmedAnswer.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const lowerAnswer = trimmedAnswer.toLowerCase();

    // 1. Keyword coverage
    let matchedKeywords = [];
    if (Array.isArray(keywords) && keywords.length > 0) {
      matchedKeywords = keywords.filter((kw) => lowerAnswer.includes(String(kw).toLowerCase()));
    }
    const keywordRatio = keywords.length > 0 ? matchedKeywords.length / keywords.length : 0.5;

    // 2. Dynamic Score
    let baseScore = 4.0;
    if (wordCount >= 20 && wordCount < 40) baseScore += 1.5;
    else if (wordCount >= 40 && wordCount < 80) baseScore += 2.5;
    else if (wordCount >= 80) baseScore += 3.2;

    baseScore += keywordRatio * 2.8;

    if (trimmedAnswer.includes("1.") || trimmedAnswer.includes("•") || trimmedAnswer.includes("-") || trimmedAnswer.includes("\n")) {
      baseScore += 0.5;
    }

    const finalScore = Math.min(Math.max(parseFloat(baseScore.toFixed(1)), 2.5), 9.6);

    // 3. Strengths
    const strengths = [];
    if (matchedKeywords.length >= 2) {
      strengths.push(`Clearly identified core concepts: ${matchedKeywords.slice(0, 3).join(", ")}.`);
    } else {
      strengths.push("Addressed the core interview question directly with confidence.");
    }

    if (wordCount >= 45) {
      strengths.push("Provided a well-developed, detailed explanation demonstrating conceptual understanding.");
    } else {
      strengths.push("Gave a concise and focused initial response.");
    }

    if (/for example|such as|like|specifically/i.test(trimmedAnswer)) {
      strengths.push("Included concrete illustrative context or examples to substantiate the explanation.");
    } else {
      strengths.push("Used clear, professional language appropriate for a technical interview.");
    }

    // 4. Areas to Improve
    const areasToImprove = [];
    const missingKeywords = (Array.isArray(keywords) ? keywords : []).filter(
      (kw) => !lowerAnswer.includes(String(kw).toLowerCase())
    );

    if (missingKeywords.length > 0 && missingKeywords.length <= 4) {
      areasToImprove.push(
        `Mention relevant industry terms such as "${missingKeywords.slice(0, 2).join('" and "')}" to demonstrate deeper technical depth.`
      );
    }

    if (wordCount < 40) {
      areasToImprove.push(
        "Expand on the 'why' and 'how' behind your answer rather than just the 'what'. Share how you apply this in actual code."
      );
    } else {
      areasToImprove.push(
        "To stand out to senior engineering interviewers, briefly mention performance trade-offs or edge cases."
      );
    }

    return res.status(200).json({
      success: true,
      score: finalScore,
      strengths: strengths.slice(0, 3),
      areasToImprove: areasToImprove.slice(0, 2),
      sampleAnswer: sampleAnswer || "Review the standard best practice response above.",
      keyTakeaway:
        finalScore >= 8.0
          ? "Excellent articulation! You communicate ideas clearly and accurately."
          : "Good start! Reinforce your explanation with more architectural details and examples.",
    });
  } catch (error) {
    console.error("Error evaluating answer:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to evaluate answer",
      error: error.message,
    });
  }
};

/* Save Completed Interview Session */
const saveSession = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const {
      jobRole,
      interviewType,
      difficulty,
      totalQuestions,
      overallScore,
      performanceRating,
      questions,
      topicsToRevise,
      feedbackSummary,
    } = req.body || {};

    const newSession = new InterviewSession({
      userId: userId || null,
      jobRole: jobRole || "Software Engineer",
      interviewType: interviewType || "Technical Interview",
      difficulty: difficulty || "Entry Level",
      totalQuestions: totalQuestions || (Array.isArray(questions) ? questions.length : 5),
      overallScore: overallScore || 0,
      performanceRating: performanceRating || "Promising",
      questions: Array.isArray(questions) ? questions : [],
      topicsToRevise: Array.isArray(topicsToRevise) ? topicsToRevise : [],
      feedbackSummary: feedbackSummary || "",
      completedAt: new Date(),
    });

    await newSession.save();

    return res.status(201).json({
      success: true,
      message: "Interview session saved successfully",
      sessionId: newSession._id,
      session: newSession,
    });
  } catch (error) {
    console.error("Error saving interview session:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save interview session",
      error: error.message,
    });
  }
};

/** Get Interview History */
const getHistory = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    const filter = userId ? { userId } : {};

    const history = await InterviewSession.find(filter)
      .sort({ createdAt: -1 })
      .limit(10)
      .select("-__v");

    return res.status(200).json({
      success: true,
      history,
    });
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
      error: error.message,
    });
  }
};

module.exports = {
  generateQuestions,
  evaluateAnswer,
  saveSession,
  getHistory,
};

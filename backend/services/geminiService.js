const { GoogleGenAI } = require("@google/genai");

// Helper to safely extract JSON string even if wrapped in markdown code blocks or surrounding text
function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let text = rawText.trim();
  // Strip markdown code fences like ```json ... ``` or ``` ... ```
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "");
    text = text.replace(/\s*```$/i, "");
    text = text.trim();
  }
  // Find the outermost JSON array or object
  const firstBracket = text.search(/[{\[]/);
  const lastBracket = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    text = text.substring(firstBracket, lastBracket + 1);
  }
  return text;
}

/**
 * Calls Gemini using the official Google Gen AI SDK (@google/genai)
 * Retries transient errors (503 / overloaded / network) with exponential backoff.
 */
function isTransientError(err) {
  const msg = String((err && err.message) || "");
  return (
    err?.status === 503 ||
    err?.status === 500 ||
    err?.status === 504 ||
    /\b(503|500|504)\b|overloaded|high demand|UNAVAILABLE|fetch failed|ECONNRESET|ETIMEDOUT/i.test(msg)
  );
}

async function callGoogleGenAI({ apiKey, modelName, prompt }) {
  const ai = new GoogleGenAI({ apiKey });
  const maxRetries = 3;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature: 0.7,
          responseMimeType: "application/json",
        },
      });
      return response.text ? response.text.trim() : "";
    } catch (err) {
      if (!isTransientError(err) || attempt === maxRetries) throw err;
      const delay = 1500 * 2 ** attempt + Math.floor(Math.random() * 500); // ~1.5s, 3s, 6s
      console.warn(
        `[Gemini AI] ${modelName} transient error (status ${err.status}): ${String(err.message).slice(0, 200)}. Retry ${attempt + 1}/${maxRetries} in ${delay}ms...`
      );
      await new Promise((r) => setTimeout(r, delay));
    }
  }
}

/**
 * Generate dynamic interview questions using the official Google Gen AI SDK
 * 
 * @param {Object} options
 * @param {string} options.jobRole - Target position (e.g., "Full Stack Developer", "Software Engineer")
 * @param {string} options.interviewType - "Technical Interview" | "HR Interview" | "Mixed Interview"
 * @param {string} options.difficulty - "Entry Level" | "Intermediate" | "Senior Level"
 * @param {string[]} options.resumeSkills - Extracted skills from candidate's resume
 * @param {string} options.candidateProjects - Context from candidate's resume projects or experience
 * @param {number} options.totalQuestions - Number of questions requested (3 to 10)
 * @returns {Promise<Array>} Array of structured question objects
 */
async function generateInterviewQuestions({
  jobRole = "Software Engineer",
  interviewType = "Technical Interview",
  difficulty = "Entry Level",
  resumeSkills = [],
  candidateProjects = "",
  totalQuestions = 5,
}) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  // Validate API key presence
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    const error = new Error(
      "GEMINI_API_KEY is not configured in backend/.env. Please add a valid Google Gemini API key from https://aistudio.google.com/ to enable dynamic interview question generation."
    );
    error.code = "MISSING_API_KEY";
    error.status = 400;
    throw error;
  }

  // Constrain question count between 3 and 10
  const count = Math.min(Math.max(parseInt(totalQuestions, 10) || 5, 3), 10);
  const candidateSkills = (Array.isArray(resumeSkills) ? resumeSkills : [])
    .filter(Boolean)
    .map((s) => String(s).trim())
    .slice(0, 15);

  // Model prioritization: configured model -> gemini-3.5-flash -> gemini-3.8-flash -> gemini-3.7-flash -> gemini-flash-latest
  const preferredModel = (process.env.GEMINI_MODEL || "").trim();
  const candidateModels = [
    preferredModel,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-latest",
  ].filter(Boolean);

  // Deduplicate candidate models
  const modelsToTry = [...new Set(candidateModels)];

  // Build specialized prompt tailored to candidate profile and interview criteria
  const prompt = `
You are an expert technical interviewer, senior engineering hiring manager, and talent assessment specialist.
Generate a fresh, original, personalized set of interview questions for an interview preparation session.

Candidate & Interview Parameters:
- Target Job Role: ${jobRole}
- Interview Type: ${interviewType} (Technical Interview, HR Interview, or Mixed Interview)
- Difficulty Level: ${difficulty} (Entry Level, Intermediate, or Senior Level)
- Candidate's Extracted Resume Skills: ${candidateSkills.length > 0 ? candidateSkills.join(", ") : "General Software Engineering"}
${candidateProjects ? `- Candidate Projects/Experience Summary: ${candidateProjects}` : ""}
- Exact Number of Questions to Generate: ${count}

Instructions by Interview Type:
1. Technical Interview:
   - Generate technical questions directly evaluating the candidate's actual resume skills (${candidateSkills.slice(0, 8).join(", ")}) and target job role (${jobRole}).
   - Tailor question depth strictly to "${difficulty}" level:
     * Entry Level: Fundamental mechanics, core syntax, component/function lifecycles, basic data structures, standard algorithms, common bugs, and debugging techniques.
     * Intermediate: Practical architecture, performance optimization, asynchronous patterns, edge cases, state management, API design, database querying, and error handling.
     * Senior Level: Distributed systems, microservices trade-offs, concurrency bottlenecks, high availability, database scaling/indexing, security, and architectural trade-offs.
   - Set "category" to "Technical".
   - Set "skill" to the specific technical skill being evaluated (e.g. "React", "Node.js", "Java", "SQL", "Python").

2. HR Interview:
   - Generate behavioral, situational, communication, teamwork, time management, and conflict-resolution questions using the STAR framework (Situation, Task, Action, Result).
   - Contextualize questions to real-world collaboration in a ${jobRole} environment.
   - Set "category" to "HR".
   - Set "skill" to "Behavioral & Cultural".

3. Mixed Interview:
   - Generate an appropriate combination: approximately 60% Technical questions evaluating candidate resume skills and 40% HR/behavioral questions.
   - Label each question appropriately with category "Technical" or "HR".

CRITICAL QUALITY RULES:
- NO DUPLICATE QUESTIONS: Every single question in this session MUST be distinct and evaluate a different concept or scenario.
- NO GENERIC OR TEXTBOOK TRIVIA: Ensure questions are practical, realistic, and reflective of modern technical hiring bars.
- For every question, provide:
  * "question": The clear, direct interview question.
  * "contextHint": Actionable guidance for the candidate on how to structure their response.
  * "sampleAnswer": A high-standard model benchmark answer showing how an ideal candidate would answer.
  * "keywords": An array of 3-6 essential keywords/terms that a strong response should contain.
  * "strengthsCriteria": An array of 2-3 specific points that indicate mastery.
  * "improvementSuggestions": An array of 2 constructive points if the candidate's answer is lacking depth.
- Output ONLY a valid JSON array of objects conforming to the schema below. No markdown backticks, no conversational filler.

Response JSON Schema:
[
  {
    "id": "gemini-q-1",
    "questionNumber": 1,
    "question": "Clear, direct interview question text",
    "category": "Technical",
    "skill": "React",
    "topic": "React Hooks & State Architecture",
    "difficulty": "${difficulty}",
    "contextHint": "Write your answer as if speaking directly to an interviewer. Detail...",
    "sampleAnswer": "Comprehensive, structured model answer explaining key concepts...",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "strengthsCriteria": ["Demonstrates understanding of...", "Mentions..."],
    "improvementSuggestions": ["Elaborate on real-world use cases", "Mention performance trade-offs"]
  }
]
`;
  let lastError = null;
  // Try candidate models in order
  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini AI] Attempting question generation with model: ${modelName}...`);
      const rawText = await callGoogleGenAI({ apiKey, modelName, prompt });
      if (!rawText) {
        throw new Error("Received empty response from Gemini API");
      }
      const cleanedJson = extractJsonFromText(rawText);
      let parsed = null;
      try {
        parsed = JSON.parse(cleanedJson);
      } catch (parseErr) {
        console.error("Gemini JSON parse failed on raw text:", rawText);
        throw new Error(`Failed to parse Gemini response as JSON: ${parseErr.message}`);
      }
      // Handle if Gemini wrapped in an object like { questions: [...] } or { data: [...] }
      let questionsArray = Array.isArray(parsed)
        ? parsed
        : parsed.questions || parsed.data || null;

      if (!Array.isArray(questionsArray) || questionsArray.length === 0) {
        throw new Error("Gemini response did not contain a valid array of questions.");
      }

      // Deduplicate and sanitize questions
      const seenQuestions = new Set();
      const sanitized = [];

      for (let i = 0; i < questionsArray.length; i++) {
        const q = questionsArray[i];
        if (!q || !q.question || typeof q.question !== "string") continue;

        const cleanQuestion = q.question.trim();
        if (cleanQuestion.length < 10) continue;

        // Normalized key for duplicate detection
        const normKey = cleanQuestion.toLowerCase().replace(/[^a-z0-9]/g, "");

        if (seenQuestions.has(normKey)) continue;
        seenQuestions.add(normKey);

        const isHR =
          q.category === "HR" ||
          (!q.skill && interviewType === "HR Interview") ||
          interviewType === "HR Interview";

        sanitized.push({
          questionNumber: sanitized.length + 1,
          id: q.id || `gemini-q-${sanitized.length + 1}-${Date.now().toString(36)}`,
          question: cleanQuestion,
          category: isHR ? "HR" : "Technical",
          skill: isHR
            ? "Behavioral & Cultural"
            : q.skill || candidateSkills[i % (candidateSkills.length || 1)] || "Core Concept",
          topic: q.topic || (isHR ? "Behavioral & Situational" : `${jobRole} Core Knowledge`),
          difficulty: q.difficulty || difficulty,
          contextHint:
            q.contextHint || "Write your answer as if you were speaking directly to a senior interviewer.",
          sampleAnswer:
            q.sampleAnswer ||
            "A structured response detailing the fundamental concept, implementation pattern, and real-world considerations.",
          keywords:
            Array.isArray(q.keywords) && q.keywords.length > 0
              ? q.keywords
              : ["concept", "implementation", "solution"],
          strengthsCriteria: Array.isArray(q.strengthsCriteria)
            ? q.strengthsCriteria
            : ["Addressed core question", "Clear structured explanation"],
          improvementSuggestions: Array.isArray(q.improvementSuggestions)
            ? q.improvementSuggestions
            : ["Include real-world examples", "Mention performance considerations"],
          source: "gemini",
        });

        if (sanitized.length >= count) break;
      }

      if (sanitized.length === 0) {
        throw new Error("No valid questions could be extracted from Gemini response.");
      }

      return sanitized;
    } catch (err) {
      lastError = err;
      const errMsg = err.message || "";

      // Re-throw authentication errors immediately
      if (
        errMsg.includes("API key not valid") ||
        errMsg.includes("API_KEY_INVALID") ||
        (err.status === 400 && errMsg.includes("API key")) ||
        err.status === 401 ||
        err.status === 403
      ) {
        const authErr = new Error(
          "Invalid or unauthorized Google Gemini API key. Please check your GEMINI_API_KEY in backend/.env."
        );
        authErr.status = 401;
        throw authErr;
      }

      // If it's model not found (404), log and try next model
      if (err.status === 404 || errMsg.includes("not found") || errMsg.includes("no longer available")) {
        console.warn(`[Gemini AI] Model ${modelName} not available (${errMsg}), trying next model in list...`);
        continue;
      }

      // If it's a 503 high demand or 429 rate limit on this model, log and try next model in candidateModels
      if (
        err.status === 503 ||
        err.status === 429 ||
        errMsg.includes("503") ||
        errMsg.includes("high demand") ||
        errMsg.includes("RESOURCE_EXHAUSTED") ||
        errMsg.includes("quota")
      ) {
        console.warn(`[Gemini AI] ${modelName} failed (status ${err.status}): ${errMsg.slice(0, 300)}. Trying next candidate model...`);
        continue;
      }

      console.warn(`[Gemini AI] Generation with ${modelName} failed (${err.message}), trying next model...`);
    }
  }

  // If all models failed, log the REAL reason and throw a descriptive error
  console.error("[Gemini AI] ALL MODELS FAILED. Last error:", {
    status: lastError?.status,
    message: lastError?.message,
  });

  const rawMsg = lastError?.message || "Service unavailable";
  const isQuota = lastError?.status === 429 || /quota|RESOURCE_EXHAUSTED|429/i.test(rawMsg);
  const isDemand = !isQuota && (lastError?.status === 503 || /503|high demand|overloaded|UNAVAILABLE/i.test(rawMsg));

  const finalError = new Error(
    isQuota
      ? `Gemini API quota exceeded for this key. Details: ${rawMsg.slice(0, 200)}`
      : isDemand
      ? `Gemini is temporarily overloaded. Please retry in a moment. Details: ${rawMsg.slice(0, 200)}`
      : `Failed to generate interview questions via Google Gemini API: ${rawMsg.slice(0, 250)}. Please click Retry.`
  );
  finalError.status = isQuota ? 429 : isDemand ? 503 : lastError?.status || 500;
  finalError.canRetry = true;
  throw finalError;
}

/**
 * Intelligent Answer Evaluation using Gemini (optional AI enrichment)
 */
async function evaluateAnswerWithGemini({
  question,
  userAnswer,
  topic = "General",
  category = "Technical",
  difficulty = "Entry Level",
  sampleAnswer = "",
  keywords = [],
}) {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "").trim();
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return null; // Signals controller to use heuristic scoring
  }

  const prompt = `
You are an expert technical interviewer evaluating a candidate's answer.
Question: "${question}"
Category: "${category}"
Topic: "${topic}"
Difficulty: "${difficulty}"
Reference Sample Answer: "${sampleAnswer}"
Target Keywords: ${JSON.stringify(keywords)}
Candidate's Answer:"${userAnswer}"
Evaluate the candidate's answer and return a JSON object with:
- "score": A floating-point number from 1.0 to 10.0 representing candidate answer quality.
- "strengths": An array of 2-3 specific things the candidate explained well.
- "areasToImprove": An array of 2 specific missing points, depth improvements, or trade-offs.
- "keyTakeaway": A 1-2 sentence summary of their response quality.

Return ONLY a valid JSON object matching the fields above.
`;

  const candidateModels = [
    process.env.GEMINI_MODEL,
    "gemini-3.8-flash",
    "gemini-3.7-flash",
  ].filter(Boolean);

  for (const modelName of [...new Set(candidateModels)]) {
    try {
      const rawText = await callGoogleGenAI({ apiKey, modelName, prompt });
      const cleaned = extractJsonFromText(rawText);
      const parsed = JSON.parse(cleaned);

      if (parsed && typeof parsed.score === "number") {
        return {
          score: Math.min(Math.max(parseFloat(parsed.score.toFixed(1)), 1.0), 10.0),
          strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 3) : [],
          areasToImprove: Array.isArray(parsed.areasToImprove) ? parsed.areasToImprove.slice(0, 2) : [],
          keyTakeaway: parsed.keyTakeaway || "Constructive evaluation of your response.",
        };
      }
    } catch (err) {
      console.warn(`[Gemini AI] Answer evaluation with ${modelName} skipped:`, err.message);
    }
  }

  return null;
}

module.exports = {
  generateInterviewQuestions,
  evaluateAnswerWithGemini,
};

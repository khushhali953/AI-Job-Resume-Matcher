const express = require("express");
const {
  generateQuestions,
  evaluateAnswer,
  saveSession,
  getHistory,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/generate-questions", generateQuestions);
router.post("/evaluate-answer", evaluateAnswer);
router.post("/save-session", saveSession);
router.get("/history", getHistory);

module.exports = router;

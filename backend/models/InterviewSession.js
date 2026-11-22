const mongoose = require("mongoose");

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    jobRole: {
      type: String,
      required: true,
      default: "Software Engineer",
    },
    interviewType: {
      type: String,
      required: true,
      enum: ["Technical Interview", "HR Interview", "Mixed Interview"],
      default: "Technical Interview",
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["Entry Level", "Intermediate", "Senior Level"],
      default: "Entry Level",
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 5,
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    performanceRating: {
      type: String,
      default: "Promising",
    },
    questions: [
      {
        questionNumber: { type: Number },
        question: { type: String, required: true },
        category: { type: String }, // "Technical", "HR"
        topic: { type: String },
        userAnswer: { type: String, default: "" },
        score: { type: Number, default: 0 },
        strengths: [{ type: String }],
        areasToImprove: [{ type: String }],
        sampleAnswer: { type: String },
        evaluatedAt: { type: Date, default: Date.now },
      },
    ],
    topicsToRevise: [{ type: String }],
    feedbackSummary: { type: String, default: "" },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InterviewSession", interviewSessionSchema);

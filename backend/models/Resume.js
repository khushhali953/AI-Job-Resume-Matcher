const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    cloudinaryPublicId: {
      type: String,
      required: true,
    },


    filePath: {
      type: String,
      required: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    // AI Analysis Subdocument
    analysis: {
      skills: {
        type: [String],
        default: [],
      },

      totalSkillsFound: {
        type: Number,
        default: 0,
      },

      sectionsFound: {
        education: {
          type: Boolean,
          default: false,
        },
        experience: {
          type: Boolean,
          default: false,
        },
        projects: {
          type: Boolean,
          default: false,
        },
      },

      score: {
        type: Number,
        default: 0,
      },

      recommendations: {
        type: [String],
        default: [],
      },

      careerPath: {
        primaryRole: { type: String, default: "" },
        matchPercentage: { type: Number, default: 0 },
        summary: { type: String, default: "" },
        missingSkills: { type: [String], default: [] },
        roadmap: [
          {
            step: { type: Number },
            title: { type: String },
            description: { type: String },
          },
        ],
      },

      analyzedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resume", resumeSchema);
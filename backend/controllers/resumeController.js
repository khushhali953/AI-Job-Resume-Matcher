const Resume = require("../models/Resume");
const axios = require("axios");
const FormData = require("form-data");
const jwt = require("jsonwebtoken");
const cloudinary = require("../config/cloudinary");
const { v4: uuidv4 } = require("uuid");


// Helper to safely extract userId from Authorization header or cookie
const getUserIdFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    return decoded.userId || decoded.id || null;
  } catch (err) {
    return null;
  }

};


const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a PDF resume",
      });
    }

    const userId = getUserIdFromRequest(req);

    // 1. Upload PDF from RAM to Cloudinary
    const cloudinaryResult = await new Promise(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            resource_type: "raw",
            folder: "resumes",
            public_id: `${uuidv4()}.pdf`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );

        stream.end(req.file.buffer);
      }
    );

    // 2. Default analysis result
    let analysisResult = {
      skills: [],
      totalSkillsFound: 0,
      sectionsFound: {
        education: false,
        experience: false,
        projects: false,
      },
      score: 0,
      recommendations: [],
      careerPath: null,
      analyzedAt: null,
    };

    // 3. Send PDF buffer to Python AI service
    try {
      const form = new FormData();

      form.append("file", req.file.buffer, {
        filename: req.file.originalname,
        contentType: "application/pdf",
      });

      const aiResponse = await axios.post(
        "http://127.0.0.1:8000/analyze-resume",
        form,
        {
          headers: form.getHeaders(),
          maxBodyLength: Infinity,
          timeout: 30000,
        }
      );

      if (aiResponse.data?.analysis) {
        const result = aiResponse.data.analysis;

        analysisResult = {
          skills: result.skills || [],
          totalSkillsFound: result.totalSkillsFound || 0,
          sectionsFound: result.sectionsFound || {
            education: false,
            experience: false,
            projects: false,
          },
          score: result.score || 0,
          recommendations: result.recommendations || [],
          careerPath: result.careerPath || null,
          analyzedAt: new Date(),
        };
      }
    } catch (aiErr) {
      console.warn(
        "AI analysis failed:",
        aiErr.message
      );
    }

    // 4. Save metadata and analysis in MongoDB
    const resume = await Resume.create({
      userId,
      originalName: req.file.originalname,
      filePath: cloudinaryResult.secure_url,
      cloudinaryPublicId: cloudinaryResult.public_id,
      uploadedAt: new Date(),
      analysis: analysisResult,
    });

    return res.status(201).json({
      message: "Resume uploaded to Cloudinary",
      resume: {
        _id: resume._id,
        originalName: resume.originalName,
        filePath: resume.filePath,
        cloudinaryPublicId: resume.cloudinaryPublicId,
        uploadedAt: resume.uploadedAt,
        analysis: resume.analysis,
        viewUrl:
          `http://localhost:5000/api/resumes/view/${resume._id}`,
      },
      analysis: resume.analysis,
    });
  } catch (error) {
    console.error("Resume upload error:", error);

    return res.status(500).json({
      message: "Resume upload failed",
      error: error.message,
    });
  }
};

// Analyze Resume — returns cached analysis or re-fetches from Cloudinary/storage
const analyzeResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await Resume.findById(id);
    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    // Reuse existing analysis if already saved in MongoDB unless forced
    if (
      !req.query.force &&
      resume.analysis &&
      Array.isArray(resume.analysis.skills) &&
      resume.analysis.skills.length > 0
    ) {
      return res.json({
        message: "Resume analysis retrieved from database",
        resumeId: resume._id,
        analysis: resume.analysis,
        filePath: resume.filePath,
        viewUrl: `http://localhost:5000/api/resumes/view/${resume._id}`,
      });
    }

    // Download PDF from Cloudinary into RAM
    const downloadResponse = await axios.get(
      resume.filePath,
      {
        responseType: "arraybuffer",
        timeout: 15000,
      }
    );
    const pdfBuffer = Buffer.from(downloadResponse.data);
    // Send PDF to Python AI service
    const form = new FormData();
    form.append("file", pdfBuffer, {
      filename: resume.originalName,
      contentType: "application/pdf",
    });
    const aiResponse = await axios.post(
      "http://127.0.0.1:8000/analyze-resume",
      form,
      {
        headers: form.getHeaders(),
        maxBodyLength: Infinity,
        timeout: 30000,
      }
    );
    const result = aiResponse.data.analysis;
    // Save analysis only, not the PDF
    resume.analysis = {
      skills: result.skills || [],
      totalSkillsFound: result.totalSkillsFound || 0,
      sectionsFound: result.sectionsFound || {
        education: false,
        experience: false,
        projects: false,
      },
      score: result.score || 0,
      recommendations: result.recommendations || [],
      careerPath: result.careerPath || null,
      analyzedAt: new Date(),
    };
    await resume.save();

    return res.json({
      message: "Resume analyzed successfully",
      resumeId: resume._id,
      analysis: resume.analysis,
      filePath: resume.filePath,
      viewUrl:
        `http://localhost:5000/api/resumes/view/${resume._id}`,
    });
  } catch (error) {
    console.error(
      "Resume analysis error:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Failed to analyze resume",
      error:
        error.response?.data?.detail || error.message,
    });
  }
};

// Stream/View PDF in browser
const viewResumePdf = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).send("Resume not found");
    }
    if (!resume.filePath) {
      return res.status(404).send("Resume file not found");
    }
    return res.redirect(resume.filePath);
  } catch (error) {
    return res.status(500).send(
      "Error loading resume PDF: " + error.message
    );
  }
};

// Get single resume details
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.id);
    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }
    return res.json({ resume });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get latest uploaded resume safely with strict user isolation
const getLatestResume = async (req, res) => {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return res.status(200).json({
        success: true,
        message: "No user authenticated or no resume found",
        resume: null,
        analysis: null,
      });
    }

    // Strictly fetch the latest resume belonging to the authenticated user
    const resume = await Resume.findOne({ userId }).sort({ createdAt: -1, uploadedAt: -1 });

    if (!resume) {
      return res.status(200).json({
        success: true,
        message: "No resume found for this user",
        resume: null,
        analysis: null,
      });
    }

    return res.status(200).json({
      success: true,
      resume: {
        _id: resume._id,
        originalName: resume.originalName,
        filePath: resume.filePath,
        cloudinaryPublicId: resume.cloudinaryPublicId,
        uploadedAt: resume.uploadedAt,
        analysis: resume.analysis,
        viewUrl: `http://localhost:5000/api/resumes/view/${resume._id}`,
      },
      analysis: resume.analysis,
    });
  } catch (error) {
    console.error("getLatestResume error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
  viewResumePdf,
  getResumeById,
  getLatestResume,
};

const express = require("express");
const multer = require("multer");
const path = require("path");

const {
  uploadResume,
  analyzeResume,
  viewResumePdf,
  getResumeById,
  getLatestResume,
} = require("../controllers/resumeController");

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" &&
      path.extname(file.originalname).toLowerCase() === ".pdf"
    ) {
      return cb(null, true);
    }
    cb(new Error("Only PDF files are allowed"));
  },
});

router.post("/upload", upload.single("resume"), uploadResume);
router.post("/analyze/:id", analyzeResume);
router.get("/latest", getLatestResume);
router.get("/view/:id", viewResumePdf);
router.get("/:id", getResumeById);

module.exports = router;
import express from "express";
import {
  getSubmissions,
  getSubmissionById,
  createSubmission,
  updateSubmission,
  gradeSubmission,
  deleteSubmission,
  getStudentSubmissions,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { teacherOrAdmin } from "../middleware/roleMiddleware.js";
import { upload } from "../services/fileService.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Setup upload middleware for submissions
const uploadSubmissionFiles = (req, res, next) => {
  req.uploadType = "submissions";
  next();
};

router.route("/")
  .get(protect, getSubmissions)
  .post(protect, uploadSubmissionFiles, upload.array("files", 5), auditLog("Submission"), createSubmission);

router.route("/:id")
  .get(protect, getSubmissionById)
  .put(protect, uploadSubmissionFiles, upload.array("files", 5), auditLog("Submission"), updateSubmission)
  .delete(protect, auditLog("Submission"), deleteSubmission);

router.put("/:id/grade", protect, teacherOrAdmin, auditLog("Submission"), gradeSubmission);
router.get("/student/:studentId", protect, getStudentSubmissions);

export default router;

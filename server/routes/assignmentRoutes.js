import express from "express";
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getAssignmentSubmissions,
  getAssignmentStats,
} from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin, teacherOrAdmin } from "../middleware/roleMiddleware.js";
import { upload } from "../services/fileService.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Setup upload middleware for assignments
const uploadAssignmentFiles = (req, res, next) => {
  req.uploadType = "assignments";
  next();
};

router.route("/")
  .get(protect, getAssignments)
  .post(protect, teacherOrAdmin, uploadAssignmentFiles, upload.array("files", 5), auditLog("Assignment"), createAssignment);

router.route("/:id")
  .get(protect, getAssignmentById)
  .put(protect, teacherOrAdmin, uploadAssignmentFiles, upload.array("files", 5), auditLog("Assignment"), updateAssignment)
  .delete(protect, teacherOrAdmin, auditLog("Assignment"), deleteAssignment);

router.get("/:id/submissions", protect, teacherOrAdmin, getAssignmentSubmissions);
router.get("/:id/stats", protect, teacherOrAdmin, getAssignmentStats);

export default router;

import express from "express";
import {
  getGrades,
  getGradeById,
  createGrade,
  updateGrade,
  deleteGrade,
  getStudentReport,
  getClassGradeStats,
} from "../controllers/gradeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getGrades)
  .post(protect, authorize("admin", "teacher"), auditLog("Grade"), createGrade);

router.get("/report/:studentId", protect, getStudentReport);
router.get("/class-stats/:classId", protect, authorize("admin", "teacher"), getClassGradeStats);

router
  .route("/:id")
  .get(protect, getGradeById)
  .put(protect, authorize("admin", "teacher"), auditLog("Grade"), updateGrade)
  .delete(protect, authorize("admin"), auditLog("Grade"), deleteGrade);

export default router;


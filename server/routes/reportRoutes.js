import express from "express";
import {
  exportStudents,
  exportAttendance,
  generateStudentReport,
  exportClassPerformance,
  getReportStats,
} from "../controllers/reportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { teacherOrAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/students", protect, teacherOrAdmin, exportStudents);
router.get("/attendance", protect, teacherOrAdmin, exportAttendance);
router.get("/student/:id", protect, generateStudentReport);
router.get("/class/:id/performance", protect, teacherOrAdmin, exportClassPerformance);
router.get("/stats", protect, teacherOrAdmin, getReportStats);

export default router;


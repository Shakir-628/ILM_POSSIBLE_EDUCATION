import express from "express";
import {
  getAttendanceTrends,
  getGradeDistribution,
  getClassPerformance,
  getEnrollmentTrends,
  getTeacherWorkload,
  getSubjectPerformance,
  getAttendanceByClass,
  getDashboardAnalytics,
} from "../controllers/analyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { teacherOrAdmin, admin } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, teacherOrAdmin, getDashboardAnalytics);
router.get("/attendance-trends", protect, teacherOrAdmin, getAttendanceTrends);
router.get("/grade-distribution", protect, teacherOrAdmin, getGradeDistribution);
router.get("/class-performance", protect, teacherOrAdmin, getClassPerformance);
router.get("/enrollment-trends", protect, admin, getEnrollmentTrends);
router.get("/teacher-workload", protect, admin, getTeacherWorkload);
router.get("/subject-performance", protect, teacherOrAdmin, getSubjectPerformance);
router.get("/attendance-by-class", protect, teacherOrAdmin, getAttendanceByClass);

export default router;


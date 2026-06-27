import express from "express";
import {
  getTeacherDashboardStats,
  getTeacherClasses,
  getTeacherTodaySchedule,
  getTeacherClassStudents,
  getTeacherPendingGrading
} from "../controllers/teacherPortalController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard-stats", protect, authorize("teacher"), getTeacherDashboardStats);
router.get("/my-classes", protect, authorize("teacher"), getTeacherClasses);
router.get("/today-schedule", protect, authorize("teacher"), getTeacherTodaySchedule);
router.get("/class/:classId/students", protect, authorize("teacher"), getTeacherClassStudents);
router.get("/pending-grading", protect, authorize("teacher"), getTeacherPendingGrading);

export default router;

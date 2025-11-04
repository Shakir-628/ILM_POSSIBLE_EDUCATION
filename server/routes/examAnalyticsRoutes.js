import express from "express";
import {
  getExamDashboard,
  getClassExamPerformance,
  getSubjectExamPerformance,
  getTopPerformers,
  getExamTrends,
  getGradeAnalyticsByClass,
} from "../controllers/examAnalyticsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin", "teacher"), getExamDashboard);
router.get("/class-performance", protect, authorize("admin", "teacher"), getClassExamPerformance);
router.get("/subject-performance", protect, authorize("admin", "teacher"), getSubjectExamPerformance);
router.get("/top-performers", protect, authorize("admin", "teacher"), getTopPerformers);
router.get("/trends", protect, authorize("admin", "teacher"), getExamTrends);
router.get("/grade-analytics/:classId", protect, authorize("admin", "teacher"), getGradeAnalyticsByClass);

export default router;


import express from "express";
import {
  getAllReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getTeacherStats,
} from "../controllers/performanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Stats route
router.get("/stats/:teacherId", protect, getTeacherStats);

router
  .route("/")
  .get(protect, authorize("admin"), getAllReviews)
  .post(protect, authorize("admin"), auditLog("PerformanceReview"), createReview);

router
  .route("/:id")
  .get(protect, getReviewById)
  .put(protect, authorize("admin"), auditLog("PerformanceReview"), updateReview)
  .delete(protect, authorize("admin"), auditLog("PerformanceReview"), deleteReview);

export default router;


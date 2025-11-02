import express from "express";
import {
  getAllExamSchedules,
  getExamScheduleById,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getExamSchedulesByClass,
} from "../controllers/examScheduleController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Get schedules by class
router.get("/class/:classId", protect, getExamSchedulesByClass);

router
  .route("/")
  .get(protect, getAllExamSchedules)
  .post(protect, authorize("admin"), auditLog("ExamSchedule"), createExamSchedule);

router
  .route("/:id")
  .get(protect, getExamScheduleById)
  .put(protect, authorize("admin"), auditLog("ExamSchedule"), updateExamSchedule)
  .delete(protect, authorize("admin"), auditLog("ExamSchedule"), deleteExamSchedule);

export default router;


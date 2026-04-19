import express from "express";
import {
  getTeacherAttendance,
  markTeacherAttendance,
  getTeacherAttendanceStats,
} from "../controllers/teacherAttendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, authorize("admin"), getTeacherAttendance)
  .post(protect, authorize("admin"), auditLog("TeacherAttendance"), markTeacherAttendance);

router.get("/stats/:teacherId", protect, getTeacherAttendanceStats);

export default router;

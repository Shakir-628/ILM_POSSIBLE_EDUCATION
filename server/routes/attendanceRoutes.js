import express from "express";
import {
  getAttendance,
  getAttendanceById,
  markAttendance,
  bulkMarkAttendance,
  updateAttendance,
  deleteAttendance,
  getAttendanceStats,
} from "../controllers/attendanceController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getAttendance)
  .post(protect, authorize("admin", "teacher"), auditLog("Attendance"), markAttendance);

router.post("/bulk", protect, authorize("admin", "teacher"), auditLog("Attendance"), bulkMarkAttendance);
router.get("/stats/:studentId", protect, getAttendanceStats);

router
  .route("/:id")
  .get(protect, getAttendanceById)
  .put(protect, authorize("admin", "teacher"), auditLog("Attendance"), updateAttendance)
  .delete(protect, authorize("admin"), auditLog("Attendance"), deleteAttendance);

export default router;


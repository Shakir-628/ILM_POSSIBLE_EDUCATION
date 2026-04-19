import express from "express";
import {
  getAllTimetables,
  getTimetableById,
  getTimetableByClass,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  checkConflicts,
  exportToExcel,
  exportToPDF,
  generateSmartTimetable,
  getTeacherSchedule,
} from "../controllers/timetableController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Conflict checking
router.post("/check-conflicts", protect, authorize("admin"), checkConflicts);
router.post("/smart-generate", protect, authorize("admin"), generateSmartTimetable);

// Get timetable by class
router.get("/class/:classId", protect, getTimetableByClass);
router.get("/teacher/:teacherId", protect, getTeacherSchedule);

// Export routes (must come before /:id route)
router.get("/:id/export/excel", protect, exportToExcel);
router.get("/:id/export/pdf", protect, exportToPDF);

router
  .route("/")
  .get(protect, authorize("admin", "teacher"), getAllTimetables)
  .post(protect, authorize("admin"), auditLog("Timetable"), createTimetable);

router
  .route("/:id")
  .get(protect, getTimetableById)
  .put(protect, authorize("admin"), auditLog("Timetable"), updateTimetable)
  .delete(protect, authorize("admin"), auditLog("Timetable"), deleteTimetable);

export default router;


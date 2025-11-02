import express from "express";
import {
  getAllTimetables,
  getTimetableById,
  getTimetableByClass,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  checkConflicts,
} from "../controllers/timetableController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Conflict checking
router.post("/check-conflicts", protect, authorize("admin"), checkConflicts);

// Get timetable by class
router.get("/class/:classId", protect, getTimetableByClass);

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


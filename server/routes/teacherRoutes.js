import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  generateIDCard,
  generateBulkIDCards,
  getMyTeacherProfile,
} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// ID Card generation routes (must come before /:id route)
router.get("/me", protect, getMyTeacherProfile);
router.post("/bulk-id-cards", protect, authorize("admin"), generateBulkIDCards);

router
  .route("/")
  .get(protect, getTeachers)
  .post(protect, authorize("admin"), auditLog("Teacher"), createTeacher);

// ID card for single teacher (must come before general /:id route)
router.get("/:id/id-card", protect, generateIDCard);

router
  .route("/:id")
  .get(protect, getTeacherById)
  .put(protect, authorize("admin"), auditLog("Teacher"), updateTeacher)
  .delete(protect, authorize("admin"), auditLog("Teacher"), deleteTeacher);

export default router;


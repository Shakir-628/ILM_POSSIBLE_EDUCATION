import express from "express";
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "../controllers/teacherController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getTeachers)
  .post(protect, authorize("admin"), auditLog("Teacher"), createTeacher);

router
  .route("/:id")
  .get(protect, getTeacherById)
  .put(protect, authorize("admin"), auditLog("Teacher"), updateTeacher)
  .delete(protect, authorize("admin"), auditLog("Teacher"), deleteTeacher);

export default router;


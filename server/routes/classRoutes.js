import express from "express";
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
  removeStudentFromClass,
} from "../controllers/classController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getClasses)
  .post(protect, authorize("admin"), auditLog("Class"), createClass);

router
  .route("/:id")
  .get(protect, getClassById)
  .put(protect, authorize("admin"), auditLog("Class"), updateClass)
  .delete(protect, authorize("admin"), auditLog("Class"), deleteClass);

router.put("/:id/add-student", protect, authorize("admin"), auditLog("Class"), addStudentToClass);
router.put("/:id/remove-student", protect, authorize("admin"), auditLog("Class"), removeStudentFromClass);

export default router;


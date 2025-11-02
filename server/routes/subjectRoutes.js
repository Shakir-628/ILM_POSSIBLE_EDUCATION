import express from "express";
import {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
  getSubjectsByClass,
  getSubjectsByTeacher,
} from "../controllers/subjectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getSubjects)
  .post(protect, authorize("admin"), auditLog("Subject"), createSubject);

router.get("/class/:classId", protect, getSubjectsByClass);
router.get("/teacher/:teacherId", protect, getSubjectsByTeacher);

router
  .route("/:id")
  .get(protect, getSubjectById)
  .put(protect, authorize("admin"), auditLog("Subject"), updateSubject)
  .delete(protect, authorize("admin"), auditLog("Subject"), deleteSubject);

export default router;


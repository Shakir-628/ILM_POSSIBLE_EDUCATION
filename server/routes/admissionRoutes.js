import express from "express";
import {
  submitApplication,
  getAllApplications,
  getApplicationById,
  updateApplication,
  reviewApplication,
  updateScores,
  generateMeritList,
  enrollStudent,
  deleteApplication,
  uploadDocument,
  getAdmissionStats,
} from "../controllers/admissionController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";
import { upload } from "../services/fileService.js";

const router = express.Router();

// Public route for application submission
router.post("/", submitApplication);

// Admin routes
router.get("/stats", protect, authorize("admin"), getAdmissionStats);
router.get("/merit-list/:classId", protect, authorize("admin"), generateMeritList);

router
  .route("/")
  .get(protect, authorize("admin"), getAllApplications);

router
  .route("/:id")
  .get(protect, getApplicationById)
  .put(protect, authorize("admin"), auditLog("Admission"), updateApplication)
  .delete(protect, authorize("admin"), auditLog("Admission"), deleteApplication);

router.post(
  "/:id/review",
  protect,
  authorize("admin"),
  auditLog("Admission"),
  reviewApplication
);

router.post(
  "/:id/scores",
  protect,
  authorize("admin"),
  auditLog("Admission"),
  updateScores
);

router.post(
  "/:id/enroll",
  protect,
  authorize("admin"),
  auditLog("Admission"),
  enrollStudent
);

router.post(
  "/:id/documents",
  protect,
  upload.single("document"),
  uploadDocument
);

export default router;


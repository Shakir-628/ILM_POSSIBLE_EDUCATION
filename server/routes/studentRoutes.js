import express from "express";
import {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentsByClass,
  uploadDocument,
  deleteDocument,
  promoteStudent,
  transferStudent,
  exportToExcel,
  exportToPDF,
  generateIDCard,
  generateBulkIDCardsController,
  downloadImportTemplate,
  bulkImportStudents,
  confirmBulkImport,
} from "../controllers/studentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";
import { upload } from "../services/fileService.js";

const router = express.Router();

// Export routes (must be before /:id routes)
router.get("/export/excel", protect, authorize("admin"), exportToExcel);
router.get("/export/pdf", protect, authorize("admin"), exportToPDF);

// ID Card generation routes
router.post("/bulk-id-cards", protect, authorize("admin"), generateBulkIDCardsController);

// Bulk import routes
router.get("/import/template", protect, authorize("admin"), downloadImportTemplate);
router.post("/import", protect, authorize("admin"), upload.single("file"), bulkImportStudents);
router.post("/import/confirm", protect, authorize("admin"), confirmBulkImport);

router
  .route("/")
  .get(protect, authorize("admin", "teacher"), getStudents)
  .post(protect, authorize("admin"), auditLog("Student"), createStudent);

router.get("/class/:classId", protect, getStudentsByClass);

// Document upload routes
router.post(
  "/:id/documents",
  protect,
  authorize("admin"),
  upload.single("document"),
  uploadDocument
);

router.delete(
  "/:id/documents/:documentId",
  protect,
  authorize("admin"),
  deleteDocument
);

// Promotion and transfer routes
router.post(
  "/:id/promote",
  protect,
  authorize("admin"),
  auditLog("Student"),
  promoteStudent
);

router.post(
  "/:id/transfer",
  protect,
  authorize("admin"),
  auditLog("Student"),
  transferStudent
);

// ID Card generation for single student
router.get("/:id/id-card", protect, authorize("admin"), generateIDCard);

router
  .route("/:id")
  .get(protect, getStudentById)
  .put(protect, authorize("admin"), auditLog("Student"), updateStudent)
  .delete(protect, authorize("admin"), auditLog("Student"), deleteStudent);

export default router;


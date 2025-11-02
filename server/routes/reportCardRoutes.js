import express from "express";
import {
  getAllReportCards,
  getReportCardById,
  generateReportCard,
  updateReportCard,
  downloadReportCard,
} from "../controllers/reportCardController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Generate report card from grades
router.post("/generate", protect, authorize("admin"), auditLog("ReportCard"), generateReportCard);

// Download report card PDF
router.get("/:id/download", protect, downloadReportCard);

router
  .route("/")
  .get(protect, getAllReportCards);

router
  .route("/:id")
  .get(protect, getReportCardById)
  .put(protect, authorize("admin"), auditLog("ReportCard"), updateReportCard);

export default router;


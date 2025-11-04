import express from "express";
import {
  getCertificates,
  getCertificateById,
  getCertificatesByStudent,
  createCertificate,
  updateCertificate,
  generateCertificate,
  downloadCertificate,
  cancelCertificate,
  verifyCertificate,
  deleteCertificate,
  getCertificateStats,
} from "../controllers/certificateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly, adminOrTeacher } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Public routes
router.get("/verify/:verificationCode", verifyCertificate);

// Protected routes
router.use(protect);

// Get certificates (with filters)
router.get("/", adminOrTeacher, getCertificates);

// Get certificate statistics
router.get("/stats", adminOnly, getCertificateStats);

// Get certificates by student
router.get("/student/:studentId", getCertificatesByStudent);

// Get certificate by ID
router.get("/:id", getCertificateById);

// Create new certificate
router.post("/", adminOnly, createCertificate);

// Update certificate
router.put("/:id", adminOnly, updateCertificate);

// Generate certificate PDF
router.post("/:id/generate", adminOnly, generateCertificate);

// Download certificate
router.get("/:id/download", downloadCertificate);

// Cancel certificate
router.put("/:id/cancel", adminOnly, cancelCertificate);

// Delete certificate
router.delete("/:id", adminOnly, deleteCertificate);

export default router;


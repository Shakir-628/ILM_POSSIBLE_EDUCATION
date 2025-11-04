import express from "express";
import {
  getCertificateTemplates,
  getCertificateTemplateById,
  createCertificateTemplate,
  updateCertificateTemplate,
  setTemplateAsDefault,
  deleteCertificateTemplate,
  duplicateCertificateTemplate,
  getTemplatesByCertificateType,
  getAvailablePlaceholders,
} from "../controllers/certificateTemplateController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";

const router = express.Router();

// Protected routes (Admin only)
router.use(protect);

// Get all templates
router.get("/", adminOnly, getCertificateTemplates);

// Get available placeholders for certificate type
router.get("/placeholders/:certificateType", adminOnly, getAvailablePlaceholders);

// Get templates by certificate type
router.get("/type/:certificateType", getTemplatesByCertificateType);

// Get template by ID
router.get("/:id", adminOnly, getCertificateTemplateById);

// Create new template
router.post("/", adminOnly, createCertificateTemplate);

// Duplicate template
router.post("/:id/duplicate", adminOnly, duplicateCertificateTemplate);

// Update template
router.put("/:id", adminOnly, updateCertificateTemplate);

// Set template as default
router.put("/:id/set-default", adminOnly, setTemplateAsDefault);

// Delete template
router.delete("/:id", adminOnly, deleteCertificateTemplate);

export default router;


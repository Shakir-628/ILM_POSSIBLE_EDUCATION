import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { sendBulkEmail, sendBulkWhatsApp } from "../controllers/communicationController.js";

const router = express.Router();

router.use(protect);

// Bulk communication routes
router.post("/email/bulk", authorize('admin'), sendBulkEmail);
router.post("/whatsapp/bulk", authorize('admin'), sendBulkWhatsApp);

export default router;

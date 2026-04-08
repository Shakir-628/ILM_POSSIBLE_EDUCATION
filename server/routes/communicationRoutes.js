import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { sendBulkEmail } from "../controllers/communicationController.js";

const router = express.Router();

router.use(protect);

// Bulk communication routes
router.post("/email/bulk", authorize('admin'), sendBulkEmail);

export default router;

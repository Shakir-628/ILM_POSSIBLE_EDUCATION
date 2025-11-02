import express from "express";
import {
  getAuditLogs,
  getEntityAuditLogs,
  getUserAuditLogs,
  getAuditStats,
  cleanupOldLogs,
  getRecentActivity,
} from "../controllers/auditController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All audit routes are admin and superadmin only
router.use(protect, authorize("admin", "superadmin"));

router.get("/", getAuditLogs);
router.get("/stats", getAuditStats);
router.get("/recent", getRecentActivity);
router.get("/entity/:entity/:id", getEntityAuditLogs);
router.get("/user/:userId", getUserAuditLogs);
router.delete("/cleanup", cleanupOldLogs);

export default router;


import express from "express";
import {
  getAllLogs,
  getLogStats,
  cleanupLogs,
  deleteLog,
} from "../controllers/logController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = express.Router();

// All log routes require superadmin role
router.use(protect, authorize("superadmin"));

router.get("/", getAllLogs);
router.get("/stats", getLogStats);
router.post("/cleanup", cleanupLogs);
router.delete("/:id", deleteLog);

export default router;


import express from "express";
import {
  getSchoolProfile,
  updateSchoolProfile,
  getUserRoles,
  updateUserRole,
  toggleUserActive,
  getSystemStats,
  triggerBackup,
  getBackups,
  getSystemSettings,
  updateSystemSettings,
  createUser,
} from "../controllers/settingsController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// School Profile
router.get("/school-profile", protect, getSchoolProfile);
router.put(
  "/school-profile",
  protect,
  authorize("admin"),
  auditLog("Settings"),
  updateSchoolProfile
);

// User Roles
router.get("/user-roles", protect, authorize("admin"), getUserRoles);
router.post("/user-roles", protect, authorize("admin"), auditLog("Settings"), createUser);
router.put(
  "/user-roles/:userId",
  protect,
  authorize("admin"),
  auditLog("Settings"),
  updateUserRole
);
router.put(
  "/user-roles/:userId/toggle-active",
  protect,
  authorize("admin"),
  auditLog("Settings"),
  toggleUserActive
);

// System Stats
router.get("/system-stats", protect, authorize("admin"), getSystemStats);

// Backup & Security
router.post("/backup", protect, authorize("admin"), auditLog("Settings"), triggerBackup);
router.get("/backups", protect, authorize("admin"), getBackups);

// System Settings
router.get("/system", protect, authorize("admin"), getSystemSettings);
router.put("/system", protect, authorize("admin"), auditLog("Settings"), updateSystemSettings);

export default router;


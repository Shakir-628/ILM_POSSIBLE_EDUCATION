import express from "express";
import {
  getAllSuperadmins,
  getSuperadminById,
  deactivateSuperadmin,
  activateSuperadmin,
  updateSuperadmin,
  deleteSuperadmin,
  verifySuperadminRole,
} from "../controllers/superadminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { superadminOnly } from "../middleware/superadminMiddleware.js";

const router = express.Router();

// All routes require authentication and superadmin role
router.use(protect, superadminOnly);

// Get all superadmins
router.get("/", getAllSuperadmins);

// Get superadmin by ID
router.get("/:id", getSuperadminById);

// Verify superadmin role (database-level check)
router.get("/:id/verify", verifySuperadminRole);

// Update superadmin
router.put("/:id", updateSuperadmin);

// Deactivate superadmin
router.put("/:id/deactivate", deactivateSuperadmin);

// Activate superadmin
router.put("/:id/activate", activateSuperadmin);

// Delete superadmin
router.delete("/:id", deleteSuperadmin);

export default router;

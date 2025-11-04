import express from 'express';
import {
  getAllRolePermissions,
  getRolePermissionByRole,
  upsertRolePermission,
  updateModuleVisibility,
  initializeDefaultPermissions,
  deleteRolePermission,
} from '../controllers/rolePermissionController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Initialize default permissions (one-time setup)
router.post('/initialize', protect, authorize('superadmin'), initializeDefaultPermissions);

// Get all role permissions
router.get('/', protect, authorize('superadmin', 'admin'), getAllRolePermissions);

// Get specific role permissions
router.get('/:role', protect, getRolePermissionByRole);

// Create or update role permissions
router.post('/', protect, authorize('superadmin', 'admin'), upsertRolePermission);

// Update module visibility
router.patch('/:role/modules', protect, authorize('superadmin', 'admin'), updateModuleVisibility);

// Delete role permissions
router.delete('/:role', protect, authorize('superadmin'), deleteRolePermission);

export default router;


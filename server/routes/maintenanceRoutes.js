import express from 'express';
import {
  getAllMaintenance,
  getMaintenanceById,
  createMaintenance,
  updateMaintenance,
  deleteMaintenance,
  getMaintenanceStats,
  getAssetMaintenanceHistory,
  exportMaintenanceToExcel,
  exportMaintenanceToPDF,
} from '../controllers/maintenanceController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Maintenance routes
router.get('/', protect, authorize('superadmin', 'admin', 'teacher'), getAllMaintenance);
router.get('/stats/overview', protect, authorize('superadmin', 'admin', 'teacher'), getMaintenanceStats);
router.get('/asset/:assetId', protect, authorize('superadmin', 'admin', 'teacher'), getAssetMaintenanceHistory);
router.get('/:id', protect, authorize('superadmin', 'admin', 'teacher'), getMaintenanceById);
router.post('/', protect, authorize('superadmin', 'admin'), createMaintenance);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateMaintenance);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteMaintenance);

// Export routes
router.post('/export/excel', protect, authorize('superadmin', 'admin', 'teacher'), exportMaintenanceToExcel);
router.post('/export/pdf', protect, authorize('superadmin', 'admin', 'teacher'), exportMaintenanceToPDF);

export default router;


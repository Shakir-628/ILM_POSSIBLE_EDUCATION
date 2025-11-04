import express from 'express';
import {
  getAllAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  getAssetStats,
  updateMaintenanceDate,
  exportAssetsToExcel,
  exportAssetsToPDF,
} from '../controllers/assetController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Asset routes
router.get('/', protect, authorize('superadmin', 'admin', 'teacher'), getAllAssets);
router.get('/stats/overview', protect, authorize('superadmin', 'admin', 'teacher'), getAssetStats);
router.get('/:id', protect, authorize('superadmin', 'admin', 'teacher'), getAssetById);
router.post('/', protect, authorize('superadmin', 'admin'), createAsset);
router.put('/:id', protect, authorize('superadmin', 'admin'), updateAsset);
router.delete('/:id', protect, authorize('superadmin', 'admin'), deleteAsset);
router.patch('/:id/maintenance', protect, authorize('superadmin', 'admin'), updateMaintenanceDate);

// Export routes
router.post('/export/excel', protect, authorize('superadmin', 'admin', 'teacher'), exportAssetsToExcel);
router.post('/export/pdf', protect, authorize('superadmin', 'admin', 'teacher'), exportAssetsToPDF);

export default router;


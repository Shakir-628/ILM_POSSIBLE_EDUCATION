import express from 'express';
import * as hostelController from '../controllers/hostelController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Room management
router.get('/rooms', protect, hostelController.getAllRooms);
router.post('/rooms', protect, authorize('admin', 'superadmin'), hostelController.createRoom);
router.put('/rooms/:id', protect, authorize('admin', 'superadmin'), hostelController.updateRoom);
router.delete('/rooms/:id', protect, authorize('admin', 'superadmin'), hostelController.deleteRoom);

// Allocation management
router.get('/allocations', protect, hostelController.getAllAllocations);
router.post('/allocations', protect, authorize('admin', 'superadmin'), hostelController.allocateRoom);
router.put('/allocations/:id/vacate', protect, authorize('admin', 'superadmin'), hostelController.vacateRoom);

// Statistics
router.get('/stats', protect, hostelController.getHostelStats);

export default router;


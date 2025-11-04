import express from 'express';
import * as transportController from '../controllers/transportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route management
router.get('/routes', protect, transportController.getAllRoutes);
router.post('/routes', protect, authorize('admin', 'superadmin'), transportController.createRoute);
router.put('/routes/:id', protect, authorize('admin', 'superadmin'), transportController.updateRoute);
router.delete('/routes/:id', protect, authorize('admin', 'superadmin'), transportController.deleteRoute);

// Vehicle management
router.get('/vehicles', protect, transportController.getAllVehicles);
router.post('/vehicles', protect, authorize('admin', 'superadmin'), transportController.createVehicle);
router.put('/vehicles/:id', protect, authorize('admin', 'superadmin'), transportController.updateVehicle);
router.delete('/vehicles/:id', protect, authorize('admin', 'superadmin'), transportController.deleteVehicle);

// Driver management
router.get('/drivers', protect, transportController.getAllDrivers);
router.post('/drivers', protect, authorize('admin', 'superadmin'), transportController.createDriver);
router.put('/drivers/:id', protect, authorize('admin', 'superadmin'), transportController.updateDriver);
router.delete('/drivers/:id', protect, authorize('admin', 'superadmin'), transportController.deleteDriver);

// Student assignment
router.post('/routes/assign-student', protect, authorize('admin', 'superadmin'), transportController.assignStudentToRoute);
router.delete('/routes/:routeId/students/:studentId', protect, authorize('admin', 'superadmin'), transportController.removeStudentFromRoute);

// Statistics
router.get('/stats', protect, transportController.getTransportStats);

export default router;


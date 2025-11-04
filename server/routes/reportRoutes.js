import express from 'express';
import {
  generateAttendanceReport,
  generateFinancialReport,
  generateCustomReport,
} from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Attendance report
router.post('/attendance', protect, authorize('superadmin', 'admin', 'teacher'), generateAttendanceReport);

// Financial report
router.post('/financial', protect, authorize('superadmin', 'admin'), generateFinancialReport);

// Custom report
router.post('/custom', protect, authorize('superadmin', 'admin', 'teacher'), generateCustomReport);

export default router;

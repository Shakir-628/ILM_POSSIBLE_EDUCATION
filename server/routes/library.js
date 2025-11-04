import express from 'express';
import * as libraryController from '../controllers/libraryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Book routes
router.get('/books', protect, libraryController.getAllBooks);
router.get('/books/search', protect, libraryController.searchBooks);
router.get('/books/:id', protect, libraryController.getBookById);
router.post('/books', protect, authorize('admin', 'superadmin'), libraryController.createBook);
router.put('/books/:id', protect, authorize('admin', 'superadmin'), libraryController.updateBook);
router.delete('/books/:id', protect, authorize('admin', 'superadmin'), libraryController.deleteBook);
router.get('/books/:bookId/history', protect, libraryController.getBookHistory);

// Issue routes
router.get('/issues', protect, libraryController.getAllIssues);
router.post('/issues', protect, authorize('admin', 'superadmin', 'teacher'), libraryController.issueBook);
router.put('/issues/:issueId/return', protect, authorize('admin', 'superadmin', 'teacher'), libraryController.returnBook);
router.put('/issues/:issueId/renew', protect, authorize('admin', 'superadmin', 'teacher'), libraryController.renewBook);
router.put('/issues/:issueId/pay-fine', protect, libraryController.payFine);

// Student specific routes
router.get('/students/:studentId/books', protect, libraryController.getStudentBooks);

// Overdue routes
router.get('/overdue', protect, libraryController.getOverdueBooks);

// Statistics
router.get('/stats', protect, libraryController.getLibraryStats);

export default router;


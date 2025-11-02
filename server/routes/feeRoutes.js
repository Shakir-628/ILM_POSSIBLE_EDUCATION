import express from "express";
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
  createFeePayment,
  getFeePayments,
  processPayment,
  processOnlinePayment,
  verifyOnlinePayment,
  getOverduePayments,
  getFeeStatistics,
  downloadInvoice,
  downloadReceipt,
  sendPaymentReminder,
} from "../controllers/feeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin, teacherOrAdmin } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Fee Structures
router.route("/structures")
  .get(protect, teacherOrAdmin, getFeeStructures)
  .post(protect, admin, auditLog("FeeStructure"), createFeeStructure);

router.route("/structures/:id")
  .put(protect, admin, auditLog("FeeStructure"), updateFeeStructure)
  .delete(protect, admin, auditLog("FeeStructure"), deleteFeeStructure);

// Fee Payments
router.route("/payments")
  .get(protect, getFeePayments)
  .post(protect, admin, auditLog("FeePayment"), createFeePayment);

router.post("/payments/:id/pay", protect, admin, auditLog("FeePayment"), processPayment);
router.post("/payments/:id/pay-online", protect, processOnlinePayment);
router.post("/payments/:id/verify", protect, verifyOnlinePayment);
router.post("/payments/:id/reminder", protect, admin, sendPaymentReminder);

router.get("/payments/overdue", protect, admin, getOverduePayments);
router.get("/payments/:id/invoice", protect, downloadInvoice);
router.get("/payments/:id/receipt", protect, downloadReceipt);

// Statistics
router.get("/statistics", protect, admin, getFeeStatistics);

export default router;


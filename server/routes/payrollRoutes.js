import express from "express";
import {
  getAllPayroll,
  getPayrollById,
  createPayroll,
  updatePayroll,
  approvePayroll,
  markAsPaid,
  generatePayslip,
  getPayrollStats,
} from "../controllers/payrollController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// Stats and payslip routes
router.get("/stats", protect, authorize("admin"), getPayrollStats);
router.get("/:id/payslip", protect, generatePayslip);

// Approval routes
router.post("/:id/approve", protect, authorize("admin"), auditLog("Payroll"), approvePayroll);
router.post("/:id/mark-paid", protect, authorize("admin"), auditLog("Payroll"), markAsPaid);

router
  .route("/")
  .get(protect, authorize("admin"), getAllPayroll)
  .post(protect, authorize("admin"), auditLog("Payroll"), createPayroll);

router
  .route("/:id")
  .get(protect, getPayrollById)
  .put(protect, authorize("admin"), auditLog("Payroll"), updatePayroll);

export default router;


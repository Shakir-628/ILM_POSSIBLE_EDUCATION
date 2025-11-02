import express from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getIncome,
  getFinancialSummary,
} from "../controllers/accountingController.js";
import { protect } from "../middleware/authMiddleware.js";
import { admin } from "../middleware/roleMiddleware.js";
import { upload } from "../services/fileService.js";
import { auditLog } from "../middleware/auditMiddleware.js";

const router = express.Router();

// All accounting routes are admin-only
router.use(protect, admin);

// Setup upload middleware for expenses
const uploadExpenseFiles = (req, res, next) => {
  req.uploadType = "expenses";
  next();
};

// Expenses
router.route("/expenses")
  .get(getExpenses)
  .post(uploadExpenseFiles, upload.array("files", 5), auditLog("Expense"), createExpense);

router.route("/expenses/:id")
  .put(uploadExpenseFiles, upload.array("files", 5), auditLog("Expense"), updateExpense)
  .delete(auditLog("Expense"), deleteExpense);

// Income
router.get("/income", getIncome);

// Financial Summary
router.get("/summary", getFinancialSummary);

export default router;


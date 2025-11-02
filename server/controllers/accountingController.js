import Expense from "../models/Expense.js";
import Income from "../models/Income.js";
import { processUploadedFiles } from "../services/fileService.js";

// @desc    Get all expenses
// @route   GET /api/accounting/expenses
// @access  Private (Admin)
export const getExpenses = async (req, res) => {
  try {
    const { category, status, startDate, endDate } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.expenseDate = {};
      if (startDate) query.expenseDate.$gte = new Date(startDate);
      if (endDate) query.expenseDate.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query)
      .populate("createdBy", "name email")
      .populate("approvedBy", "name")
      .sort({ expenseDate: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create expense
// @route   POST /api/accounting/expenses
// @access  Private (Admin)
export const createExpense = async (req, res) => {
  try {
    const attachments = req.files ? processUploadedFiles(req.files) : [];

    const expense = await Expense.create({
      ...req.body,
      createdBy: req.user._id,
      attachments,
    });

    await expense.populate("createdBy");

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update expense
// @route   PUT /api/accounting/expenses/:id
// @access  Private (Admin)
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (req.files) {
      const newAttachments = processUploadedFiles(req.files);
      req.body.attachments = [...(expense.attachments || []), ...newAttachments];
    }

    Object.assign(expense, req.body);
    await expense.save();

    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete expense
// @route   DELETE /api/accounting/expenses/:id
// @access  Private (Admin)
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all income
// @route   GET /api/accounting/income
// @access  Private (Admin)
export const getIncome = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const query = {};

    if (category) query.category = category;

    if (startDate || endDate) {
      query.incomeDate = {};
      if (startDate) query.incomeDate.$gte = new Date(startDate);
      if (endDate) query.incomeDate.$lte = new Date(endDate);
    }

    const income = await Income.find(query)
      .populate("createdBy", "name email")
      .populate("feePayment")
      .sort({ incomeDate: -1 });

    res.json(income);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get financial summary
// @route   GET /api/accounting/summary
// @access  Private (Admin)
export const getFinancialSummary = async (req, res) => {
  try {
    const { startDate, endDate, academicYear } = req.query;
    
    const dateQuery = {};
    if (startDate || endDate) {
      if (startDate) dateQuery.$gte = new Date(startDate);
      if (endDate) dateQuery.$lte = new Date(endDate);
    }

    const yearQuery = academicYear ? { academicYear } : {};

    const [totalIncome, totalExpenses, categoryWiseExpenses, categoryWiseIncome] = await Promise.all([
      Income.aggregate([
        {
          $match: {
            ...yearQuery,
            ...(Object.keys(dateQuery).length && { incomeDate: dateQuery }),
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        {
          $match: {
            ...yearQuery,
            status: "paid",
            ...(Object.keys(dateQuery).length && { expenseDate: dateQuery }),
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        {
          $match: {
            ...yearQuery,
            status: "paid",
            ...(Object.keys(dateQuery).length && { expenseDate: dateQuery }),
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
      Income.aggregate([
        {
          $match: {
            ...yearQuery,
            ...(Object.keys(dateQuery).length && { incomeDate: dateQuery }),
          },
        },
        { $group: { _id: "$category", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncomeAmount = totalIncome[0]?.total || 0;
    const totalExpenseAmount = totalExpenses[0]?.total || 0;
    const netProfit = totalIncomeAmount - totalExpenseAmount;

    res.json({
      totalIncome: totalIncomeAmount,
      totalExpenses: totalExpenseAmount,
      netProfit,
      profitMargin: totalIncomeAmount > 0 ? ((netProfit / totalIncomeAmount) * 100).toFixed(2) : 0,
      categoryWiseExpenses,
      categoryWiseIncome,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getIncome,
  getFinancialSummary,
};


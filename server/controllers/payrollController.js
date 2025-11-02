import Payroll from "../models/Payroll.js";
import Teacher from "../models/Teacher.js";
import Attendance from "../models/Attendance.js";
import PDFDocument from "pdfkit";

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private (Admin)
export const getAllPayroll = async (req, res) => {
  try {
    const { month, year, status, teacherId } = req.query;
    const filter = {};

    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    if (status) filter.status = status;
    if (teacherId) filter.teacher = teacherId;

    const payrollRecords = await Payroll.find(filter)
      .populate("teacher", "firstName lastName teacherId email")
      .populate("generatedBy", "name email")
      .populate("approvedBy", "name email")
      .sort({ year: -1, month: -1 });

    res.status(200).json({
      success: true,
      count: payrollRecords.length,
      data: payrollRecords,
    });
  } catch (error) {
    console.error("Get payroll error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private
export const getPayrollById = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate("teacher", "firstName lastName teacherId email phone")
      .populate("generatedBy", "name email")
      .populate("approvedBy", "name email");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    res.status(200).json({
      success: true,
      data: payroll,
    });
  } catch (error) {
    console.error("Get payroll error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create payroll
// @route   POST /api/payroll
// @access  Private (Admin)
export const createPayroll = async (req, res) => {
  try {
    const payrollData = {
      ...req.body,
      generatedBy: req.user._id,
    };

    const payroll = await Payroll.create(payrollData);

    await payroll.populate("teacher", "firstName lastName teacherId email");
    await payroll.populate("generatedBy", "name email");

    res.status(201).json({
      success: true,
      message: "Payroll created successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Create payroll error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update payroll
// @route   PUT /api/payroll/:id
// @access  Private (Admin)
export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    const updatedPayroll = await Payroll.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("teacher", "firstName lastName teacherId email")
      .populate("generatedBy", "name email");

    res.status(200).json({
      success: true,
      message: "Payroll updated successfully",
      data: updatedPayroll,
    });
  } catch (error) {
    console.error("Update payroll error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Approve payroll
// @route   POST /api/payroll/:id/approve
// @access  Private (Admin)
export const approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    payroll.status = "processed";
    payroll.approvedBy = req.user._id;
    payroll.approvedAt = new Date();
    await payroll.save();

    res.status(200).json({
      success: true,
      message: "Payroll approved successfully",
      data: payroll,
    });
  } catch (error) {
    console.error("Approve payroll error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Mark payroll as paid
// @route   POST /api/payroll/:id/mark-paid
// @access  Private (Admin)
export const markAsPaid = async (req, res) => {
  try {
    const { paymentDate, paymentMethod, transactionId } = req.body;
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    payroll.status = "paid";
    payroll.paymentDate = paymentDate || new Date();
    payroll.paymentMethod = paymentMethod || payroll.paymentMethod;
    payroll.transactionId = transactionId;
    await payroll.save();

    res.status(200).json({
      success: true,
      message: "Payroll marked as paid",
      data: payroll,
    });
  } catch (error) {
    console.error("Mark paid error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Generate payslip PDF
// @route   GET /api/payroll/:id/payslip
// @access  Private
export const generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id)
      .populate("teacher", "firstName lastName teacherId email phone");

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: "Payroll record not found",
      });
    }

    const doc = new PDFDocument({ margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=payslip_${payroll.payrollNumber}.pdf`
    );

    doc.pipe(res);

    // Header
    doc.fontSize(20).text("ILM Possible Education", { align: "center" });
    doc.fontSize(12).text("Salary Slip", { align: "center" });
    doc.moveDown();

    // Payroll Info
    doc.fontSize(10);
    doc.text(`Payslip No: ${payroll.payrollNumber}`, 50, 120);
    doc.text(
      `Month/Year: ${new Date(payroll.year, payroll.month - 1).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })}`,
      300,
      120
    );

    // Teacher Info
    doc.moveDown(2);
    doc.text(`Employee Name: ${payroll.teacher.firstName} ${payroll.teacher.lastName}`);
    doc.text(`Employee ID: ${payroll.teacher.teacherId}`);
    doc.text(`Email: ${payroll.teacher.email}`);

    // Attendance
    doc.moveDown(2);
    doc.text(`Working Days: ${payroll.workingDays}`);
    doc.text(`Present Days: ${payroll.presentDays}`);
    doc.text(`Absent Days: ${payroll.absentDays}`);
    doc.text(`Leaves: ${payroll.leaves}`);

    // Earnings
    doc.moveDown(2);
    doc.fontSize(12).text("Earnings:", { underline: true });
    doc.fontSize(10);
    doc.text(`Basic Salary: PKR ${payroll.basicSalary.toLocaleString()}`);
    doc.text(`House Rent: PKR ${payroll.allowances.houseRent.toLocaleString()}`);
    doc.text(`Transport: PKR ${payroll.allowances.transport.toLocaleString()}`);
    doc.text(`Medical: PKR ${payroll.allowances.medical.toLocaleString()}`);
    doc.text(`Bonuses: PKR ${payroll.bonuses.toLocaleString()}`);
    doc.text(`Gross Salary: PKR ${payroll.grossSalary.toLocaleString()}`, {
      underline: true,
    });

    // Deductions
    doc.moveDown(2);
    doc.fontSize(12).text("Deductions:", { underline: true });
    doc.fontSize(10);
    doc.text(`Tax: PKR ${payroll.deductions.tax.toLocaleString()}`);
    doc.text(`Provident Fund: PKR ${payroll.deductions.providentFund.toLocaleString()}`);
    doc.text(`Insurance: PKR ${payroll.deductions.insurance.toLocaleString()}`);
    doc.text(`Loan: PKR ${payroll.deductions.loan.toLocaleString()}`);
    doc.text(`Total Deductions: PKR ${payroll.totalDeductions.toLocaleString()}`, {
      underline: true,
    });

    // Net Salary
    doc.moveDown(2);
    doc.fontSize(14).fillColor("#0369a1");
    doc.text(`Net Salary: PKR ${payroll.netSalary.toLocaleString()}`, {
      underline: true,
    });

    // Footer
    doc.fontSize(8).fillColor("#666666");
    doc.text(
      "This is a computer-generated payslip. No signature required.",
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  } catch (error) {
    console.error("Generate payslip error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get payroll statistics
// @route   GET /api/payroll/stats
// @access  Private (Admin)
export const getPayrollStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentMonth = month || new Date().getMonth() + 1;
    const currentYear = year || new Date().getFullYear();

    const filter = {
      month: parseInt(currentMonth),
      year: parseInt(currentYear),
    };

    const payrolls = await Payroll.find(filter);

    const stats = {
      totalPayrolls: payrolls.length,
      totalGrossSalary: payrolls.reduce((sum, p) => sum + p.grossSalary, 0),
      totalDeductions: payrolls.reduce((sum, p) => sum + p.totalDeductions, 0),
      totalNetSalary: payrolls.reduce((sum, p) => sum + p.netSalary, 0),
      pending: payrolls.filter((p) => p.status === "pending").length,
      processed: payrolls.filter((p) => p.status === "processed").length,
      paid: payrolls.filter((p) => p.status === "paid").length,
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get payroll stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


import FeeStructure from "../models/FeeStructure.js";
import FeePayment from "../models/FeePayment.js";
import Student from "../models/Student.js";
import Income from "../models/Income.js";
import { generateFeeInvoice, generateFeeReceipt } from "../services/invoiceService.js";
import { createStripePayment, verifyStripePayment } from "../services/paymentService.js";
import { sendEmail } from "../services/mailService.js";
import { emitToRole, emitToUser, emitToAll } from "../config/socket.js";

// @desc    Get all fee structures
// @route   GET /api/fees/structures
// @access  Private (Admin)
export const getFeeStructures = async (req, res) => {
  try {
    const { classId, academicYear, status } = req.query;
    const query = {};

    if (classId) query.class = classId;
    if (academicYear) query.academicYear = academicYear;
    if (status) query.status = status;

    const structures = await FeeStructure.find(query)
      .populate("class", "className grade section")
      .sort({ createdAt: -1 });

    res.json(structures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create fee structure
// @route   POST /api/fees/structures
// @access  Private (Admin)
export const createFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.create(req.body);
    await structure.populate("class");
    res.status(201).json(structure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fee structure
// @route   PUT /api/fees/structures/:id
// @access  Private (Admin)
export const updateFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);

    if (!structure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    Object.assign(structure, req.body);
    await structure.save();
    await structure.populate("class");

    res.json(structure);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete fee structure
// @route   DELETE /api/fees/structures/:id
// @access  Private (Admin)
export const deleteFeeStructure = async (req, res) => {
  try {
    const structure = await FeeStructure.findById(req.params.id);

    if (!structure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    await structure.deleteOne();
    res.json({ message: "Fee structure deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate invoice number
const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const lastPayment = await FeePayment.findOne().sort({ createdAt: -1 });
  
  if (!lastPayment) {
    return `INV${year}0001`;
  }

  const lastNumber = parseInt(lastPayment.invoiceNumber.slice(-4));
  const nextNumber = String(lastNumber + 1).padStart(4, "0");
  return `INV${year}${nextNumber}`;
};

// @desc    Create fee payment/invoice
// @route   POST /api/fees/payments
// @access  Private (Admin)
export const createFeePayment = async (req, res) => {
  try {
    const {
      studentId,
      feeStructureId,
      dueDate,
      lateFee = 0,
      discount = 0,
      academicYear,
      term,
    } = req.body;

    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) {
      return res.status(404).json({ message: "Fee structure not found" });
    }

    const invoiceNumber = await generateInvoiceNumber();

    const payment = await FeePayment.create({
      student: studentId,
      feeStructure: feeStructureId,
      invoiceNumber,
      amount: feeStructure.amount,
      lateFee,
      discount,
      totalAmount: feeStructure.amount + lateFee - discount,
      dueDate,
      academicYear,
      term,
    });

    await payment.populate("student feeStructure");

    // Generate invoice PDF
    const student = await Student.findById(studentId).populate("class");
    const { filepath } = await generateFeeInvoice(payment, student);
    
    payment.receiptPath = filepath;
    await payment.save();

    // Emit socket event for real-time update
    try {
      emitToRole('admin', 'fee:created', { 
        payment, 
        studentId,
        message: `New fee created for ${student.name}` 
      });
      emitToUser(studentId, 'fee:created', { payment });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/fees/payments
// @access  Private
export const getFeePayments = async (req, res) => {
  try {
    const { studentId, paymentStatus, academicYear } = req.query;
    const query = {};

    if (studentId) query.student = studentId;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (academicYear) query.academicYear = academicYear;

    const payments = await FeePayment.find(query)
      .populate("student", "studentId firstName lastName class")
      .populate("feeStructure", "feeName feeType")
      .populate("paidBy", "name")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment (cash/bank)
// @route   POST /api/fees/payments/:id/pay
// @access  Private (Admin)
export const processPayment = async (req, res) => {
  try {
    const { amountPaid, paymentMethod, remarks } = req.body;

    const payment = await FeePayment.findById(req.params.id)
      .populate("student", "studentId firstName lastName email class")
      .populate("feeStructure");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.amountPaid += amountPaid;
    payment.paymentMethod = paymentMethod;
    payment.paidDate = new Date();
    payment.paidBy = req.user._id;
    payment.remarks = remarks;
    
    // Generate receipt number if fully paid
    if (payment.balance <= 0 && !payment.receiptNumber) {
      payment.receiptNumber = `RCP${Date.now()}`;
    }

    await payment.save();

    // Generate receipt PDF
    const { filepath } = await generateFeeReceipt(payment, payment.student);
    payment.receiptPath = filepath;
    await payment.save();

    // Record income
    await Income.create({
      category: "fee-payment",
      title: `Fee Payment - ${payment.student.firstName} ${payment.student.lastName}`,
      description: `${payment.feeStructure.feeName} payment`,
      amount: amountPaid,
      incomeDate: new Date(),
      paymentMethod,
      receivedFrom: `${payment.student.firstName} ${payment.student.lastName}`,
      reference: payment.invoiceNumber,
      feePayment: payment._id,
      createdBy: req.user._id,
      academicYear: payment.academicYear,
    });

    // Integrated Intelligence: Auto-process receipt delivery
    import("./services/feeAutomationService.js").then((m) => {
      m.processAutoReceipt(payment._id);
    });

    // Send fallback email (optional if auto-receipt handles it, but keeping for legacy compatibility if needed)
    // Actually, processAutoReceipt is more robust, so we could simplify this, but keeping it as a quick confirmation.
    try {
      await sendEmail({
        to: payment.student.email,
        subject: `Payment Receipt - ${payment.invoiceNumber}`,
        html: `
          <h2>Payment Received</h2>
          <p>Dear ${payment.student.firstName},</p>
          <p>We have received your payment of PKR ${amountPaid}.</p>
          <p><strong>Invoice:</strong> ${payment.invoiceNumber}</p>
          <p><strong>Balance:</strong> PKR ${payment.balance.toFixed(2)}</p>
          <p>Thank you!</p>
        `,
      });
    } catch (emailError) {
      console.error("Failed to send receipt email:", emailError);
    }

    // Emit socket event for real-time update
    try {
      emitToRole('admin', 'payment:received', {
        payment,
        studentId: payment.student._id,
        studentName: `${payment.student.firstName} ${payment.student.lastName}`,
        amount: amountPaid,
        balance: payment.balance,
        message: `Payment of PKR ${amountPaid} received from ${payment.student.firstName} ${payment.student.lastName}`,
      });
      emitToUser(payment.student._id.toString(), 'payment:processed', { payment });
      emitToRole('accountant', 'payment:received', { payment, amount: amountPaid });
    } catch (socketError) {
      console.error('Socket emission error:', socketError);
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process online payment (Stripe)
// @route   POST /api/fees/payments/:id/pay-online
// @access  Private
export const processOnlinePayment = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id)
      .populate("student")
      .populate("feeStructure");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Create Stripe payment intent
    const stripeResult = await createStripePayment({
      amount: payment.totalAmount,
      currency: "pkr",
      metadata: {
        invoiceNumber: payment.invoiceNumber,
        studentId: payment.student.studentId,
      },
    });

    if (!stripeResult.success) {
      return res.status(400).json({ message: stripeResult.error });
    }

    payment.stripePaymentIntentId = stripeResult.paymentIntentId;
    await payment.save();

    res.json({
      clientSecret: stripeResult.clientSecret,
      paymentIntentId: stripeResult.paymentIntentId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify online payment
// @route   POST /api/fees/payments/:id/verify
// @access  Private
export const verifyOnlinePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    const payment = await FeePayment.findById(req.params.id)
      .populate("student")
      .populate("feeStructure");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Verify with Stripe
    const verification = await verifyStripePayment(paymentIntentId);

    if (verification.success) {
      payment.amountPaid = payment.totalAmount;
      payment.paymentMethod = "stripe";
      payment.paidDate = new Date();
      payment.transactionId = paymentIntentId;
      payment.receiptNumber = `RCP${Date.now()}`;

      await payment.save();

      // Generate receipt
      const { filepath } = await generateFeeReceipt(payment, payment.student);
      payment.receiptPath = filepath;
      await payment.save();

      // Record income
      await Income.create({
        category: "fee-payment",
        title: `Online Payment - ${payment.student.firstName} ${payment.student.lastName}`,
        description: `${payment.feeStructure.feeName} - Stripe`,
        amount: verification.amount,
        incomeDate: new Date(),
        paymentMethod: "stripe",
        receivedFrom: `${payment.student.firstName} ${payment.student.lastName}`,
        reference: payment.invoiceNumber,
        feePayment: payment._id,
        createdBy: payment.student.user,
        academicYear: payment.academicYear,
      });

      // Integrated Intelligence: Auto-process receipt delivery
      import("./services/feeAutomationService.js").then((m) => {
        m.processAutoReceipt(payment._id);
      });

      res.json({ success: true, payment });
    } else {
      res.status(400).json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overdue payments
// @route   GET /api/fees/payments/overdue
// @access  Private (Admin)
export const getOverduePayments = async (req, res) => {
  try {
    const overduePayments = await FeePayment.find({
      dueDate: { $lt: new Date() },
      paymentStatus: { $in: ["pending", "partial"] },
    })
      .populate("student", "studentId firstName lastName email")
      .populate("feeStructure", "feeName")
      .sort({ dueDate: 1 });

    res.json(overduePayments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fee statistics
// @route   GET /api/fees/statistics
// @access  Private (Admin)
export const getFeeStatistics = async (req, res) => {
  try {
    const { academicYear } = req.query;
    const query = academicYear ? { academicYear } : {};

    const [
      totalInvoiced,
      totalCollected,
      totalPending,
      totalOverdue,
      paymentsByStatus,
    ] = await Promise.all([
      FeePayment.aggregate([
        { $match: query },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      FeePayment.aggregate([
        { $match: { ...query, paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$amountPaid" } } },
      ]),
      FeePayment.aggregate([
        { $match: { ...query, paymentStatus: "pending" } },
        { $group: { _id: null, total: { $sum: "$balance" } } },
      ]),
      FeePayment.countDocuments({
        ...query,
        dueDate: { $lt: new Date() },
        paymentStatus: { $in: ["pending", "partial"] },
      }),
      FeePayment.aggregate([
        { $match: query },
        { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
      ]),
    ]);

    res.json({
      totalInvoiced: totalInvoiced[0]?.total || 0,
      totalCollected: totalCollected[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
      overdueCount: totalOverdue,
      paymentsByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download invoice
// @route   GET /api/fees/payments/:id/invoice
// @access  Private
export const downloadInvoice = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id)
      .populate("student", "studentId firstName lastName class")
      .populate("feeStructure");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const student = await Student.findById(payment.student._id).populate("class");
    const { filename, filepath } = await generateFeeInvoice(payment, student);

    res.download(filepath, filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download receipt
// @route   GET /api/fees/payments/:id/receipt
// @access  Private
export const downloadReceipt = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id)
      .populate("student", "studentId firstName lastName class")
      .populate("feeStructure");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.paymentStatus === "pending") {
      return res.status(400).json({ message: "No payment received yet" });
    }

    const student = await Student.findById(payment.student._id).populate("class");
    const { filename, filepath } = await generateFeeReceipt(payment, student);

    res.download(filepath, filename);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send payment reminder
// @route   POST /api/fees/payments/:id/reminder
// @access  Private (Admin)
export const sendPaymentReminder = async (req, res) => {
  try {
    const payment = await FeePayment.findById(req.params.id)
      .populate("student", "firstName lastName email")
      .populate("feeStructure", "feeName");

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const html = `
      <h2>Fee Payment Reminder</h2>
      <p>Dear ${payment.student.firstName} ${payment.student.lastName},</p>
      <p>This is a friendly reminder about your pending fee payment:</p>
      <ul>
        <li><strong>Fee:</strong> ${payment.feeStructure.feeName}</li>
        <li><strong>Invoice:</strong> ${payment.invoiceNumber}</li>
        <li><strong>Amount:</strong> PKR ${payment.totalAmount}</li>
        <li><strong>Due Date:</strong> ${new Date(payment.dueDate).toLocaleDateString()}</li>
        <li><strong>Balance:</strong> PKR ${payment.balance}</li>
      </ul>
      <p>Please make the payment at your earliest convenience.</p>
      <p>Thank you!</p>
    `;

    await sendEmail({
      to: payment.student.email,
      subject: `Fee Payment Reminder - ${payment.invoiceNumber}`,
      html,
    });

    res.json({ message: "Reminder sent successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
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
};


import mongoose from "mongoose";

const feePaymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    lateFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    balance: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    paidDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank-transfer", "cheque", "online", "stripe", "paypal"],
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "overdue", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    stripePaymentIntentId: {
      type: String,
    },
    paypalOrderId: {
      type: String,
    },
    receiptNumber: {
      type: String,
    },
    receiptPath: {
      type: String,
    },
    remarks: {
      type: String,
      trim: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["1st", "2nd", "3rd", "annual"],
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total and balance before saving
feePaymentSchema.pre("save", function (next) {
  this.totalAmount = this.amount + this.lateFee - this.discount;
  this.balance = this.totalAmount - this.amountPaid;
  
  // Update payment status
  if (this.balance <= 0) {
    this.paymentStatus = "paid";
  } else if (this.amountPaid > 0) {
    this.paymentStatus = "partial";
  } else if (new Date() > this.dueDate) {
    this.paymentStatus = "overdue";
  } else {
    this.paymentStatus = "pending";
  }
  
  next();
});

// Index for efficient queries
feePaymentSchema.index({ student: 1, academicYear: 1 });
feePaymentSchema.index({ paymentStatus: 1 });
feePaymentSchema.index({ dueDate: 1 });

const FeePayment = mongoose.model("FeePayment", feePaymentSchema);

export default FeePayment;


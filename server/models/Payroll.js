import mongoose from "mongoose";

const payrollSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    payrollNumber: {
      type: String,
      unique: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    
    // Salary Components
    basicSalary: {
      type: Number,
      required: true,
      default: 0,
    },
    allowances: {
      houseRent: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      medical: { type: Number, default: 0 },
      special: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    bonuses: {
      type: Number,
      default: 0,
    },
    
    // Deductions
    deductions: {
      tax: { type: Number, default: 0 },
      providentFund: { type: Number, default: 0 },
      insurance: { type: Number, default: 0 },
      loan: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    
    // Attendance
    workingDays: {
      type: Number,
      required: true,
    },
    presentDays: {
      type: Number,
      required: true,
    },
    absentDays: {
      type: Number,
      default: 0,
    },
    leaves: {
      type: Number,
      default: 0,
    },
    
    // Calculations
    grossSalary: {
      type: Number,
      default: 0,
    },
    totalDeductions: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
      default: 0,
    },
    
    // Payment
    paymentMethod: {
      type: String,
      enum: ["cash", "bank-transfer", "cheque"],
      default: "bank-transfer",
    },
    paymentDate: Date,
    transactionId: String,
    status: {
      type: String,
      enum: ["pending", "processed", "paid", "hold"],
      default: "pending",
    },
    
    // Notes
    notes: String,
    
    // Metadata
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approvedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Auto-calculate salaries before saving
payrollSchema.pre("save", function (next) {
  // Calculate gross salary
  this.grossSalary =
    this.basicSalary +
    (this.allowances.houseRent || 0) +
    (this.allowances.transport || 0) +
    (this.allowances.medical || 0) +
    (this.allowances.special || 0) +
    (this.allowances.other || 0) +
    (this.bonuses || 0);

  // Calculate total deductions
  this.totalDeductions =
    (this.deductions.tax || 0) +
    (this.deductions.providentFund || 0) +
    (this.deductions.insurance || 0) +
    (this.deductions.loan || 0) +
    (this.deductions.absent || 0) +
    (this.deductions.late || 0) +
    (this.deductions.other || 0);

  // Calculate net salary
  this.netSalary = this.grossSalary - this.totalDeductions;

  next();
});

// Generate payroll number
payrollSchema.pre("save", async function (next) {
  if (!this.payrollNumber) {
    const year = this.year;
    const month = String(this.month).padStart(2, "0");
    const count = await mongoose.model("Payroll").countDocuments({
      month: this.month,
      year: this.year,
    });
    this.payrollNumber = `PAY${year}${month}${String(count + 1).padStart(4, "0")}`;
  }
  next();
});

const Payroll = mongoose.model("Payroll", payrollSchema);

export default Payroll;


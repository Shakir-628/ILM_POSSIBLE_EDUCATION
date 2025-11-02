import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "salary",
        "utilities",
        "maintenance",
        "supplies",
        "equipment",
        "transport",
        "food",
        "marketing",
        "events",
        "other",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    expenseDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank-transfer", "cheque", "card"],
      required: true,
    },
    paidTo: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
      },
    ],
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "paid", "cancelled"],
      default: "pending",
    },
    academicYear: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
expenseSchema.index({ category: 1, expenseDate: -1 });
expenseSchema.index({ status: 1 });
expenseSchema.index({ academicYear: 1 });

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;


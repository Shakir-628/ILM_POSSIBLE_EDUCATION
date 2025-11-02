import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: [
        "fee-payment",
        "donation",
        "event",
        "rental",
        "government-grant",
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
    incomeDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank-transfer", "cheque", "online", "card"],
      required: true,
    },
    receivedFrom: {
      type: String,
      required: true,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    feePayment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeePayment",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
incomeSchema.index({ category: 1, incomeDate: -1 });
incomeSchema.index({ academicYear: 1 });

const Income = mongoose.model("Income", incomeSchema);

export default Income;


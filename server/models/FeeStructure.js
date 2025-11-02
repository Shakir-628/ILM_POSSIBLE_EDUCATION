import mongoose from "mongoose";

const feeStructureSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    feeType: {
      type: String,
      enum: ["tuition", "admission", "exam", "library", "transport", "hostel", "sports", "other"],
      required: true,
    },
    feeName: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ["one-time", "monthly", "quarterly", "semi-annual", "annual"],
      default: "monthly",
    },
    dueDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 10,
    },
    isOptional: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
feeStructureSchema.index({ class: 1, academicYear: 1 });
feeStructureSchema.index({ status: 1 });

const FeeStructure = mongoose.model("FeeStructure", feeStructureSchema);

export default FeeStructure;


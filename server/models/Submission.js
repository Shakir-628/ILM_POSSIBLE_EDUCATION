import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    files: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["submitted", "graded", "late", "resubmitted"],
      default: "submitted",
    },
    marks: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    gradedAt: {
      type: Date,
    },
    comments: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate submissions
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
submissionSchema.index({ assignment: 1, status: 1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;

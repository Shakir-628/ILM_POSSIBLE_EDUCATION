import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    entity: {
      type: String,
      required: true,
      enum: [
        "User",
        "Student",
        "Teacher",
        "Class",
        "Subject",
        "Attendance",
        "Assignment",
        "Submission",
        "Grade",
        "Announcement",
        "Message",
        "Notification",
        "FeeStructure",
        "FeePayment",
        "Expense",
        "Income",
        "Parent",
        "Admission",
        "Timetable",
        "Event",
        "ExamSchedule",
        "ReportCard",
        "Performance",
        "Payroll",
      ],
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "login", "logout"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changes: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Index for efficient querying
auditLogSchema.index({ entity: 1, entityId: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;

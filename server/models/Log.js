import mongoose from "mongoose";

const logSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      enum: ["info", "warn", "error", "debug", "critical"],
      default: "info",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "auth",
        "database",
        "api",
        "system",
        "security",
        "user-action",
        "error",
        "performance",
        "other",
      ],
      default: "other",
    },
    
    // Request details
    method: String, // GET, POST, PUT, DELETE
    url: String,
    statusCode: Number,
    responseTime: Number, // in milliseconds
    
    // User details
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userEmail: String,
    userRole: String,
    ip: String,
    userAgent: String,
    
    // Error details (if error)
    errorStack: String,
    errorCode: String,
    
    // Additional metadata
    metadata: mongoose.Schema.Types.Mixed,
    
    // Action performed
    action: String, // e.g., "login", "create-student", "update-grade"
    resource: String, // e.g., "student", "teacher", "grade"
    resourceId: String,
    
    // Result
    success: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
logSchema.index({ level: 1, createdAt: -1 });
logSchema.index({ user: 1, createdAt: -1 });
logSchema.index({ category: 1, createdAt: -1 });
logSchema.index({ createdAt: -1 });
logSchema.index({ action: 1 });

// Auto-delete logs older than 90 days (optional)
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

const Log = mongoose.model("Log", logSchema);

export default Log;


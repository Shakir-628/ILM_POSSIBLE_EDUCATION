import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "info",
        "success",
        "warning",
        "error",
        "announcement",
        "grade",
        "attendance",
        "fee",
        "assignment",
        "exam",
        "message",
      ],
      default: "info",
    },
    
    // Link/Action
    link: String,
    actionText: String,
    
    // Related entities
    relatedEntity: {
      type: String,
      enum: ["student", "teacher", "class", "grade", "attendance", "fee", "assignment", "exam", "message"],
    },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    
    // Status
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    
    // Metadata
    metadata: mongoose.Schema.Types.Mixed,
    
    // Expiry (optional)
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Auto-delete expired notifications
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;


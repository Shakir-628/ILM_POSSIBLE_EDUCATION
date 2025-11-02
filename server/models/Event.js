import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Event title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "academic",
        "sports",
        "cultural",
        "holiday",
        "exam",
        "meeting",
        "parent-teacher",
        "workshop",
        "celebration",
        "other",
      ],
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String, // Format: "09:00"
    },
    endTime: {
      type: String, // Format: "17:00"
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    
    // Location
    venue: {
      type: String,
      trim: true,
    },
    
    // Participants
    targetAudience: {
      type: [String],
      enum: ["all", "students", "teachers", "parents", "admin", "staff"],
      default: ["all"],
    },
    specificClasses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Class",
      },
    ],
    
    // Event details
    organizer: {
      type: String,
      trim: true,
    },
    contactPerson: {
      name: String,
      phone: String,
      email: String,
    },
    
    // Status
    status: {
      type: String,
      enum: ["scheduled", "ongoing", "completed", "cancelled", "postponed"],
      default: "scheduled",
    },
    
    // Registration
    requiresRegistration: {
      type: Boolean,
      default: false,
    },
    maxParticipants: {
      type: Number,
    },
    registeredParticipants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Notifications
    sendNotification: {
      type: Boolean,
      default: true,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    
    // Attachments
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    
    // Metadata
    color: {
      type: String,
      default: "#3b82f6", // Blue
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient date-based queries
eventSchema.index({ startDate: 1, endDate: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ status: 1 });

const Event = mongoose.model("Event", eventSchema);

export default Event;


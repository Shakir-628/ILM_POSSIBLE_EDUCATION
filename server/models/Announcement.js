import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    audience: {
      type: {
        type: String,
        enum: ["all", "classes", "roles"],
        default: "all",
      },
      classes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
      ],
      roles: [
        {
          type: String,
          enum: ["admin", "teacher", "student"],
        },
      ],
    },
    attachments: [
      {
        filename: String,
        path: String,
        mimetype: String,
        size: Number,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
    expiresAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
announcementSchema.index({ pinned: -1, createdAt: -1 });
announcementSchema.index({ "audience.classes": 1 });
announcementSchema.index({ status: 1 });

const Announcement = mongoose.model("Announcement", announcementSchema);

export default Announcement;

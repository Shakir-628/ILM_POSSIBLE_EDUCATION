import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Resource title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["document", "note", "link", "video", "other"],
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    file: {
      filename: String,
      path: String,
      mimetype: String,
      size: Number,
      uploadedAt: {
        type: Date,
      },
    },
    externalUrl: {
      type: String, // For YouTube links, etc.
    },
    isPublic: {
      type: Boolean,
      default: false, // If true, maybe all students can see? But requirement says relevant to their class.
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

// Indexes
resourceSchema.index({ class: 1, subject: 1 });
resourceSchema.index({ teacher: 1 });

const Resource = mongoose.model("Resource", resourceSchema);

export default Resource;

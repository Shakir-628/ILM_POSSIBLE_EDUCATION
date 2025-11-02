import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    guardianName: {
      type: String,
      required: true,
    },
    guardianPhone: {
      type: String,
      required: true,
    },
    guardianEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "graduated", "transferred"],
      default: "active",
    },
    profileImage: {
      type: String,
      default: "",
    },
    qrCode: {
      type: String,
      default: "",
    },
    documents: [
      {
        documentType: {
          type: String,
          enum: ["birth-certificate", "id-card", "photo", "medical", "previous-school", "other"],
        },
        filename: String,
        path: String,
        mimetype: String,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parent",
    },
    previousClass: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
    },
    promotionHistory: [
      {
        fromClass: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
        toClass: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Class",
        },
        promotionDate: Date,
        academicYear: String,
        promotedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    transferHistory: [
      {
        fromSchool: String,
        toSchool: String,
        transferDate: Date,
        reason: String,
        transferredBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Student = mongoose.model("Student", studentSchema);

export default Student;


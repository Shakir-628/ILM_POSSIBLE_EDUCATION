import mongoose from "mongoose";

const teacherAttendanceSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "on-leave", "half-day"],
      required: true,
      default: "present",
    },
    checkIn: {
      type: String, // format: "HH:mm"
    },
    checkOut: {
      type: String, // format: "HH:mm"
    },
    remarks: {
      type: String,
      trim: true,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Usually an admin
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate attendance records for a teacher on the same date
teacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

const TeacherAttendance = mongoose.model("TeacherAttendance", teacherAttendanceSchema);

export default TeacherAttendance;

import mongoose from "mongoose";

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, "Class name is required"],
      trim: true,
      unique: true,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
    },
    section: {
      type: String,
      required: [true, "Section is required"],
      trim: true,
    },
    classTeacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    capacity: {
      type: Number,
      default: 30,
    },
    room: {
      type: String,
      trim: true,
    },
    schedule: {
      type: String,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Class = mongoose.model("Class", classSchema);

export default Class;


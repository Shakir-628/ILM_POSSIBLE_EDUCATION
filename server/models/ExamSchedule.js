import mongoose from "mongoose";

const examScheduleSchema = new mongoose.Schema(
  {
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ["mid-term", "final", "quiz", "test", "annual", "monthly"],
      required: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    academicYear: {
      type: String,
      required: true,
    },
    term: {
      type: String,
      enum: ["1st", "2nd", "3rd", "annual"],
    },
    
    // Exam Schedule
    schedule: [
      {
        subject: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Subject",
          required: true,
        },
        examDate: {
          type: Date,
          required: true,
        },
        startTime: {
          type: String,
          required: true,
        },
        endTime: {
          type: String,
          required: true,
        },
        duration: {
          type: Number, // in minutes
          required: true,
        },
        totalMarks: {
          type: Number,
          required: true,
          default: 100,
        },
        roomNumber: String,
        invigilator: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Teacher",
        },
        instructions: String,
      },
    ],
    
    // General Instructions
    generalInstructions: String,
    
    // Status
    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed", "cancelled"],
      default: "draft",
    },
    
    // Notifications
    notifyStudents: {
      type: Boolean,
      default: true,
    },
    notifyTeachers: {
      type: Boolean,
      default: true,
    },
    notifyParents: {
      type: Boolean,
      default: true,
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

// Index for efficient queries
examScheduleSchema.index({ class: 1, academicYear: 1 });
examScheduleSchema.index({ status: 1 });

const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);

export default ExamSchedule;


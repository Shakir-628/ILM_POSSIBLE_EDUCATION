import mongoose from "mongoose";

const timetableSchema = new mongoose.Schema(
  {
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
      default: "1st",
    },
    
    // Timetable slots
    schedule: [
      {
        day: {
          type: String,
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          required: true,
        },
        periods: [
          {
            periodNumber: {
              type: Number,
              required: true,
            },
            startTime: {
              type: String,
              required: true, // Format: "08:00"
            },
            endTime: {
              type: String,
              required: true, // Format: "08:45"
            },
            subject: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Subject",
              default: null,
            },
            teacher: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Teacher",
              default: null,
            },
            roomNumber: String,
            periodType: {
              type: String,
              enum: ["lecture", "lab", "break", "sports", "library", "assembly"],
              default: "lecture",
            },
          },
        ],
      },
    ],
    
    // Break timings
    breaks: [
      {
        name: String, // e.g., "Short Break", "Lunch Break"
        startTime: String,
        endTime: String,
        duration: Number, // in minutes
      },
    ],
    
    isActive: {
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

// Compound index for unique timetable per class per year
timetableSchema.index({ class: 1, academicYear: 1, term: 1 }, { unique: true });

const Timetable = mongoose.model("Timetable", timetableSchema);

export default Timetable;

